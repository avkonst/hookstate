import React from 'react';
import BroadcastChannel from 'broadcast-channel';
import LeaderElection, { LeaderElector } from 'broadcast-channel/leader-election';
import { useStateLink, Path, StateValueAtPath, StateLink } from '@hookstate/core';
import * as idb from 'idb';
import { number } from 'prop-types';

interface BroadcastChannelHandle<T> {
    channel: BroadcastChannel<T>,
    elector: LeaderElector
}
function subscribeBroadcastChannel<T>(
    topic: string,
    onMessage: (m: T) => void,
    onLeader: () => void): BroadcastChannelHandle<T> {
    const channel = new BroadcastChannel<T>(topic);
    channel.onmessage = (m) => onMessage(m);
    const elector = LeaderElection.create(channel);
    elector.awaitLeadership().then(() => onLeader())
    return {
        channel,
        elector
    }
}
function unsubscribeBroadcastChannel<T>(handle: BroadcastChannelHandle<T>) {
    handle.channel.onmessage = null;
    handle.elector.die().then(() => handle.channel.close())
}
function useBroadcastChannel<T>(
    topic: string,
    onMessage: (m: T) => void,
    onLeader: () => void) {
    const handleRef = React.useRef<BroadcastChannelHandle<T>>()
    React.useEffect(() => {
        const handle = subscribeBroadcastChannel<T>(topic, onMessage, onLeader)
        handleRef.current = handle;
        return () => unsubscribeBroadcastChannel(handle)
        // Callbacks are different on every call
        // but broadcast setup is expensive.
        // Assume a client does not modify the callbacks,
        // but modifies the topic only
        // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, [topic])
    return (message: T) => handleRef.current!.channel.postMessage(message);
}

interface StateHandle {
    db: idb.IDBPDatabase<any>,
    topic: string
}
async function openState(topic: string, initial: any): Promise<StateHandle> {
    const dbRef = idb.openDB(topic, 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            db.createObjectStore(topic, { autoIncrement: true })
            transaction.objectStore(topic).put({
                edition: 0,
                data: initial
            }, 'state')
            transaction.done.then(() => {
                console.log('[hookstate][persistence]: store created:', topic)
            })
        }
    })
    const db = await dbRef;
    return {
        db,
        topic
    }
}
function closeState(stateHandle: Promise<StateHandle>) {
    stateHandle.then(d => d.db.close());
}
async function loadState(stateHandle: Promise<StateHandle>) {
    const database = (await stateHandle).db;
    const topic = (await stateHandle).topic;
    const persistedState = await database.get(topic, 'state')

    const compactedEdition = persistedState.edition;
    let loadedEdition: number = compactedEdition;
    let state = persistedState.data;
    const readTx = database.transaction(topic, 'readonly')
    const readStore = readTx.objectStore(topic)
    do {
        const record: StateLinkUpdateRecord = await readStore.get(loadedEdition + 1)
        if (record === undefined) {
            break;
        }
        if (record.path.length === 0) {
            state = record.value;
        }
        let result = state;
        record.path.forEach((p, i) => {
            if (result !== undefined) {
                if (i === record.path.length - 1) {
                    result[p] = record.value;
                } else {
                    result = result[p];
                }
            } else {
                console.warn('Can not load update at path:', record.path, p, i)
            }
        });
        loadedEdition += 1;
    } while(true)
    await readTx.done
    
    return {
        state: state,
        loadedEdition: loadedEdition,
        compactedEdition: compactedEdition
    }
}
async function compactStateUpdates(dbRef: Promise<StateHandle>, upto: number) {
    const database = (await dbRef).db;
    const topic = (await dbRef).topic;
    const persistedState = await database.get(topic, 'state')
    const currentEdition: number = persistedState.edition;
    let persisted = persistedState.data;
    
    const readTx = database.transaction(topic, 'readonly')
    const readStore = readTx.objectStore(topic)
    for (let i = currentEdition + 1; i <= upto; i += 1) {
        const record: StateLinkUpdateRecord = await readStore.get(i)
        if (record.path.length === 0) {
            persisted = record.value;
        }
        let result = persisted;
        record.path.forEach((p, i) => {
            if (result !== undefined) {
                if (i === record.path.length - 1) {
                    result[p] = record.value;
                } else {
                    result = result[p];
                }
            } else {
                console.warn('Can not merge update at path:', record.path, p, i)
            }
        });
    }
    await readTx.done
    
    const writeTx = database.transaction(topic, 'readwrite')
    const writeStore = writeTx.objectStore(topic)
    await writeStore.put({
        edition: upto,
        data: persisted
    }, 'state')
    await writeStore.delete(IDBKeyRange.bound(currentEdition + 1, upto))
    await writeTx.done
}
async function loadStateUpdates(dbRef: Promise<StateHandle>, from: number, upto: number) {
    const database = (await dbRef).db;
    const topic = (await dbRef).topic;
    const readTx = database.transaction(topic, 'readonly')
    const readStore = readTx.objectStore(topic)
    readStore.getAll(IDBKeyRange.bound(from, upto))
    await readTx.done
}
async function persistStateUpdate(dbRef: Promise<StateHandle>, update: StateLinkUpdateRecord): Promise<number> {
    const database = (await dbRef).db;
    const topic = (await dbRef).topic;
    return database.put(topic, update)
}

interface StateLinkUpdateRecord {
    readonly path: Path,
    readonly value: StateValueAtPath
}

interface StateLinkUpdateRecordPersisted extends StateLinkUpdateRecord {
    readonly edition: number;
}

const LocalSyncBroadcastPluginID = Symbol('LocalSyncBroadcastPluginID')

export function useStateLinkSynchronised<T>(
    topic: string, initial: T,
    onLeader?: () => void,
    onSync?: (path: Path, newValue: StateValueAtPath, prevValue: StateValueAtPath) => Promise<boolean>): {
    isLoading: boolean,
    state: StateLink<T>
} {
    const [, forceUpdate] = React.useState()
    const state = useStateLink(initial)

    const meta = React.useRef<{
        stateRef: StateLink<T>,
        dbRef: Promise<StateHandle> | undefined,
        loadedEdition: number,
        compactedEdition: number,
        compactedTimestamp: number,
        compactionRunning: boolean,
        synchronizationRunning: boolean,
        deferredNotifications: StateLinkUpdateRecordPersisted[],
        isLeader: boolean,
        notificationsEnabled: boolean
    }>({
        stateRef: state,
        dbRef: undefined,
        loadedEdition: -1,
        compactedEdition: -1,
        compactedTimestamp: 0,
        compactionRunning: false,
        synchronizationRunning: false,
        deferredNotifications: [],
        isLeader: false,
        notificationsEnabled: true
    })
    meta.current.stateRef = state

    function isLoading() {
        return meta.current.loadedEdition === -1
    }
    
    function disableNotifications(action: () => void) {
        meta.current.notificationsEnabled = false;
        try {
            action();
        } finally {
            meta.current.notificationsEnabled = true;
        }
    }
    
    function applyUpdate(record: StateLinkUpdateRecordPersisted) {
        if (isLoading()) {
            meta.current.deferredNotifications.push(record)
            return;
        }
        if (meta.current.loadedEdition >= record.edition) {
            // this can happen, because the loadState could have loaded a record,
            // which we received here
            return;
        }
        
        disableNotifications(() => {
            let targetState = meta.current.stateRef;
            for (let i = 0; i < record.path.length; i += 1) {
                const p = record.path[i];
                const nested = targetState.nested
                if (nested) {
                    targetState = nested[p]
                } else {
                    console.warn('Can not apply update at path:', record.path, meta.current.stateRef.get());
                    return;
                }
            }
            targetState.set(record.value)
        })
        
        triggerCompaction(record.edition);
    }
    
    function triggerCompaction(observedEdition: number) {
        if (!meta.current.isLeader) {
            return;
        }
        if (observedEdition - meta.current.compactedEdition < 100) {
            return;
        }
        if (!meta.current.dbRef) {
            return;
        }
        if (meta.current.compactionRunning) {
            return;
        }
        const currentTimestamp = (new Date).getTime()
        if (currentTimestamp - meta.current.compactedTimestamp < 60000) {
            return;
        }
        meta.current.compactionRunning = true;
        compactStateUpdates(meta.current.dbRef!, observedEdition).then(() => {
            meta.current.compactionRunning = false;
        }).catch((err) => {
            meta.current.compactionRunning = false;
            console.error(err)
        })
        meta.current.compactedEdition = observedEdition
        meta.current.compactedTimestamp = currentTimestamp
    }
    
    function triggerSynchronization() {
        if (!onSync) {
            return;
        }
        if (!meta.current.isLeader) {
            return;
        }
        if (meta.current.synchronizationRunning) {
            return;
        }
        meta.current.synchronizationRunning = true;
        onSync([], 1, 1).then(() => {
            meta.current.synchronizationRunning = false;
        }).catch((err) => {
            meta.current.synchronizationRunning = false;
            console.error(err)
        })
    }

    const broadcast = useBroadcastChannel<StateLinkUpdateRecordPersisted>(
        topic, applyUpdate, () => {
            meta.current.isLeader = true
            if (onLeader) {
                onLeader()
            }
        }
    )

    React.useEffect(() => {
        let db = openState(topic, initial) 
        loadState(db).then(s => {
            disableNotifications(() => meta.current.stateRef.set(s.state))
            meta.current.loadedEdition = s.loadedEdition;
            meta.current.compactedEdition = s.compactedEdition;
            meta.current.deferredNotifications.forEach(applyUpdate)
            meta.current.deferredNotifications = []
            forceUpdate(true)
        })
        meta.current.dbRef = db
        return () => closeState(db)
        // Callbacks are different on every call
        // but database setup is expensive.
        // Assume a client does not modify the callbacks,
        // but modifies the topic only
        // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, [topic])

    state.with(() => ({
        id: LocalSyncBroadcastPluginID,
        instanceFactory: () => {
            return {
                onSet: (path, newState, newValue) => {
                    if (meta.current.notificationsEnabled) {
                        // this instance has been updated, so notify peers
                        const update = {
                            path: path,
                            value: newValue
                        }
                        persistStateUpdate(meta.current.dbRef!, update)
                            .then((edition) => broadcast({ ...update, edition })
                                .then(() => triggerCompaction(edition)))
                    }
                }
            }
        }
    }))
    
    return {
        isLoading: isLoading(),
        state: state
    }
}

interface Task { name: string }

export const ExampleComponent = () => {
    const { isLoading, state } = useStateLinkSynchronised('plugin-persisted-data-key-6',
        [{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
    if (isLoading) {
        return <p>Loading offline data...</p>
    }
    return <>
        {state.nested.map((taskState, taskIndex) => {
            return <p key={taskIndex}>
                <input
                    value={taskState.nested.name.get()}
                    onChange={e => taskState.nested.name.set(e.target.value)}
                />
            </p>
        })}
        <p><button onClick={() => state.set(tasks => tasks.concat([{ name: 'Untitled' }]))}>
            Add task
        </button></p> 
    </>
}

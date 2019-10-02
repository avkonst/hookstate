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
            transaction.objectStore(topic).put({
                edition: 0
            }, 'sync')
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
    console.log('loading state updates', from, upto)
    const database = (await dbRef).db;
    const topic = (await dbRef).topic;
    const readTx = database.transaction(topic, 'readonly')
    const readStore = readTx.objectStore(topic)
    const result = await readStore.getAll(IDBKeyRange.bound(from, upto))
    await readTx.done
    return result.map((r, i) => ({ ...r, edition: (i + from)})) as StateLinkUpdateRecordPersisted[];
}
async function saveStateUpdate(dbRef: Promise<StateHandle>, update: StateLinkUpdateRecord): Promise<number> {
    const database = (await dbRef).db;
    const topic = (await dbRef).topic;
    return database.put(topic, update)
}
async function loadStateSync(stateHandle: Promise<StateHandle>) {
    const database = (await stateHandle).db;
    const topic = (await stateHandle).topic;
    const syncState = await database.get(topic, 'sync')
    return {
        synchronizedEdition: syncState.edition
    }
}
async function saveStateSync(stateHandle: Promise<StateHandle>, latestSynchronizedEdition: number) {
    const database = (await stateHandle).db;
    const topic = (await stateHandle).topic;
    await database.put(topic, {
        edition: latestSynchronizedEdition
    }, 'sync')
    return
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
    onSync?: (updates: StateLinkUpdateRecordPersisted[]) => Promise<boolean>): {
    isLoading: boolean,
    state: StateLink<T>
} {
    const [, forceUpdate] = React.useState()
    const state = useStateLink(initial)

    const meta = React.useRef<{
        stateRef: StateLink<T>,
        dbRef: Promise<StateHandle> | undefined,

        initiallyLoadedEdition: number,
        updatesCapturedDuringStateLoading: StateLinkUpdateRecordPersisted[],

        latestCompactedEdition: number,
        latestCompactedTimestamp: number,
        isCompactionRunning: boolean,

        latestObservedEdition: number,
        updatesCapturedDuringLeaderLoading: StateLinkUpdateRecordPersisted[],
        updatesPendingSynchronization: StateLinkUpdateRecordPersisted[],

        latestSynchronizedEdition: number,
        isSynchronizationRunning: boolean,

        updatesTrackingEnabled: boolean,
    }>({
        stateRef: state,
        dbRef: undefined,

        initiallyLoadedEdition: -1,
        updatesCapturedDuringStateLoading: [],

        latestCompactedEdition: -1,
        latestCompactedTimestamp: 0,
        isCompactionRunning: false,

        latestObservedEdition: -1,
        updatesCapturedDuringLeaderLoading: [],
        updatesPendingSynchronization: [],

        latestSynchronizedEdition: -2, // see states and transitions below
        isSynchronizationRunning: false,

        updatesTrackingEnabled: true,
    })
    meta.current.stateRef = state

    // transitions 1): Loading (false) -> Loaded (true)
    function isStateLoaded() {
        return meta.current.initiallyLoadedEdition !== -1
    }

    // transitions 2): Not Elected (undefined) -> Loading & Elected (false) -> Loaded & Elected (true)
    function isLeaderLoaded() {
        if (meta.current.latestSynchronizedEdition === -2) return undefined;
        if (meta.current.latestSynchronizedEdition === -1) return false;
        return true;
    }
    
    function runWithUpdatesTrackingDisabled(action: () => void) {
        meta.current.updatesTrackingEnabled = false;
        try {
            action();
        } finally {
            meta.current.updatesTrackingEnabled = true;
        }
    }
    
    function processUnsyncedUpdate(record: StateLinkUpdateRecordPersisted) {
        // updates can come out of order
        
        console.log('processUnsyncedUpdate', record)
        
        meta.current.latestObservedEdition = Math.max(meta.current.latestObservedEdition, record.edition)

        if (isLeaderLoaded() === undefined) {
            console.log('processUnsyncedUpdate: leader undefined')
            return;
        }

        if (!isStateLoaded()) {
            console.log('processUnsyncedUpdate: leader loading')
            meta.current.updatesCapturedDuringLeaderLoading.push(record)
            return;
        }
        
        meta.current.updatesPendingSynchronization.push(record)
        if (meta.current.isSynchronizationRunning) {
            console.log('processUnsyncedUpdate: already running')
            return;
        }

        function compact(upto: number) {
            console.log('processUnsyncedUpdate: compacting', upto)

            const observedEdition = upto;
            if (observedEdition - meta.current.latestCompactedEdition < 100) {
                return;
            }
            if (!meta.current.dbRef) {
                return;
            }
            if (meta.current.isCompactionRunning) {
                return;
            }
            const currentTimestamp = (new Date).getTime()
            if (currentTimestamp - meta.current.latestCompactedTimestamp < 60000) {
                return;
            }
            meta.current.isCompactionRunning = true;
            compactStateUpdates(meta.current.dbRef!, observedEdition).then(() => {
                meta.current.isCompactionRunning = false;
            }).catch((err) => {
                meta.current.isCompactionRunning = false;
                console.error(err)
            })
            meta.current.latestCompactedEdition = observedEdition
            meta.current.latestCompactedTimestamp = currentTimestamp
        }
        
        async function sync() {
            console.log('processUnsyncedUpdate: syncing')

            const recordsToSync = meta.current.updatesPendingSynchronization
            const pendingEditions = meta.current.updatesPendingSynchronization.map(i => i.edition)
                .sort((a, b) => a - b)
            const latestEdition = pendingEditions[pendingEditions.length - 1]
            if (pendingEditions.find(
                    (e, i) => e - meta.current.latestSynchronizedEdition !== i + 1) !== undefined) {
                // some are out of order, wait until it lines up
                console.warn('out of order updates received, postponing sync until gaps are closed',
                meta.current.latestSynchronizedEdition, pendingEditions)
                return;
            }

            console.log('processUnsyncedUpdate: syncing editions', pendingEditions)

            meta.current.updatesPendingSynchronization = []
            meta.current.latestSynchronizedEdition = latestEdition
            
            meta.current.isSynchronizationRunning = true;
            if (onSync) {
                try {
                    console.log('processUnsyncedUpdate: syncing records', recordsToSync)
                    await onSync(recordsToSync)
                } catch (err) {
                    console.error(err)
                }
            }
            console.log('processUnsyncedUpdate: saving sync', latestEdition)
            await saveStateSync(meta.current.dbRef!, latestEdition)
            meta.current.isSynchronizationRunning = false;
            
            compact(latestEdition)
            
            if (meta.current.updatesPendingSynchronization.length > 0) {
                console.log('processUnsyncedUpdate: running again')
                sync()
            }
        }
        
        sync()
    }
    
    function processBroadcastedUpdate(record: StateLinkUpdateRecordPersisted) {
        if (!isStateLoaded()) {
            meta.current.updatesCapturedDuringStateLoading.push(record)
            return;
        }
        if (meta.current.initiallyLoadedEdition >= record.edition) {
            // this can happen, because the loadState could have loaded a record,
            // which we received here
            return;
        }
        // also updates can come here out of order, it is acceptable
        
        runWithUpdatesTrackingDisabled(() => {
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
        
        processUnsyncedUpdate(record);
    }
    
    function activateWhenLoaded(s: {
        state: any;
        loadedEdition: number;
        compactedEdition: number;
    }) {
        runWithUpdatesTrackingDisabled(() => meta.current.stateRef.set(s.state))
        meta.current.initiallyLoadedEdition = s.loadedEdition;
        meta.current.latestCompactedEdition = s.compactedEdition;
        meta.current.updatesCapturedDuringStateLoading.forEach(processBroadcastedUpdate)
        meta.current.updatesCapturedDuringStateLoading = []
        if (isLeaderLoaded() !== undefined) {
            activateWhenElected()
        }
        forceUpdate(true)
    }
    
    function activateWhenElected() {
        meta.current.latestSynchronizedEdition = -1 // elected & loading state
        if (!isStateLoaded()) {
            return;
        }
        loadStateSync(meta.current.dbRef!).then(i => {
            loadStateUpdates(meta.current.dbRef!,
                i.synchronizedEdition + 1,
                Math.max(
                    meta.current.latestObservedEdition,
                    i.synchronizedEdition + 1,
                    meta.current.initiallyLoadedEdition))
                .then(updates => {
                    meta.current.latestSynchronizedEdition = i.synchronizedEdition
                    updates.forEach(processUnsyncedUpdate)
                    meta.current.updatesCapturedDuringLeaderLoading
                        // it could receive the same updates while they are being loaded
                        .filter(u => !updates.find(i => i.edition === u.edition))
                        .forEach(processUnsyncedUpdate)
                    meta.current.updatesCapturedDuringLeaderLoading = []
                })
        })
        if (onLeader) {
            onLeader()
        }
    }
    
    const broadcast = useBroadcastChannel<StateLinkUpdateRecordPersisted>(
        topic, processBroadcastedUpdate, activateWhenElected)

    React.useEffect(() => {
        let db = openState(topic, initial) 
        meta.current.dbRef = db
        loadState(db).then(s => activateWhenLoaded(s))
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
                    if (meta.current.updatesTrackingEnabled) {
                        // this instance has been updated, so notify peers
                        const update = {
                            path: path,
                            value: newValue
                        }
                        saveStateUpdate(meta.current.dbRef!, update)
                            .then((edition) => {
                                const persistedUpdate = { ...update, edition }
                                processUnsyncedUpdate(persistedUpdate)
                                broadcast(persistedUpdate)
                            })
                    }
                }
            }
        }
    }))
    
    return {
        isLoading: !isStateLoaded(),
        state: state
    }
}

interface Task { name: string }

export const ExampleComponent = () => {
    const { isLoading, state } = useStateLinkSynchronised(
        'plugin-persisted-data-key-6',
        [{ name: 'First Task' }, { name: 'Second Task' }] as Task[],
        () => console.log('This is the leader'),
        (updates) => {
            console.log('request to sync', updates)
            return new Promise<boolean>((resolve, reject) => {
                setTimeout(() => resolve(true), 1000)
            })
        }
    )
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

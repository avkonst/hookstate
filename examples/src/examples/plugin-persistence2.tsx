import React from 'react';
import BroadcastChannel from 'broadcast-channel';
import LeaderElection, { LeaderElector } from 'broadcast-channel/leader-election';
import { useStateLink, Path, StateValueAtPath, Plugin, StateLink, createStateLink, useStateLinkUnmounted, PluginInstance, StateValueAtRoot, StateInf } from '@hookstate/core';
import * as idb from 'idb';

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

export interface SynchronisationStatus {
    isLoading(): boolean;
    isSynchronising(): boolean;
}

export interface SynchronisedExtensions {
    set(): void;
    status(): StateInf<SynchronisationStatus>
}

const PluginID = Symbol('Synchronised');

class SynchronisedPluginInstance implements PluginInstance {
    private broadcastRef: BroadcastChannelHandle<StateLinkUpdateRecordPersisted>;
    private dbRef: Promise<StateHandle>;
    private onSetCallback: (path: readonly (string | number)[], newState: any, newValue: any) => void;
    private metaInf: StateInf<SynchronisationStatus>;
    
    constructor(
        topic: string,
        unmountedLink: StateLink<StateValueAtRoot>,
        onLeader?: () => void,
        onSync?: (updates: StateLinkUpdateRecordPersisted[]) => Promise<boolean>
    ) {
        const self = this;
        
        const metaStateRef = createStateLink<{
            initiallyLoadedEdition: number,
            isSynchronizationRunning: boolean
        }>({
            initiallyLoadedEdition: -1,
            isSynchronizationRunning: false,
        });
        const metaState = useStateLinkUnmounted(metaStateRef);
        
        let updatesCapturedDuringStateLoading: StateLinkUpdateRecordPersisted[] = [];
        let latestCompactedEdition = -1;
        let latestCompactedTimestamp = 0;
        let isCompactionRunning = false;
        let latestObservedEdition = -1;
        let updatesCapturedDuringLeaderLoading: StateLinkUpdateRecordPersisted[] = [];
        let updatesPendingSynchronization: StateLinkUpdateRecordPersisted[] = [];

        let latestSynchronizedEdition = -2; // see states and transitions below
        let updatesTrackingEnabled = true;
        
        // transitions 1): Loading (false) -> Loaded (true)
        function isStateLoaded() {
            return metaState.value.initiallyLoadedEdition !== -1
        }

        // transitions 2): Not Elected (undefined) -> Loading & Elected (false) -> Loaded & Elected (true)
        function isLeaderLoaded() {
            if (latestSynchronizedEdition === -2) return undefined;
            if (latestSynchronizedEdition === -1) return false;
            return true;
        }
        
        function runWithUpdatesTrackingDisabled(action: () => void) {
            updatesTrackingEnabled = false;
            try {
                action();
            } finally {
                updatesTrackingEnabled = true;
            }
        }
        
        function processUnsyncedUpdate(record: StateLinkUpdateRecordPersisted) {
            // updates can come out of order
            
            console.log('processUnsyncedUpdate', record)
            
            latestObservedEdition = Math.max(latestObservedEdition, record.edition)

            if (isLeaderLoaded() === undefined) {
                console.log('processUnsyncedUpdate: leader undefined')
                return;
            }

            if (!isStateLoaded()) {
                console.log('processUnsyncedUpdate: leader loading')
                updatesCapturedDuringLeaderLoading.push(record)
                return;
            }
            
            updatesPendingSynchronization.push(record)
            if (metaState.value.isSynchronizationRunning) {
                console.log('processUnsyncedUpdate: already running')
                return;
            }

            function compact(upto: number) {
                console.log('processUnsyncedUpdate: compacting', upto)

                const observedEdition = upto;
                if (observedEdition - latestCompactedEdition < 100) {
                    return;
                }
                if (isCompactionRunning) {
                    return;
                }
                const currentTimestamp = (new Date()).getTime()
                if (currentTimestamp - latestCompactedTimestamp < 60000) {
                    return;
                }
                isCompactionRunning = true;
                compactStateUpdates(self.dbRef, observedEdition).then(() => {
                    isCompactionRunning = false;
                }).catch((err) => {
                    isCompactionRunning = false;
                    console.error(err)
                })
                latestCompactedEdition = observedEdition
                latestCompactedTimestamp = currentTimestamp
            }
            
            async function sync() {
                console.log('processUnsyncedUpdate: syncing')
                try {
                    metaState.nested.isSynchronizationRunning.set(true);
                    
                    await new Promise(resolve => setTimeout(() => resolve(), 500)) // debounce
                    
                    const recordsToSync = updatesPendingSynchronization
                    const pendingEditions = recordsToSync
                        .map(i => i.edition)
                        .sort((a, b) => a - b)
                    if (pendingEditions.find(
                            (e, i) => e - latestSynchronizedEdition !== i + 1) !== undefined) {
                        // some are out of order, wait until it lines up
                        console.warn('out of order updates received, postponing sync until gaps are closed',
                        latestSynchronizedEdition, pendingEditions)
                        return;
                    }

                    console.log('processUnsyncedUpdate: syncing editions', pendingEditions)

                    const latestEdition = pendingEditions[pendingEditions.length - 1]
                    updatesPendingSynchronization = []
                    latestSynchronizedEdition = latestEdition
                    if (onSync) {
                        try {
                            console.log('processUnsyncedUpdate: syncing records', recordsToSync)
                            await onSync(recordsToSync)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                    console.log('processUnsyncedUpdate: saving sync', latestEdition)
                    await saveStateSync(self.dbRef, latestEdition)
                
                    compact(latestEdition)
                } finally {
                    metaState.nested.isSynchronizationRunning.set(false);
                }
                            
                if (updatesPendingSynchronization.length > 0) {
                    console.log('processUnsyncedUpdate: running again')
                    sync()
                }
            }
            
            sync()
        }
        
        function processBroadcastedUpdate(record: StateLinkUpdateRecordPersisted) {
            if (!isStateLoaded()) {
                updatesCapturedDuringStateLoading.push(record)
                return;
            }
            if (metaState.value.initiallyLoadedEdition >= record.edition) {
                // this can happen, because the loadState could have loaded a record,
                // which we received here
                return;
            }
            // also updates can come here out of order, it is acceptable
            
            runWithUpdatesTrackingDisabled(() => {
                let targetState = unmountedLink;
                for (let i = 0; i < record.path.length; i += 1) {
                    const p = record.path[i];
                    const nested = targetState.nested
                    if (nested) {
                        targetState = nested[p]
                    } else {
                        console.warn('Can not apply update at path:', record.path, targetState.get());
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
            runWithUpdatesTrackingDisabled(() => unmountedLink.set(s.state))
            metaState.nested.initiallyLoadedEdition.set(s.loadedEdition);
            latestCompactedEdition = s.compactedEdition;
            updatesCapturedDuringStateLoading.forEach(processBroadcastedUpdate)
            updatesCapturedDuringStateLoading = []
            if (isLeaderLoaded() !== undefined) {
                activateWhenElected()
            }
        }
        
        function activateWhenElected() {
            latestSynchronizedEdition = -1 // elected & loading state
            if (!isStateLoaded()) {
                return;
            }
            loadStateSync(self.dbRef).then(i => {
                loadStateUpdates(self.dbRef,
                    i.synchronizedEdition + 1,
                    Math.max(
                        latestObservedEdition,
                        i.synchronizedEdition + 1,
                        metaState.value.initiallyLoadedEdition))
                    .then(updates => {
                        latestSynchronizedEdition = i.synchronizedEdition
                        updates.forEach(processUnsyncedUpdate)
                        updatesCapturedDuringLeaderLoading
                            // it could receive the same updates while they are being loaded
                            .filter(u => !updates.find(i => i.edition === u.edition))
                            .forEach(processUnsyncedUpdate)
                        updatesCapturedDuringLeaderLoading = []
                    })
            })
            if (onLeader) {
                onLeader()
            }
        }
        
        this.broadcastRef = subscribeBroadcastChannel(
            topic, processBroadcastedUpdate, activateWhenElected)
        const broadcast = (message: StateLinkUpdateRecordPersisted) =>
            this.broadcastRef.channel.postMessage(message);

        this.dbRef = openState(topic, unmountedLink.value) 
        loadState(this.dbRef).then(s => activateWhenLoaded(s))

        this.onSetCallback = (path, newState, newValue) => {
            if (updatesTrackingEnabled) {
                // this instance has been updated, so notify peers
                const update = {
                    path: path,
                    value: newValue
                }
                saveStateUpdate(this.dbRef, update)
                    .then((edition) => {
                        const persistedUpdate = { ...update, edition }
                        processUnsyncedUpdate(persistedUpdate)
                        broadcast(persistedUpdate)
                    })
            }
        }
        
        this.metaInf = metaStateRef.wrap(s => ({
            isLoading() {
                return s.value.initiallyLoadedEdition === -1
            },
            isSynchronising() {
                return s.value.isSynchronizationRunning
            }
        }))
    }
    
    onDestroy() {
        console.log('Plugin destroyed')
        unsubscribeBroadcastChannel(this.broadcastRef)
        closeState(this.dbRef)
    }
    
    onSet(path: Path, newState: StateValueAtRoot, newValue: StateValueAtPath) {
        this.onSetCallback(path, newState, newValue)
    }
    
    status() {
        return this.metaInf;
    }
}

// tslint:disable-next-line: function-name
export function Synchronised(
    topic: string,
    onLeader?: () => void,
    onSync?: (updates: StateLinkUpdateRecordPersisted[]) => Promise<boolean>): () => Plugin;
export function Synchronised<S>(self: StateLink<S>): SynchronisedExtensions;
export function Synchronised<S>(selfOrTopic?: StateLink<S> | string,
    onLeader?: () => void,
    onSync?: (updates: StateLinkUpdateRecordPersisted[]) => Promise<boolean>
    ): (() => Plugin) | SynchronisedExtensions {
    if (typeof selfOrTopic !== 'string') {
        const self = selfOrTopic as StateLink<S>;
        const [link, instance] = self.with(PluginID);
        const inst = instance as SynchronisedPluginInstance;
        return {
            set() {}, // set without propagation to sync
            status() {
                return inst.status()
            }
        }
    }
    return () => ({
        id: PluginID,
        instanceFactory: (_, linkFactory) => {
            return new SynchronisedPluginInstance(selfOrTopic, linkFactory(), onLeader, onSync);
        }
    })
}

interface Task { name: string }

export const ExampleComponent = () => {
    const state = useStateLink([{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
    state.with(Synchronised(
            'plugin-persisted-data-key-6',
            () => console.log('This is the leader'),
            (updates) => {
                console.log('request to sync', updates)
                return new Promise<boolean>((resolve, reject) => {
                    setTimeout(() => resolve(true), 1000)
                })
            }
        ))
    const meta = useStateLink(Synchronised(state).status());
    if (meta.isLoading()) {
        return <p>Loading offline data...</p>
    }
    return <>
        <p>Is syncrhonisation running: {meta.isSynchronising().toString()}</p>
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

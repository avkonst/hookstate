import React from 'react';
import BroadcastChannel from 'broadcast-channel';
import LeaderElection, { LeaderElector } from 'broadcast-channel/leader-election';
import { useStateLink, Path, StateValueAtPath, Plugin, StateLink, createStateLink, useStateLinkUnmounted, PluginInstance, StateValueAtRoot, StateInf, StateRef } from '@hookstate/core';
import * as idb from 'idb';
import { Untracked } from '@hookstate/untracked';

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
                data: undefined,
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
        pendingState: syncState.data,
        synchronizedEdition: syncState.edition
    }
}
async function saveStateSync(stateHandle: Promise<StateHandle>,
    pendingState: any,
    latestSynchronizedEdition: number) {
    const database = (await stateHandle).db;
    const topic = (await stateHandle).topic;
    await database.put(topic, {
        data: pendingState,
        edition: latestSynchronizedEdition
    }, 'sync')
    return
}

interface StateLinkUpdateRecord {
    readonly path: Path,
    readonly value: StateValueAtPath,
    readonly incoming: boolean
}

interface StateLinkUpdateRecordPersisted extends StateLinkUpdateRecord {
    readonly edition: number;
}

interface StatusMessage {
    status: {
        isSynchronising: boolean
    }
}

export interface SynchronisationStatus {
    isLoading(): boolean;
    isSynchronising(): boolean;
}

export interface SynchronisedExtensions<S> {
    set(newValue: React.SetStateAction<S>): void;
    status(): StateInf<SynchronisationStatus>
}

const PluginID = Symbol('Synchronised');

class SynchronisedPluginInstance implements PluginInstance {
    private broadcastRef: BroadcastChannelHandle<StateLinkUpdateRecordPersisted | StatusMessage>;
    private dbRef: Promise<StateHandle>;
    private onSetOutgoing: (path: readonly (string | number)[], newState: any, newValue: any) => void;
    private metaInf: StateInf<SynchronisationStatus>;
    private unsubscribeCallback: (() => void) | undefined;
    private metaStateRef: StateRef<{
        initiallyLoadedEdition: number;
        isSynchronizationRunning: boolean;
    }>;
    
    runWithoutRemoteSynchronisation: (action: () => void) => void;
    
    constructor(
        topic: string,
        unmountedLink: StateLink<StateValueAtRoot>,
        subscribeIncoming?: (link: StateLink<StateValueAtRoot>) => () => void,
        submitOutgoing?: (
            pending: any,
            updates: StateLinkUpdateRecordPersisted[],
            link: StateLink<StateValueAtRoot>
        ) => Promise<any>
    ) {
        const self = this;
        
        this.metaStateRef = createStateLink<{
            initiallyLoadedEdition: number,
            isSynchronizationRunning: boolean
        }>({
            initiallyLoadedEdition: -1,
            isSynchronizationRunning: false,
        });
        const metaState = useStateLinkUnmounted(this.metaStateRef).with(Untracked);
        
        let updatesCapturedDuringStateLoading: StateLinkUpdateRecordPersisted[] = [];
        let latestCompactedEdition = -1;
        let latestCompactedTimestamp = 0;
        let isCompactionRunning = false;
        let latestObservedEdition = -1;
        let updatesCapturedDuringLeaderLoading: StateLinkUpdateRecordPersisted[] = [];
        let updatesPendingSynchronization: StateLinkUpdateRecordPersisted[] = [];

        let latestSynchronizedEdition = -2; // see states and transitions below
        let latestSynchronizedData: any = undefined;
        
        let isLocalSynchronisationEnabled = true;
        let isRemoteSynchronisationEnabled = true;
        
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
        
        function runWithoutLocalSynchronisation(action: () => void) {
            isLocalSynchronisationEnabled = false;
            try {
                action();
            } finally {
                isLocalSynchronisationEnabled = true;
            }
        }

        this.runWithoutRemoteSynchronisation = (action: () => void) => {
            isRemoteSynchronisationEnabled = false;
            try {
                action();
            } finally {
                isRemoteSynchronisationEnabled = true;
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

                if (isCompactionRunning) {
                    return;
                }
                const observedEdition = upto;
                const currentTimestamp = (new Date()).getTime()
                if (observedEdition - latestCompactedEdition < 1000 &&
                    currentTimestamp - latestCompactedTimestamp < 60000) {
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
                    Untracked(metaState.nested.isSynchronizationRunning).set(true);
                    
                    await new Promise(resolve => setTimeout(() => resolve(), 1000)) // debounce

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
                    const recordsToSyncExcludingIncoming = recordsToSync.filter(i => !i.incoming)
                    
                    if (recordsToSyncExcludingIncoming.length === 0) {
                        return;
                    }

                    console.warn('set sync running true')
                    metaState.nested.isSynchronizationRunning.set(true);
                    broadcast({
                        status: {
                            isSynchronising: true
                        }
                    })
                    if (submitOutgoing) {
                        try {
                            console.log('processUnsyncedUpdate: syncing records', recordsToSyncExcludingIncoming)
                            latestSynchronizedData = await submitOutgoing(
                                latestSynchronizedData,
                                recordsToSyncExcludingIncoming,
                                unmountedLink)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                    console.log('processUnsyncedUpdate: saving sync', latestEdition)
                    await saveStateSync(self.dbRef, latestSynchronizedData, latestEdition)
                
                    compact(latestEdition)
                } finally {
                    if (metaState.nested.isSynchronizationRunning.value) {
                        broadcast({
                            status: {
                                isSynchronising: false
                            }
                        })
                        metaState.nested.isSynchronizationRunning.set(false);
                    }
                }
                            
                if (updatesPendingSynchronization.length > 0) {
                    console.log('processUnsyncedUpdate: running again')
                    sync()
                }
            }
            
            sync()
        }
        
        function processBroadcastedUpdate(message: StateLinkUpdateRecordPersisted | StatusMessage) {
            if ((message as StatusMessage).status !== undefined) {
                const status = (message as StatusMessage).status;
                metaState.nested.isSynchronizationRunning.set(status.isSynchronising)
                return;
            }
            const record = message as StateLinkUpdateRecordPersisted;
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
            
            runWithoutLocalSynchronisation(() => {
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
            runWithoutLocalSynchronisation(() => unmountedLink.set(s.state))
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
                        latestSynchronizedData = i.pendingState
                        updates.forEach(processUnsyncedUpdate)
                        updatesCapturedDuringLeaderLoading
                            // it could receive the same updates while they are being loaded
                            .filter(u => !updates.find(i => i.edition === u.edition))
                            .forEach(processUnsyncedUpdate)
                        updatesCapturedDuringLeaderLoading = []
                    })
            })
            if (subscribeIncoming) {
                self.unsubscribeCallback = subscribeIncoming(unmountedLink)
            }
        }
        
        this.broadcastRef = subscribeBroadcastChannel(
            topic, processBroadcastedUpdate, activateWhenElected)
        const broadcast = (message: StateLinkUpdateRecordPersisted | StatusMessage) =>
            this.broadcastRef.channel.postMessage(message);

        this.dbRef = openState(topic, unmountedLink.value) 
        loadState(this.dbRef).then(s => activateWhenLoaded(s))

        this.onSetOutgoing = (path, newState, newValue) => {
            if (isLocalSynchronisationEnabled) {
                // this instance has been updated, so notify peers
                const update = {
                    path: path,
                    value: newValue,
                    incoming: !isRemoteSynchronisationEnabled
                }
                saveStateUpdate(this.dbRef, update)
                    .then((edition) => {
                        const persistedUpdate = { ...update, edition }
                        processUnsyncedUpdate(persistedUpdate)
                        broadcast(persistedUpdate)
                    })
            }
        }
        
        this.metaInf = this.metaStateRef.wrap(s => ({
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
        if (this.unsubscribeCallback) {
            this.unsubscribeCallback()
        }
        this.metaStateRef.destroy()
        unsubscribeBroadcastChannel(this.broadcastRef)
        closeState(this.dbRef)
    }
    
    onSet(path: Path, newState: StateValueAtRoot, newValue: StateValueAtPath) {
        this.onSetOutgoing(path, newState, newValue)
    }
    
    status() {
        return this.metaInf;
    }
}

// tslint:disable-next-line: function-name
export function Synchronised<S, P>(
    topic: string,
    subscribeIncoming?: (link: StateLink<S>) => () => void,
    submitOutgoing?: (
        pending: P | undefined,
        updates: StateLinkUpdateRecordPersisted[],
        link: StateLink<S>
    ) => Promise<P>): () => Plugin;
export function Synchronised<S>(self: StateLink<S>): SynchronisedExtensions<S>;
export function Synchronised<S>(selfOrTopic?: StateLink<S> | string,
    subscribeIncoming?: (link: StateLink<StateValueAtRoot>) => () => void,
    submitOutgoing?: (
        pending: any,
        updates: StateLinkUpdateRecordPersisted[],
        link: StateLink<StateValueAtRoot>
    ) => Promise<any>
    ): (() => Plugin) | SynchronisedExtensions<S> {
    if (typeof selfOrTopic !== 'string') {
        const self = selfOrTopic as StateLink<S>;
        const [link, instance] = self.with(PluginID);
        const inst = instance as SynchronisedPluginInstance;
        return {
            set(newValue: React.SetStateAction<S>) {
                inst.runWithoutRemoteSynchronisation(() => {
                    link.set(newValue)
                })
            },
            status() {
                return inst.status()
            }
        }
    }
    return () => ({
        id: PluginID,
        instanceFactory: (_, linkFactory) => {
            return new SynchronisedPluginInstance(selfOrTopic, linkFactory(), subscribeIncoming, submitOutgoing);
        }
    })
}

interface Task { name: string }

const StatusView = (props: { status: StateInf<SynchronisationStatus> }) => {
    const meta = useStateLink(props.status);
    return <p>Is syncrhonisation running: {meta.isSynchronising().toString()}</p>
}

const DataEditor = (props: { state: StateLink<Task[]> }) => {
    const state = useStateLink(props.state);
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

export const ExampleComponent = () => {
    const state = useStateLink([{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
    state.with(Synchronised<Task[], StateLinkUpdateRecordPersisted[]>(
            'plugin-persisted-data-key-6',
            (link) => {
                let count = 0
                const timer = setInterval(() => {
                    count += 1
                    Synchronised(link.nested[0].nested.name).set('from subscription: ' + count.toString())
                }, 10000)
                return () => clearInterval(timer)
            },
            (pending, updates, link) => {
                console.log('request to sync', updates)
                return new Promise((resolve, reject) => {
                    // keep last 10 updates in pending
                    setTimeout(() => resolve((pending || []).concat(updates).slice(-10)), 1000)
                })
            }
        ))
    const status = Synchronised(state).status();
    const meta = useStateLink(status);
    if (meta.isLoading()) {
        return <p>Loading offline data...</p>
    }
    return <>
        <StatusView status={status} />
        <DataEditor state={state} />
    </>
}

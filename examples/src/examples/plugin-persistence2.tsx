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
                edition: 0,
                data: undefined
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
    console.trace('loading state updates', from, upto)
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
        synchronisedEdition: syncState.edition
    }
}
async function saveStateSync(stateHandle: Promise<StateHandle>,
    pendingState: any,
    latestSynchronisedEdition: number) {
    const database = (await stateHandle).db;
    const topic = (await stateHandle).topic;
    await database.put(topic, {
        edition: latestSynchronisedEdition,
        data: pendingState
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
        isSynchronising?: boolean
    }
}

export interface SynchronisationStatus {
    isLoading(): boolean;
    isSynchronising(): boolean;
    isNetworkOnline(): boolean;
}

export interface SynchronisedExtensions<S> {
    set(newValue: React.SetStateAction<S>): void;
    status(): StateInf<SynchronisationStatus>
}

export const on = (obj: any, ...args: any[]) => obj.addEventListener(...args);
export const off = (obj: any, ...args: any[]) => obj.removeEventListener(...args);

const PluginID = Symbol('Synchronised');

class SynchronisedPluginInstance implements PluginInstance {
    private onDestroyCallback: () => void;
    private onSetCallback: (path: readonly (string | number)[], newState: any, newValue: any) => void;
    private onStatusCallback: () => StateInf<SynchronisationStatus>

    runWithoutRemoteSynchronisation: (action: () => void) => void;
    
    constructor(
        topic: string,
        unmountedLink: StateLink<StateValueAtRoot>,
        subscribeIncoming?: (link: StateLink<StateValueAtRoot>) => () => void,
        submitOutgoing?: (
            pending: any,
            updates: StateLinkUpdateRecordPersisted[],
            link: StateLink<StateValueAtRoot>,
            isNetworkOnline: boolean
        ) => Promise<any>
    ) {
        const metaStateRef = createStateLink<{
            initiallyLoadedEdition: number,
            isSynchronizationRunning: boolean,
            isNetworkOnline: boolean
        }>({
            initiallyLoadedEdition: -1,
            isSynchronizationRunning: false,
            isNetworkOnline: true
        });
        const metaState = useStateLinkUnmounted(metaStateRef).with(Untracked);
        const metaInf: StateInf<SynchronisationStatus> = metaStateRef.wrap(s => ({
            isLoading() {
                return s.value.initiallyLoadedEdition === -1
            },
            isSynchronising() {
                return s.value.isSynchronizationRunning
            },
            isNetworkOnline() { 
                return s.value.isNetworkOnline
            }
        }))
        
        const broadcastRef = subscribeBroadcastChannel(
            topic, processBroadcastedUpdate, activateWhenElected)
        const broadcast = (message: StateLinkUpdateRecordPersisted | StatusMessage) =>
            broadcastRef.channel.postMessage(message);

        const dbRef = openState(topic, unmountedLink.value) 
        loadState(dbRef).then(activateWhenLoaded)

        let updatesCapturedDuringStateLoading: StateLinkUpdateRecordPersisted[] = [];
        let latestCompactedEdition = -1;
        let latestCompactedTimestamp = 0;
        let isCompactionRunning = false;
        let latestObservedEdition = -1;
        let updatesCapturedDuringLeaderLoading: StateLinkUpdateRecordPersisted[] = [];
        let updatesPendingSynchronization: StateLinkUpdateRecordPersisted[] = [];

        let latestSynchronisedEdition = -2; // see states and transitions below
        let latestSynchronisedTimestamp = 0;
        let latestSynchronisedData: any = undefined;
        
        let isLocalSynchronisationEnabled = true;
        let isRemoteSynchronisationEnabled = true;
        
        let unsubscribeIncoming: (() => void) | undefined = undefined;
        
        // transitions 1): Loading (false) -> Loaded (true)
        function isStateLoaded() {
            return metaState.value.initiallyLoadedEdition !== -1
        }

        // transitions 2): Not Elected (undefined) -> Loading & Elected (false) -> Loaded & Elected (true)
        function isLeaderLoaded() {
            if (latestSynchronisedEdition === -2) return undefined;
            if (latestSynchronisedEdition === -1) return false;
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

        function compact(upto: number) {
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
            compactStateUpdates(dbRef, observedEdition).then(() => {
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
                const recordsToSyncExcludingIncoming = recordsToSync.filter(i => !i.incoming)
                const pendingEditions = recordsToSync
                    .map(i => i.edition)
                    .sort((a, b) => a - b)
                if (pendingEditions.find(
                        (e, i) => e - latestSynchronisedEdition !== i + 1) !== undefined) {
                    // some are out of order, wait until it lines up
                    console.warn('out of order updates received, postponing sync until gaps are closed',
                    latestSynchronisedEdition, pendingEditions)
                    return;
                }

                const latestEdition = pendingEditions[pendingEditions.length - 1] || latestSynchronisedEdition
                updatesPendingSynchronization = []
                latestSynchronisedEdition = latestEdition
                
                if ((recordsToSyncExcludingIncoming.length > 0 || latestSynchronisedData) && submitOutgoing) {
                    metaState.nested.isSynchronizationRunning.set(true);
                    broadcast({
                        status: {
                            isSynchronising: true
                        }
                    })
                    try {
                        latestSynchronisedData = await submitOutgoing(
                            latestSynchronisedData,
                            recordsToSyncExcludingIncoming,
                            unmountedLink,
                            metaState.nested.isNetworkOnline.get())
                    } catch (err) {
                        console.error(err)
                    }
                }
                
                // save periodically
                // if it is not saved and application is closed,
                // it is replayed from the updates queue next time
                const currentTimestamp = (new Date()).getTime()
                if (latestSynchronisedData === undefined // flushed successfully
                    // or did not save for quite a while
                    || currentTimestamp - latestSynchronisedTimestamp < 60000
                    ) {
                    await saveStateSync(dbRef, latestSynchronisedData, latestEdition)
                    compact(latestEdition)
                }
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
                sync()
            }
        }
        
        function processUnsyncedUpdate(record: StateLinkUpdateRecordPersisted) {
            // updates can come out of order
            
            latestObservedEdition = Math.max(latestObservedEdition, record.edition)
            if (isLeaderLoaded() === undefined) {
                return;
            }
            if (!isStateLoaded()) {
                updatesCapturedDuringLeaderLoading.push(record)
                return;
            }
            updatesPendingSynchronization.push(record)
            if (metaState.value.isSynchronizationRunning) {
                return;
            }

            sync()
        }
        
        function processBroadcastedUpdate(message: StateLinkUpdateRecordPersisted | StatusMessage) {
            if ((message as StatusMessage).status !== undefined) {
                const status = (message as StatusMessage).status;
                if (status.isSynchronising !== undefined) {
                    metaState.nested.isSynchronizationRunning.set(status.isSynchronising)
                }
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
            // note the 3rd party election algorithm has got a bug
            // very hard to reproduce and track it down
            // it is also unclear if it is reproducinble only under hot reload or not
            // keep watching if strange synchronisation errors apear in production
            
            // safe to proceed with activation
            latestSynchronisedEdition = -1 // elected & loading state
            if (!isStateLoaded()) {
                return;
            }
            loadStateSync(dbRef).then(i => {
                loadStateUpdates(dbRef,
                    i.synchronisedEdition + 1,
                    Math.max(
                        latestObservedEdition,
                        i.synchronisedEdition + 1,
                        metaState.value.initiallyLoadedEdition))
                    .then(updates => {
                        latestSynchronisedEdition = i.synchronisedEdition
                        latestSynchronisedData = i.pendingState
                        updates.forEach(processUnsyncedUpdate)
                        updatesCapturedDuringLeaderLoading
                            // it could receive the same updates while they are being loaded
                            .filter(u => !updates.find(i => i.edition === u.edition))
                            .forEach(processUnsyncedUpdate)
                        updatesCapturedDuringLeaderLoading = []
                    })
            })
            if (subscribeIncoming) {
                unsubscribeIncoming = subscribeIncoming(unmountedLink)
            }
        }
        
        const onOnline = () => {
            if (unsubscribeIncoming === undefined &&
                subscribeIncoming &&
                isLeaderLoaded() !== undefined) {
                unsubscribeIncoming = subscribeIncoming(unmountedLink)
            }
            metaState.nested.isNetworkOnline.set(true)
            sync()
        };
        const onOffline = () => {
            metaState.nested.isNetworkOnline.set(false)
            if (unsubscribeIncoming) {
                unsubscribeIncoming()
                unsubscribeIncoming = undefined;
            }
        };
        on(window, 'online', onOnline)
        on(window, 'offline', onOffline)
        
        this.onSetCallback = (path, newState, newValue) => {
            if (isLocalSynchronisationEnabled) {
                // this instance has been updated, so notify peers
                const update = {
                    path: path,
                    value: newValue,
                    incoming: !isRemoteSynchronisationEnabled
                }
                saveStateUpdate(dbRef, update)
                    .then((edition) => {
                        const persistedUpdate = { ...update, edition }
                        processUnsyncedUpdate(persistedUpdate)
                        broadcast(persistedUpdate)
                    })
            }
        }
        
        this.onDestroyCallback = () => {
            off(window, 'online', onOnline)
            off(window, 'offline', onOffline)
            if (unsubscribeIncoming) {
                unsubscribeIncoming()
            }
            metaStateRef.destroy()
            unsubscribeBroadcastChannel(broadcastRef)
            closeState(dbRef)
        }
        
        this.onStatusCallback = () => metaInf
    }
    
    onDestroy() {
        this.onDestroyCallback();
    }
    
    onSet(path: Path, newState: StateValueAtRoot, newValue: StateValueAtPath) {
        this.onSetCallback(path, newState, newValue)
    }
    
    status() {
        return this.onStatusCallback();
    }
}

// tslint:disable-next-line: function-name
export function Synchronised<S, P>(
    topic: string,
    subscribeIncoming?: (link: StateLink<S>) => () => void,
    submitOutgoing?: (
        pending: P | undefined,
        updates: StateLinkUpdateRecordPersisted[],
        link: StateLink<S>,
        isNetworkOnline: boolean
    ) => Promise<P>): () => Plugin;
export function Synchronised<S>(self: StateLink<S>): SynchronisedExtensions<S>;
export function Synchronised<S>(selfOrTopic?: StateLink<S> | string,
    subscribeIncoming?: (link: StateLink<StateValueAtRoot>) => () => void,
    submitOutgoing?: (
        pending: any,
        updates: StateLinkUpdateRecordPersisted[],
        link: StateLink<StateValueAtRoot>,
        isNetworkOnline: boolean
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
    return <>
        <p>Is syncrhonisation running: {meta.isSynchronising().toString()}</p>
        <p>Is network online: {meta.isNetworkOnline().toString()}</p>
    </>
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
                console.log('subscribing incoming, interval simulated') 
                let count = 0
                const timer = setInterval(() => {
                    count += 1
                    Synchronised(link.nested[0].nested.name).set('from subscription: ' + count.toString())
                }, 10000)
                return () => {
                    console.log('unsubscribing incoming, internal simulated')
                    clearInterval(timer)
                }
            },
            (pending, updates, link, isOnline) => {
                console.log('submitting outgoing', pending, updates, isOnline)
                if (isOnline) {
                    return new Promise((resolve, reject) => {
                        // assuming flushed to remote successfully
                        setTimeout(() => resolve(undefined), 1000)
                    })
                }
                return new Promise((resolve, reject) => {
                    // accumulate while offline
                    setTimeout(() => resolve((pending || []).concat(updates)), 1000)
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

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
    const p = handle.elector.die()
    if (p) {
        // for some reason p can be undefined
        p.then(() => handle.channel.close())
    }
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
    const records: StateLinkUpdateRecord[] =
        await readStore.getAll(IDBKeyRange.bound(currentEdition + 1, upto))
    await readTx.done
    records.forEach(record => {
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
    })
    
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

export interface SynchronisedStatus {
    isLoading(): boolean;
    isSynchronising(): boolean;
    isNetworkOnline(): boolean;
}

export interface SynchronisedExtensions<S> {
    set(newValue: React.SetStateAction<S>): void;
    status(): StateInf<SynchronisedStatus>
}

export const on = (obj: any, ...args: any[]) => obj.addEventListener(...args);
export const off = (obj: any, ...args: any[]) => obj.removeEventListener(...args);

const PluginID = Symbol('Synchronised');

class SynchronisedPluginInstance implements PluginInstance {
    private onDestroyCallback: () => void;
    private onSetCallback: (path: readonly (string | number)[], newState: any, newValue: any) => void;
    private onStatusCallback: () => StateInf<SynchronisedStatus>

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
        let hasBeenDestroyed = false;
        
        const metaStateRef = createStateLink<{
            initiallyLoadedEdition: number,
            isSynchronizationRunning: boolean,
            isNetworkOnline: boolean
        }>({
            initiallyLoadedEdition: -1,
            isSynchronizationRunning: false,
            isNetworkOnline: window.navigator ? navigator.onLine : true
        });
        const metaState = useStateLinkUnmounted(metaStateRef).with(Untracked);
        const metaInf: StateInf<SynchronisedStatus> = metaStateRef.wrap(s => ({
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
        const broadcast = (message: StateLinkUpdateRecordPersisted | StatusMessage) => {
            broadcastRef.channel.postMessage(message);
        }

        const dbRef = openState(topic, unmountedLink.value) 
        loadState(dbRef).then(activateWhenLoaded)

        let updatesCapturedDuringStateLoading: StateLinkUpdateRecordPersisted[] = [];
        let latestCompactedEdition = -1;
        let latestCompactedTimestamp = 0;
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

        // TODO sync can throw if two leaders are elected (see other notes about leader election problem),
        // handle it and stop syncing on errors?
        async function sync() {
            if (hasBeenDestroyed) {
                return;
            }
            
            if (metaState.value.isSynchronizationRunning) {
                return;
            }
            
            async function syncUpTo(uptoIndex: number) {
                let recordsToSync = updatesPendingSynchronization
                    .slice(0, uptoIndex + 1)
                let recordsToSyncExcludingIncoming = recordsToSync
                    .filter((r, i) => !r.incoming)

                updatesPendingSynchronization = updatesPendingSynchronization.slice(uptoIndex + 1)
                latestSynchronisedEdition = recordsToSync.length > 0
                    ? recordsToSync[recordsToSync.length - 1].edition
                    : latestSynchronisedEdition;
                
                if ((recordsToSyncExcludingIncoming.length > 0 || latestSynchronisedData)
                    && submitOutgoing) {
                    // reset guard AND rerender status viewers
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
                        // TODO flush to errors collector
                        console.error(err)
                    }
                }
                
                // save sync status periodically
                // if it is not saved and application is closed,
                // it is replayed from the updates queue next time
                const currentTimestamp = (new Date()).getTime()
                if (latestSynchronisedData === undefined // flushed successfully
                    // or did not save for quite a while
                    || currentTimestamp - latestSynchronisedTimestamp > 60000
                    ) {
                    await saveStateSync(dbRef, latestSynchronisedData, latestSynchronisedEdition)
                    latestSynchronisedTimestamp = currentTimestamp

                    // check if compaction needed
                    // either many updates accumulated
                    // or did not compact for quite a while
                    if (latestSynchronisedEdition - latestCompactedEdition > 1000 ||
                        currentTimestamp - latestCompactedTimestamp > 60000) {
                        await compactStateUpdates(dbRef, latestSynchronisedEdition)
                        latestCompactedEdition = latestSynchronisedEdition
                        latestCompactedTimestamp = currentTimestamp
                    }
                }
            }
            
            try {
                // set guard without rerendering status viewers
                Untracked(metaState.nested.isSynchronizationRunning).set(true);
                
                await new Promise(resolve => setTimeout(() => resolve(), 1000)) // debounce
    
                // updtes pending syncrhonisation are sorted and no duplicates
                if (updatesPendingSynchronization.length > 0 && updatesPendingSynchronization[0].edition <= latestSynchronisedEdition) {
                    // head elements are stale, remove them
                    updatesPendingSynchronization = updatesPendingSynchronization
                        .filter(i => i.edition <= latestSynchronisedEdition)
                }

                const foundOooIndex = updatesPendingSynchronization
                    .findIndex((e, i) => (e.edition - latestSynchronisedEdition) !== (i + 1))
                if (foundOooIndex !== -1) {
                    if (foundOooIndex !== 0) {
                        console.warn('out of order updates received, submitting the head',
                            latestSynchronisedEdition, updatesPendingSynchronization, foundOooIndex)
                        await syncUpTo(foundOooIndex - 1)
                    } else {
                        if (updatesPendingSynchronization.length > 100) {
                            // clearly missing some data for long time unknown reason
                            // TODO report in production
                            // auto recover by continueing
                            console.warn('recovering out of order, proceeding sync with gaps',
                                updatesPendingSynchronization)
                            await syncUpTo(updatesPendingSynchronization.length - 1)
                        }
                        else {
                            // some are out of order, wait until it lines up
                            console.warn('out of order updates received, postponing sync until gaps are closed',
                                latestSynchronisedEdition, updatesPendingSynchronization)
                        }
                    }
                } else {
                    await syncUpTo(updatesPendingSynchronization.length - 1)
                }
            } finally {
                if (metaState.nested.isSynchronizationRunning.get()) {
                    broadcast({
                        status: {
                            isSynchronising: false
                        }
                    })
                    metaState.nested.isSynchronizationRunning.set(false);
                }
                
                if (hasBeenDestroyed) {
                    // a component has been unmounted while syncing data
                    onDestroyFinally()
                }
            }

            // there are pending elements and the first one is in the required order
            if (updatesPendingSynchronization.length > 0 &&
                latestSynchronisedEdition + 1 === updatesPendingSynchronization[0].edition) {
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
            
            // updates pending synchronisation should be sorted and no duplucates
            // guarantee required by sync()
            const foundNextIndex = updatesPendingSynchronization.findIndex(i => i.edition >= record.edition)
            if (foundNextIndex !== -1) {
                if (updatesPendingSynchronization[foundNextIndex].edition !== record.edition) {
                    // non duplicate
                    updatesPendingSynchronization.splice(foundNextIndex, 0, record)
                    sync()
                }
            } else {
                updatesPendingSynchronization.push(record)
                sync()
            }
        }
        
        function processBroadcastedUpdate(message: StateLinkUpdateRecordPersisted | StatusMessage) {
            // a component can be unmounted while the synchronisation process was running
            if (hasBeenDestroyed) {
                return;
            }

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
            // a component can be unmounted while the data is being loaded
            if (hasBeenDestroyed) {
                return;
            }
            
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
            // a component can be unmounted while the elector was working
            if (hasBeenDestroyed) {
                return;
            }

            console.log('activated leader')
            
            // note the 3rd party election algorithm has got a bug
            // very hard to reproduce and track it down
            // it is also unclear if it is reproducinble only under hot reload or not
            // keep watching if strange synchronisation errors apear in production
            
            latestSynchronisedEdition = -1 // elected & loading state
            if (!isStateLoaded()) {
                // will be picked up when activated on loaded
                return;
            }            
            loadStateSync(dbRef).then(i => {
                // a component can be unmounted while the data is being loaded
                if (hasBeenDestroyed) {
                    return;
                }

                loadStateUpdates(dbRef,
                    i.synchronisedEdition + 1,
                    Math.max(
                        latestObservedEdition,
                        i.synchronisedEdition + 1,
                        metaState.value.initiallyLoadedEdition))
                    .then(updates => {
                        // a component can be unmounted while the data is being loaded
                        if (hasBeenDestroyed) {
                            return;
                        }
                        
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
                        // a component can be unmounted while the data is being saved
                        if (hasBeenDestroyed) {
                            return;
                        }
        
                        const persistedUpdate = { ...update, edition }
                        processUnsyncedUpdate(persistedUpdate)
                        broadcast(persistedUpdate)
                    })
            }
        }
        
        const onDestroyFinally = () => {
            metaStateRef.destroy()
            unsubscribeBroadcastChannel(broadcastRef)
            closeState(dbRef)
        }
        this.onDestroyCallback = () => {
            hasBeenDestroyed = true;
            off(window, 'online', onOnline)
            off(window, 'offline', onOffline)
            if (unsubscribeIncoming) {
                unsubscribeIncoming()
            }
            if (!metaState.nested.isSynchronizationRunning.get()) {
                onDestroyFinally()
            }
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

const StatusView = (props: { status: StateInf<SynchronisedStatus> }) => {
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
    React.useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            i += 1
            state.nested[1].nested.name.set(i.toString())
        }, 200)
        return () => {
            clearInterval(timer)
        }
    })
    state.with(Synchronised<Task[], StateLinkUpdateRecordPersisted[]>(
            'plugin-persisted-data-key-6',
            (link) => {
                console.log('subscribing incoming, interval simulated') 
                let count = 0
                const timer = setInterval(() => {
                    count += 1
                    Synchronised(link.nested[0].nested.name).set('from subscription: ' + count.toString())
                }, 1000)
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
                    resolve((pending || []).concat(updates))
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

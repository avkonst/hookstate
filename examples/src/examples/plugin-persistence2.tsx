import BroadcastChannel from 'broadcast-channel';
import { Path, StateValueAtPath, Plugin, StateLink, PluginInstance, StateValueAtRoot, StateInf, useStateLink, createStateLink, useStateLinkUnmounted } from '@hookstate/core';
import LeaderElection, { LeaderElector } from 'broadcast-channel/leader-election';
import React from 'react';

interface BroadcastChannelHandle<T> {
    topic: string,
    channel: BroadcastChannel<T>,
    elector: LeaderElector,
    onMessage: (m: T) => void
    onLeader: () => void
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
        topic,
        channel,
        elector,
        onMessage,
        onLeader
    }
}
function unsubscribeBroadcastChannel<T>(handle: BroadcastChannelHandle<T>) {
    handle.channel.onmessage = null;
    handle.elector.die()
    handle.channel.close()
}
function resubscribeBroadcastChannel<T>(handle: BroadcastChannelHandle<T>) {
    if (handle.channel.onmessage !== null) {
        const topic = handle.topic
        const onMessage = handle.onMessage
        const onLeader = handle.onLeader
        
        unsubscribeBroadcastChannel(handle)
        const newHandler = subscribeBroadcastChannel(topic, onMessage, onLeader)

        handle.topic = newHandler.topic
        handle.channel = newHandler.channel
        handle.elector = newHandler.elector
        handle.onMessage = newHandler.onMessage
        handle.onLeader = newHandler.onLeader
    }
}
function checkBroadcastChannel<T>(handle: BroadcastChannelHandle<T>) {
    return handle.channel.onmessage !== null
}

interface BroadcastMessage {
    readonly version: number;
    readonly path: Path,
    readonly value: StateValueAtPath,
    readonly initial?: boolean
}

interface ServiceMessageInitialRequest {
    readonly version: number;
    readonly kind: 'request-initial';
}

interface ServiceMessageLeaderId {
    readonly version: number;
    readonly kind: 'leader-elected';
    readonly id: number;
}

type ServiceMessage = ServiceMessageInitialRequest | ServiceMessageLeaderId;

const PluginID = Symbol('Broadcasted');

class BroadcastedPluginInstance implements PluginInstance {
    private broadcastRef: BroadcastChannelHandle<BroadcastMessage | ServiceMessage>;
    private isBroadcastEnabled = true;
    private statusStateRef = createStateLink({ isLoading: true, isLeader: false });
    private statusState = useStateLinkUnmounted(this.statusStateRef);
    private instanceId = -1;
    
    constructor(
        readonly topic: string,
        readonly unmountedLink: StateLink<StateValueAtRoot>,
        readonly onLeader?: () => Promise<void>
    ) {
        this.broadcastRef = subscribeBroadcastChannel(topic, (message: BroadcastMessage | ServiceMessage) => {
            if (message.version > 1) {
                // peer tab has been upgraded
                return;
            }
            if ('kind' in message) {
                if (this.statusState.value.isLeader && message.kind === 'request-initial') {
                    this.broadcastRef.channel.postMessage({
                        version: 1,
                        path: [],
                        value: unmountedLink.value,
                        initial: true
                    })
                }
                if (this.instanceId !== -1 &&
                    message.kind === 'leader-elected' &&
                    message.id > this.instanceId) {
                    // There is a bug in broadcast-channel
                    // which causes 2 leaders claimed elected simulteneously
                    // This is a workaround for the problem:
                    // the tab revokes leadership itself
                    // and enters in to new election phase
                    resubscribeBroadcastChannel(this.broadcastRef)
                    this.instanceId = -1;
                    this.statusState.nested.isLeader.set(false)
                }
                return;
            }

            let targetState = unmountedLink;
            for (let i = 0; i < message.path.length; i += 1) {
                const p = message.path[i];
                const nested = targetState.nested
                if (nested) {
                    targetState = nested[p]
                } else {
                    console.warn('Can not apply update at path:', message.path, targetState.get());
                    // TODO request initial
                    return;
                }
            }
            this.isBroadcastEnabled = false;
            targetState.set(message.value)
            this.isBroadcastEnabled = true;
            
            if (message.initial && this.statusState.value.isLoading) {
                this.statusState.nested.isLoading.set(false);
            }
        }, () => {
            this.instanceId = Math.random()
            const capturedInstanceId = this.instanceId;
            this.broadcastRef.channel.postMessage({
                version: 1,
                kind: 'leader-elected',
                id: this.instanceId
            })

            // There is a bug in broadcast-channel
            // which causes 2 leaders claimed elected simulteneously
            // This is a workaround for the problem:
            // the tab may revoke leadership itself (see above)
            // so we delay the action
            setTimeout(() => {
                // if has not been destroyed and leadership has not been revoked
                if (checkBroadcastChannel(this.broadcastRef) &&
                    capturedInstanceId === this.instanceId) {

                    (onLeader ? onLeader() : Promise.resolve()).then(() => {
                        this.broadcastRef.channel.postMessage({
                            version: 1,
                            path: [],
                            value: unmountedLink.value,
                            initial: true
                        })
                        
                        if (this.statusState.value.isLoading) {
                            this.statusState.nested.isLoading.set(false);
                        }
                        this.statusState.nested.isLeader.set(true);
                    })
                }
            }, 200)
        })
        
        this.broadcastRef.channel.postMessage({
            version: 1,
            kind: 'request-initial'
        })
    }
    
    onDestroy() {
        unsubscribeBroadcastChannel(this.broadcastRef)
        this.statusStateRef.destroy()
    }
    
    onSet(path: Path, newState: StateValueAtRoot, newValue: StateValueAtPath) {
        if (this.isBroadcastEnabled) {
            this.broadcastRef.channel.postMessage({
                version: 1,
                path: path,
                value: newValue
            })
        }
    }
    
    status() {
        return this.statusStateRef;
    }
    
    getTopic() {
        return this.topic;
    }
}

interface BroadcastedStatus {
    isLoading(): boolean,
    isLeader(): boolean
}

interface BroadcastedExtensions {
    status(): StateInf<BroadcastedStatus>,
    topic(): string
}

// tslint:disable-next-line: function-name
export function Broadcasted(topic: string, onLeader?: () => Promise<void>): () => Plugin;
export function Broadcasted<S>(self: StateLink<S>): BroadcastedExtensions;
export function Broadcasted<S>(selfOrTopic?: StateLink<S> | string,
    onLeader?: () => Promise<void>): (() => Plugin) | BroadcastedExtensions {
    if (typeof selfOrTopic !== 'string') {
        const self = selfOrTopic as StateLink<S>;
        const [link, instance] = self.with(PluginID);
        const inst = instance as BroadcastedPluginInstance;
        return {
            status() {
                return inst.status().wrap(l => ({
                    isLoading() {
                        return l.value.isLoading
                    },
                    isLeader() {
                        return l.value.isLeader
                    }
                }));
            },
            topic() {
                return inst.getTopic();
            }
        }
    }
    return () => ({
        id: PluginID,
        instanceFactory: (_, linkFactory) => {
            return new BroadcastedPluginInstance(selfOrTopic, linkFactory(), onLeader);
        }
    })
}

interface Task { name: string }

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
        .with(Broadcasted(
            'tasks-state-broadcasted',
            () => {
                console.log('this tab is a leader!!')
                return Promise.resolve()
            },
        ))
    const statusState = useStateLink(Broadcasted(state).status())
    if (statusState.isLoading()) {
        return <p>Synchronising data with other tabs...</p>
    }
    return <>
        <p>Is this tab a leader?: {statusState.isLeader().toString()}</p>
        <DataEditor state={state} />
    </>
}

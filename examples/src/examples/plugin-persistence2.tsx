import BroadcastChannel from 'broadcast-channel';
import { Path, StateValueAtPath, Plugin, StateLink, PluginInstance, StateValueAtRoot, StateInf, useStateLink, createStateLink, useStateLinkUnmounted } from '@hookstate/core';
import LeaderElection, { LeaderElector } from 'broadcast-channel/leader-election';
import React from 'react';

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

interface BroadcastMessage {
    readonly version: number;
    readonly path: Path,
    readonly value: StateValueAtPath,
    readonly initial?: boolean
}

interface ServiceMessage {
    readonly version: number;
    readonly kind: 'request-initial'
}

const PluginID = Symbol('Broadcasted');

class BroadcastedPluginInstance implements PluginInstance {
    private broadcastRef: BroadcastChannelHandle<BroadcastMessage | ServiceMessage>;
    private isBroadcastEnabled = true;
    private statusStateRef = createStateLink({ isLoading: true, isLeader: false });
    private statusState = useStateLinkUnmounted(this.statusStateRef);
    // private thisInstanceId = Math.random();
    
    constructor(
        readonly topic: string,
        readonly unmountedLink: StateLink<StateValueAtRoot>,
        readonly onLeader?: () => void
    ) {
        this.broadcastRef = subscribeBroadcastChannel(topic, (message: BroadcastMessage | ServiceMessage) => {
            console.log('onMessage', message)

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
            if (onLeader) {
                onLeader()
            }
            
            this.broadcastRef.channel.postMessage({
                version: 1,
                path: [],
                value: unmountedLink.value
            })
            
            this.statusState.nested.isLeader.set(true);
            if (this.statusState.value.isLoading) {
                this.statusState.nested.isLoading.set(false);
            }
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
export function Broadcasted(topic: string, onLeader?: () => void): () => Plugin;
export function Broadcasted<S>(self: StateLink<S>): BroadcastedExtensions;
export function Broadcasted<S>(selfOrTopic?: StateLink<S> | string,
    onLeader?: () => void): (() => Plugin) | BroadcastedExtensions {
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
            'plugin-persisted-data-key-7',
            () => {
                console.log('this tab is a leader') 
            },
        ))
    // React.useEffect(() => {
    //     let i = 0;
    //     const timer = setInterval(() => {
    //         i += 1
    //         state.nested[1].nested.name.set(i.toString())
    //     }, 1000)
    //     return () => {
    //         clearInterval(timer)
    //     }
    // })
    const statusState = useStateLink(Broadcasted(state).status())
    if (statusState.isLoading()) {
        return <p>Synchronising data with other tabs...</p>
    }
    return <>
        <p>Is leader: {statusState.isLeader().toString()}</p>
        <DataEditor state={state} />
    </>
}

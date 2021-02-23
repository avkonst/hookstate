import { BroadcastChannel, createLeaderElection } from 'broadcast-channel';
import {
    Path,
    StateValueAtPath,
    Plugin,
    PluginCallbacks,
    StateValueAtRoot,
    none,
    PluginCallbacksOnSetArgument,
    State
} from '@hookstate/core';

type OnLeaderSubscriber = () => void

function activateLeaderElection() {
    let thisInstanceId = -1
    let isLeader = false;

    let channel = new BroadcastChannel<number>('hookstate-broadcasted-system-channel');
    let elector = createLeaderElection(channel);

    const subscribers = new Set<OnLeaderSubscriber>()
    
    const onLeader = () => {
        thisInstanceId = Math.random()
        const capturedInstanceId = thisInstanceId;
        channel.postMessage(thisInstanceId)
        
        // There is a bug in broadcast-channel
        // which causes 2 leaders claimed elected simultaneously
        // This is a workaround for the problem:
        // the tab may revoke leadership itself (see above)
        // so we delay the action
        setTimeout(() => {
            // if leadership has not been revoked
            if (capturedInstanceId === thisInstanceId) {
                isLeader = true
                subscribers.forEach(s => s())
                subscribers.clear()
            }
        }, 500)        
    }

    const onMessage = (otherId: number) => {
        if (thisInstanceId === -1) {
            // has not been elected
            return;
        }
        
        if (isLeader) {
            window.location.reload()
            // has been elected and the leadership has been established for this tab
            // other tab can not claim it after, if it happened it is an error
        }

        window.console.warn('other tab claimed leadership too!')
        if (otherId > thisInstanceId) {
            window.console.warn('other tab has got leadership priority')
            
            // revoke leadership 
            thisInstanceId = -1;

            // and recreate the channel
            channel.onmessage = null;
            elector.die()
            channel.close()
            
            channel = new BroadcastChannel<number>('hookstate-broadcasted-system-channel');
            channel.onmessage = onMessage
            elector = createLeaderElection(channel);
            elector.awaitLeadership().then(onLeader)
        }
    };

    channel.onmessage = onMessage
    elector.awaitLeadership().then(onLeader)

    return {
        subscribe(s: OnLeaderSubscriber) {
            if (!isLeader) {
                subscribers.add(s)
            } else {
                s()
            }
        },
        unsubscribe(s: OnLeaderSubscriber) {
            if (!isLeader) {
                subscribers.delete(s)
            }
        }
    }
}

const SystemLeaderSubscription = activateLeaderElection()
// SystemLeaderSubscription.subscribe(() => {
//     if (window) {
//         window.console.info('[@hookstate/broadcasted]: this tab is a leader')
//     } 
// })

interface BroadcastChannelHandle<T> {
    topic: string,
    channel: BroadcastChannel<T>,
    onMessage: (m: T) => void
    onLeader: () => void
}
function subscribeBroadcastChannel<T>(
    topic: string,
    onMessage: (m: T) => void,
    onLeader: () => void): BroadcastChannelHandle<T> {
    const channel = new BroadcastChannel<T>(topic);
    channel.onmessage = (m) => onMessage(m);
    
    SystemLeaderSubscription.subscribe(onLeader)

    return {
        topic,
        channel,
        onMessage,
        onLeader
    }
}
function unsubscribeBroadcastChannel<T>(handle: BroadcastChannelHandle<T>) {
    SystemLeaderSubscription.unsubscribe(handle.onLeader)

    handle.channel.onmessage = null;
    handle.channel.close()
}

function generateUniqueId() {
    return `${new Date().getTime().toString()}.${Math.random().toString(16)}`
}

interface BroadcastMessage {
    readonly version: number;
    readonly path: Path,
    readonly value?: StateValueAtPath, // absent when None
    
    readonly tag: string,
    readonly expectedTag?: string,
    
    readonly srcInstance: string,
    readonly dstInstance?: string,
}

interface ServiceMessage {
    readonly version: number;
    readonly kind: 'request-initial';
    readonly srcInstance: string;
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

const PluginID = Symbol('Broadcasted');

class BroadcastedPluginInstance implements PluginCallbacks {
    private broadcastRef: BroadcastChannelHandle<BroadcastMessage | ServiceMessage>;
    private isDestroyed = false;
    private isBroadcastEnabled = true;
    private isLeader: boolean | undefined = undefined;
    private currentTag = generateUniqueId();
    private instanceId = generateUniqueId();
    
    constructor(
        readonly topic: string,
        readonly state: State<StateValueAtRoot>,
        readonly onLeader?: (link: State<StateValueAtRoot>, wasFollower: boolean) => void
    ) {
        this.broadcastRef = subscribeBroadcastChannel(topic, (message: BroadcastMessage | ServiceMessage) => {
            // window.console.trace('[@hookstate/broadcasted]: received message', topic, message)
            
            if (message.version > 1) {
                return;
            }
            if ('kind' in message) {
                if (this.isLeader && message.kind === 'request-initial') {
                    this.submitValueFromState(message.srcInstance)
                }
                return;
            }
            
            if (message.path.length === 0 || !state.promised) {
                if (message.dstInstance && message.dstInstance !== this.instanceId) {
                    return;
                }

                if (message.expectedTag && this.currentTag !== message.expectedTag) {
                    // window.console.trace('[@hookstate/broadcasted]: conflicting update at path:', message.path);
                    if (this.isLeader) {
                        this.submitValueFromState(message.srcInstance)
                    } else {
                        this.requestValue()
                    }
                    return;
                }
                
                let targetState = state;
                for (let i = 0; i < message.path.length; i += 1) {
                    const p = message.path[i];
                    try {
                        targetState = targetState.nested(p)
                    } catch {
                        // window.console.trace('[@hookstate/broadcasted]: broken tree at path:', message.path);
                        this.requestValue()
                        return;
                    }
                }
                
                if (this.isLeader === undefined) {
                    this.isLeader = false; // follower
                }
                
                this.isBroadcastEnabled = false;
                targetState.set('value' in message ? message.value : none)
                this.currentTag = message.tag;
                this.isBroadcastEnabled = true;
            }
        }, () => {
            const wasFollower = this.isLeader === false
            this.isLeader = true;
            
            if (onLeader) {
                onLeader(state, wasFollower)
            } else if (!wasFollower) {
                this.submitValueFromState()
            }
        })
        
        this.requestValue()
    }
    
    requestValue() {
        if (this.isDestroyed) {
            return;
        }
        
        const message: ServiceMessage = {
            version: 1,
            kind: 'request-initial',
            srcInstance: this.instanceId
        }
        // window.console.trace('[@hookstate/broadcasted]: sending message', this.topic, message);
        this.broadcastRef.channel.postMessage(message)
    }

    submitValueFromState(dst?: string) {
        let [_, controls] = this.state.attach(PluginID);
        this.submitValue(
            this.state.promised
                ? { path: [] }
                : { path: [], value: controls.getUntracked() },
            undefined,
            dst)
    }
    
    submitValue(source: { path: Path, value?: StateValueAtRoot }, newTag?: string, dst?: string) {
        if (this.isDestroyed) {
            return;
        }

        const message: Writeable<BroadcastMessage> = {
            ...source,
            version: 1,
            tag: this.currentTag,
            srcInstance: this.instanceId
        }
        if (newTag) {
            message.expectedTag = this.currentTag
            message.tag = newTag
            this.currentTag = newTag
        }
        if (dst) {
            message.dstInstance = dst
        }
        // window.console.trace('[@hookstate/broadcasted]: sending message', this.topic, message);
        this.broadcastRef.channel.postMessage(message)
    }
    
    onDestroy() {
        this.isDestroyed = true;
        unsubscribeBroadcastChannel(this.broadcastRef)
    }
    
    onSet(p: PluginCallbacksOnSetArgument) {
        if (this.isBroadcastEnabled) {
            this.submitValue(
                'value' in p ? { path: p.path, value: p.value } : { path: p.path },
                generateUniqueId())
        }
    }
    
    getTopic() {
        return this.topic;
    }
    
    getInitial() {
        return undefined;
    }
}

interface BroadcastedExtensions {
    topic(): string
}

// tslint:disable-next-line: function-name
export function Broadcasted<S>(
    topic: string,
    onLeader?: (link: State<StateValueAtRoot>, wasFollower: boolean) => void
): () => Plugin;
export function Broadcasted<S>(
    self: State<S>
): BroadcastedExtensions;
export function Broadcasted<S>(
    selfOrTopic: State<S> | string,
    onLeader?: (link: State<StateValueAtRoot>, wasFollower: boolean) => void
): (() => Plugin) | BroadcastedExtensions {
    if (typeof selfOrTopic !== 'string') {
        const self = selfOrTopic as State<S>;
        const [instance, ] = self.attach(PluginID);
        if (instance instanceof Error) {
            throw instance;
        }
        const inst = instance as BroadcastedPluginInstance;
        return {
            topic() {
                return inst.getTopic();
            }
        }
    }
    
    return () => ({
        id: PluginID,
        init: (state) => {
            return new BroadcastedPluginInstance(selfOrTopic as string, state, onLeader);
        }
    })
}

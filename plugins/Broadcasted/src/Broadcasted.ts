import { BroadcastChannel, createLeaderElection } from 'broadcast-channel';
import {
    Path,
    StateValueAtPath,
    Plugin,
    PluginCallbacks,
    StateValueAtRoot,
    none,
    PluginCallbacksOnSetArgument,
    State,
    Extension,
    __State
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

export interface Broadcasted {
    broadcastTopic: string,
    broadcastLeader: boolean | undefined,
}

export function broadcasted<S, E>(
    topic?: string, // if undefined, reads topic ID from the Identifiable extension
    onLeader?: (link: State<S, Broadcasted & E>, wasFollower: boolean) => void
): (typemarker?: __State<S, E>) => Extension<Broadcasted> {
    return () => {
        let topicId: string;
        let broadcastRef: BroadcastChannelHandle<BroadcastMessage | ServiceMessage> | undefined = undefined;
        let stateAccessor: () => State<StateValueAtRoot>;

        let isBroadcastEnabled = true;
        let isLeader: boolean | undefined = undefined;
        let currentTag = generateUniqueId();
        let instanceId = generateUniqueId();

        function submitValueFromState(dst?: string) {
            let state = stateAccessor()
            submitValue(
                (state.promised || state.error !== undefined)
                    ? { path: [] }
                    : { path: [], value: state.get({ noproxy: true }) },
                undefined,
                dst)
        }

        function submitValue(source: { path: Path, value?: StateValueAtRoot }, newTag?: string, dst?: string) {
            if (broadcastRef === undefined) {
                return;
            }

            const message: Writeable<BroadcastMessage> = {
                ...source,
                version: 1,
                tag: currentTag,
                srcInstance: instanceId
            }
            if (newTag) {
                message.expectedTag = currentTag
                message.tag = newTag
                currentTag = newTag
            }
            if (dst) {
                message.dstInstance = dst
            }
            // window.console.trace('[@hookstate/broadcasted]: sending message', this.topic, message);
            broadcastRef.channel.postMessage(message)
        }

        return {
            onCreate: (sf) => {
                stateAccessor = sf
                return {
                    broadcastTopic: () => topicId,
                    broadcastLeader: () => isLeader
                }
            },
            onInit: (state, extensionMethods) => {
                if (topic) {
                    topicId = topic
                } else {
                    if (extensionMethods['identifier'] === undefined) {
                        throw Error('State is missing Identifiable extension')
                    }
                    topicId = extensionMethods['identifier']?.(state);
                }

                function requestValue() {
                    if (broadcastRef === undefined) {
                        return;
                    }
                    const message: ServiceMessage = {
                        version: 1,
                        kind: 'request-initial',
                        srcInstance: instanceId
                    }
                    // window.console.trace('[@hookstate/broadcasted]: sending message', this.topic, message);
                    broadcastRef.channel.postMessage(message)
                }

                broadcastRef = subscribeBroadcastChannel(topicId, (message: BroadcastMessage | ServiceMessage) => {
                    // window.console.trace('[@hookstate/broadcasted]: received message', topic, message)

                    if (message.version > 1) {
                        return;
                    }
                    if ('kind' in message) {
                        if (isLeader && message.kind === 'request-initial') {
                            submitValueFromState(message.srcInstance)
                        }
                        return;
                    }

                    const rootState = stateAccessor()
                    if (message.path.length === 0 || !rootState.promised) {
                        if (message.dstInstance && message.dstInstance !== instanceId) {
                            return;
                        }

                        if (message.expectedTag && currentTag !== message.expectedTag) {
                            // window.console.trace('[@hookstate/broadcasted]: conflicting update at path:', message.path);
                            if (isLeader) {
                                submitValueFromState(message.srcInstance)
                            } else {
                                requestValue()
                            }
                            return;
                        }

                        let targetState = rootState;
                        for (let i = 0; i < message.path.length; i += 1) {
                            const p = message.path[i];
                            try {
                                targetState = targetState.nested(p)
                            } catch {
                                // window.console.trace('[@hookstate/broadcasted]: broken tree at path:', message.path);
                                requestValue()
                                return;
                            }
                        }

                        if (isLeader === undefined) {
                            isLeader = false; // follower
                        }

                        isBroadcastEnabled = false;
                        targetState.set('value' in message ? message.value : none)
                        currentTag = message.tag;
                        isBroadcastEnabled = true;
                    }
                }, () => {
                    const wasFollower = isLeader === false
                    isLeader = true;

                    if (onLeader) {
                        onLeader(stateAccessor() as unknown as State<S, Broadcasted & E>, wasFollower)
                    } else if (!wasFollower) {
                        submitValueFromState()
                    }
                })

                requestValue()
            },
            onDestroy: () => {
                if (broadcastRef === undefined) {
                    return;
                }
                unsubscribeBroadcastChannel(broadcastRef)
                broadcastRef = undefined
            },
            onSet: (s) => {
                if (isBroadcastEnabled) {
                    submitValue(
                        (s.promised || s.error !== undefined)
                            ? { path: s.path }
                            : { path: s.path, value: s.value },
                        generateUniqueId())
                }
            }
        }
    }
}

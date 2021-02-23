import { BroadcastChannel, createLeaderElection } from 'broadcast-channel';
import { none } from '@hookstate/core';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function activateLeaderElection() {
    var thisInstanceId = -1;
    var isLeader = false;
    var channel = new BroadcastChannel('hookstate-broadcasted-system-channel');
    var elector = createLeaderElection(channel);
    var subscribers = new Set();
    var onLeader = function () {
        thisInstanceId = Math.random();
        var capturedInstanceId = thisInstanceId;
        channel.postMessage(thisInstanceId);
        // There is a bug in broadcast-channel
        // which causes 2 leaders claimed elected simultaneously
        // This is a workaround for the problem:
        // the tab may revoke leadership itself (see above)
        // so we delay the action
        setTimeout(function () {
            // if leadership has not been revoked
            if (capturedInstanceId === thisInstanceId) {
                isLeader = true;
                subscribers.forEach(function (s) { return s(); });
                subscribers.clear();
            }
        }, 500);
    };
    var onMessage = function (otherId) {
        if (thisInstanceId === -1) {
            // has not been elected
            return;
        }
        if (isLeader) {
            window.location.reload();
            // has been elected and the leadership has been established for this tab
            // other tab can not claim it after, if it happened it is an error
        }
        window.console.warn('other tab claimed leadership too!');
        if (otherId > thisInstanceId) {
            window.console.warn('other tab has got leadership priority');
            // revoke leadership 
            thisInstanceId = -1;
            // and recreate the channel
            channel.onmessage = null;
            elector.die();
            channel.close();
            channel = new BroadcastChannel('hookstate-broadcasted-system-channel');
            channel.onmessage = onMessage;
            elector = createLeaderElection(channel);
            elector.awaitLeadership().then(onLeader);
        }
    };
    channel.onmessage = onMessage;
    elector.awaitLeadership().then(onLeader);
    return {
        subscribe: function (s) {
            if (!isLeader) {
                subscribers.add(s);
            }
            else {
                s();
            }
        },
        unsubscribe: function (s) {
            if (!isLeader) {
                subscribers.delete(s);
            }
        }
    };
}
var SystemLeaderSubscription = activateLeaderElection();
function subscribeBroadcastChannel(topic, onMessage, onLeader) {
    var channel = new BroadcastChannel(topic);
    channel.onmessage = function (m) { return onMessage(m); };
    SystemLeaderSubscription.subscribe(onLeader);
    return {
        topic: topic,
        channel: channel,
        onMessage: onMessage,
        onLeader: onLeader
    };
}
function unsubscribeBroadcastChannel(handle) {
    SystemLeaderSubscription.unsubscribe(handle.onLeader);
    handle.channel.onmessage = null;
    handle.channel.close();
}
function generateUniqueId() {
    return new Date().getTime().toString() + "." + Math.random().toString(16);
}
var PluginID = Symbol('Broadcasted');
var BroadcastedPluginInstance = /** @class */ (function () {
    function BroadcastedPluginInstance(topic, state, onLeader) {
        var _this = this;
        this.topic = topic;
        this.state = state;
        this.onLeader = onLeader;
        this.isDestroyed = false;
        this.isBroadcastEnabled = true;
        this.isLeader = undefined;
        this.currentTag = generateUniqueId();
        this.instanceId = generateUniqueId();
        this.broadcastRef = subscribeBroadcastChannel(topic, function (message) {
            // window.console.trace('[@hookstate/broadcasted]: received message', topic, message)
            if (message.version > 1) {
                return;
            }
            if ('kind' in message) {
                if (_this.isLeader && message.kind === 'request-initial') {
                    _this.submitValueFromState(message.srcInstance);
                }
                return;
            }
            if (message.path.length === 0 || !state.promised) {
                if (message.dstInstance && message.dstInstance !== _this.instanceId) {
                    return;
                }
                if (message.expectedTag && _this.currentTag !== message.expectedTag) {
                    // window.console.trace('[@hookstate/broadcasted]: conflicting update at path:', message.path);
                    if (_this.isLeader) {
                        _this.submitValueFromState(message.srcInstance);
                    }
                    else {
                        _this.requestValue();
                    }
                    return;
                }
                var targetState = state;
                for (var i = 0; i < message.path.length; i += 1) {
                    var p = message.path[i];
                    try {
                        targetState = targetState.nested(p);
                    }
                    catch (_a) {
                        // window.console.trace('[@hookstate/broadcasted]: broken tree at path:', message.path);
                        _this.requestValue();
                        return;
                    }
                }
                if (_this.isLeader === undefined) {
                    _this.isLeader = false; // follower
                }
                _this.isBroadcastEnabled = false;
                targetState.set('value' in message ? message.value : none);
                _this.currentTag = message.tag;
                _this.isBroadcastEnabled = true;
            }
        }, function () {
            var wasFollower = _this.isLeader === false;
            _this.isLeader = true;
            if (onLeader) {
                onLeader(state, wasFollower);
            }
            else if (!wasFollower) {
                _this.submitValueFromState();
            }
        });
        this.requestValue();
    }
    BroadcastedPluginInstance.prototype.requestValue = function () {
        if (this.isDestroyed) {
            return;
        }
        var message = {
            version: 1,
            kind: 'request-initial',
            srcInstance: this.instanceId
        };
        // window.console.trace('[@hookstate/broadcasted]: sending message', this.topic, message);
        this.broadcastRef.channel.postMessage(message);
    };
    BroadcastedPluginInstance.prototype.submitValueFromState = function (dst) {
        var _a = this.state.attach(PluginID), _ = _a[0], controls = _a[1];
        this.submitValue(this.state.promised
            ? { path: [] }
            : { path: [], value: controls.getUntracked() }, undefined, dst);
    };
    BroadcastedPluginInstance.prototype.submitValue = function (source, newTag, dst) {
        if (this.isDestroyed) {
            return;
        }
        var message = __assign(__assign({}, source), { version: 1, tag: this.currentTag, srcInstance: this.instanceId });
        if (newTag) {
            message.expectedTag = this.currentTag;
            message.tag = newTag;
            this.currentTag = newTag;
        }
        if (dst) {
            message.dstInstance = dst;
        }
        // window.console.trace('[@hookstate/broadcasted]: sending message', this.topic, message);
        this.broadcastRef.channel.postMessage(message);
    };
    BroadcastedPluginInstance.prototype.onDestroy = function () {
        this.isDestroyed = true;
        unsubscribeBroadcastChannel(this.broadcastRef);
    };
    BroadcastedPluginInstance.prototype.onSet = function (p) {
        if (this.isBroadcastEnabled) {
            this.submitValue('value' in p ? { path: p.path, value: p.value } : { path: p.path }, generateUniqueId());
        }
    };
    BroadcastedPluginInstance.prototype.getTopic = function () {
        return this.topic;
    };
    BroadcastedPluginInstance.prototype.getInitial = function () {
        return undefined;
    };
    return BroadcastedPluginInstance;
}());
function Broadcasted(selfOrTopic, onLeader) {
    if (typeof selfOrTopic !== 'string') {
        var self_1 = selfOrTopic;
        var instance = self_1.attach(PluginID)[0];
        if (instance instanceof Error) {
            throw instance;
        }
        var inst_1 = instance;
        return {
            topic: function () {
                return inst_1.getTopic();
            }
        };
    }
    return function () { return ({
        id: PluginID,
        init: function (state) {
            return new BroadcastedPluginInstance(selfOrTopic, state, onLeader);
        }
    }); };
}

export { Broadcasted };
//# sourceMappingURL=index.es.js.map

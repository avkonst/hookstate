'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@hookstate/core');

var PluginID = Symbol('Previous');
var PreviousInstance = function () { return ({
    previous: undefined,
    onSet: function (data) {
        this.previous = data.previous;
    },
    get: function () {
        return this.previous;
    }
}); };
function Previous(state) {
    if (state === undefined) {
        return {
            id: PluginID,
            init: function () { return PreviousInstance(); }
        };
    }
    var instance = state[core.self].attach(PluginID)[0];
    var inst = instance;
    return inst.get();
}

exports.Previous = Previous;
//# sourceMappingURL=index.js.map

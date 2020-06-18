import { self } from '@hookstate/core';

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
    var instance = state[self].attach(PluginID)[0];
    var inst = instance;
    return inst.get();
}

export { Previous };
//# sourceMappingURL=index.es.js.map

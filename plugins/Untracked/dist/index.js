'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@hookstate/core');

var PluginID = Symbol('Untracked');
function Untracked($this) {
    if ($this) {
        if ($this[core.StateMarkerID]) {
            var th = $this;
            var _a = th[core.self].attach(PluginID), _1 = _a[0], controls_1 = _a[1];
            return {
                get: function () { return controls_1.getUntracked(); },
                set: function (v) { return controls_1.setUntracked(v); },
                merge: function (v) { return controls_1.mergeUntracked(v); }
            };
        }
        else {
            var link_1 = $this.with(PluginID)[0];
            return {
                get: function () { return link_1.getUntracked(); },
                set: function (v) { return link_1.setUntracked(v); },
                merge: function (v) { return link_1.mergeUntracked(v); }
            };
        }
    }
    return {
        id: PluginID,
        create: function () { return ({}); }
    };
}

exports.Untracked = Untracked;
//# sourceMappingURL=index.js.map

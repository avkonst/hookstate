'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PluginID = Symbol('Untracked');
function Untracked(self) {
    if (self) {
        var link_1 = self.with(PluginID)[0];
        return {
            get: function () { return link_1.getUntracked(); },
            set: function (v) { return link_1.setUntracked(v); },
            merge: function (v) { return link_1.mergeUntracked(v); }
        };
    }
    return {
        id: PluginID,
        create: function () { return ({}); }
    };
}

exports.Untracked = Untracked;
//# sourceMappingURL=index.js.map

import { StateMarkerID, self } from '@hookstate/core';

var LoggerPluginInstance = /** @class */ (function () {
    function LoggerPluginInstance() {
    }
    LoggerPluginInstance.prototype.toJsonTrimmed = function (s) {
        var limit = 100;
        var r = JSON.stringify(s);
        if (r && r.length > 100) {
            return r.slice(0, limit) + "... (" + (r.length - limit) + " characters trunkated)";
        }
        return r;
    };
    LoggerPluginInstance.prototype.onSet = function (p) {
        // tslint:disable-next-line: no-console
        console.log("[hookstate]: new value set at path '/" + p.path.join('/') + "': " +
            ("" + this.toJsonTrimmed(p.value)), p);
    };
    LoggerPluginInstance.prototype.log = function (path, l) {
        // tslint:disable-next-line: no-console
        return console.log("[hookstate]: current value at path '/" + path.join('/') + ": " +
            (this.toJsonTrimmed(l.getUntracked()) + "'"), {
            path: path,
            value: l.getUntracked()
        });
    };
    return LoggerPluginInstance;
}());
var PluginID = Symbol('Logger');
function Logger($this) {
    if ($this) {
        if ($this[StateMarkerID]) {
            var th_1 = $this;
            var _a = th_1[self].attach(PluginID), instance = _a[0], controls_1 = _a[1];
            if (instance instanceof Error) {
                // auto attach instead of throwing
                Logger(th_1);
                instance = th_1[self].attach(PluginID)[0];
            }
            var inst_1 = instance;
            return {
                log: function () { return inst_1.log(th_1[self].path, controls_1); }
            };
        }
        else {
            var _b = $this.with(PluginID), link_1 = _b[0], instance = _b[1];
            var inst_2 = instance;
            return {
                log: function () { return inst_2.log(link_1.path, link_1); }
            };
        }
    }
    return {
        id: PluginID,
        init: function () {
            // tslint:disable-next-line: no-console
            console.log("[hookstate]: logger attached");
            return new LoggerPluginInstance();
        }
    };
}

export { Logger };
//# sourceMappingURL=index.es.js.map

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    LoggerPluginInstance.prototype.log = function (l) {
        // tslint:disable-next-line: no-console
        return console.log("[hookstate]: current value at path '/" + l.path.join('/') + ": " +
            (this.toJsonTrimmed(l.getUntracked()) + "'"), {
            path: l.path,
            value: l.getUntracked()
        });
    };
    return LoggerPluginInstance;
}());
var PluginID = Symbol('Logger');
function Logger(self) {
    if (self) {
        var _a = self.with(PluginID), link_1 = _a[0], instance = _a[1];
        var inst_1 = instance;
        return {
            log: function () { return inst_1.log(link_1); }
        };
    }
    return {
        id: PluginID,
        create: function () {
            // tslint:disable-next-line: no-console
            console.log("[hookstate]: logger attached");
            return new LoggerPluginInstance();
        }
    };
}

exports.Logger = Logger;
//# sourceMappingURL=index.js.map

var LoggerPluginInstance = /** @class */ (function () {
    function LoggerPluginInstance() {
    }
    LoggerPluginInstance.prototype.toJsonTrimmed = function (s) {
        var limit = 100;
        var r = JSON.stringify(s);
        if (r.length > 100) {
            return r.slice(0, limit) + "... (" + (r.length - limit) + " characters trunkated)";
        }
        return r;
    };
    LoggerPluginInstance.prototype.getAtPath = function (v, path) {
        var result = v;
        path.forEach(function (p) {
            result = result[p];
        });
        return result;
    };
    LoggerPluginInstance.prototype.onInit = function () {
        // tslint:disable-next-line: no-console
        console.log("[hookstate]: logger attached");
    };
    LoggerPluginInstance.prototype.onSet = function (p, v) {
        var newValue = this.getAtPath(v, p);
        // tslint:disable-next-line: no-console
        console.log("[hookstate]: new value set at path '/" + p.join('/') + "': " +
            ("" + this.toJsonTrimmed(newValue)), {
            path: p,
            value: newValue
        });
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
        instanceFactory: function () {
            return new LoggerPluginInstance();
        }
    };
}

export { Logger };
//# sourceMappingURL=index.es.js.map

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var reactHookstate = require('react-hookstate');

var PluginID = Symbol('Logger');
// tslint:disable-next-line: function-name
function Logger(unused) {
    var toJsonTrimmed = function (s) {
        var limit = 100;
        var r = JSON.stringify(s);
        if (r.length > 100) {
            return r.slice(0, limit) + "... (" + (r.length - limit) + " characters trunkated)";
        }
        return r;
    };
    return {
        id: PluginID,
        instanceFactory: function () {
            var getAtPath = function (v, path) {
                var result = v;
                path.forEach(function (p) {
                    result = result[p];
                });
                return result;
            };
            return {
                onInit: function () {
                    // tslint:disable-next-line: no-console
                    console.log("[hookstate]: logger attached");
                },
                onSet: function (p, v) {
                    var newValue = getAtPath(v, p);
                    // tslint:disable-next-line: no-console
                    console.log("[hookstate]: new value set at path '/" + p.join('/') + "': " +
                        ("" + toJsonTrimmed(newValue)), {
                        path: p,
                        value: newValue
                    });
                },
                extensions: ['log'],
                extensionsFactory: function (l) { return ({
                    log: function () {
                        l.with(reactHookstate.DisabledTracking); // everything is touched by the JSON, so no point to track
                        // tslint:disable-next-line: no-console
                        return console.log("[hookstate]: current value at path '/" + l.path.join('/') + ": " +
                            (toJsonTrimmed(l.value) + "'"), {
                            path: l.path,
                            value: l.value
                        });
                    }
                }); }
            };
        }
    };
}

exports.Logger = Logger;
//# sourceMappingURL=index.js.map

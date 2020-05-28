import { self, Downgraded } from '@hookstate/core';
import { Initial } from '@hookstate/initial';

var PluginID = Symbol('Touched');
var TouchedPluginInstance = /** @class */ (function () {
    function TouchedPluginInstance() {
        var _this = this;
        this.touchedState = undefined;
        this.setTouched = function (path) {
            _this.touchedState = _this.touchedState || {};
            var result = _this.touchedState;
            if (path.length === 0) {
                result[PluginID] = true;
            }
            path.forEach(function (p, i) {
                result[p] = result[p] || {};
                result = result[p];
                if (i === path.length - 1) {
                    result[PluginID] = true;
                }
            });
        };
        this.getTouched = function (path) {
            var result = _this.touchedState;
            var somethingVisted = false;
            var somethingTouched = false;
            path.forEach(function (p, i) {
                if (result) {
                    somethingVisted = true;
                    somethingTouched = result[PluginID] ? true : somethingTouched;
                    result = result[p];
                }
            });
            if (result) {
                return true;
            }
            if (!somethingVisted) {
                return false;
            }
            if (!somethingTouched) {
                return false;
            }
            return undefined;
        };
        this.touched = function (l) {
            var t = _this.getTouched(l.path);
            if (t !== undefined) {
                // For optimization purposes, there is nothing being used from the link value
                // as a result it is left untracked and no rerender happens for the result of this function
                // when the source value is updated.
                // We do the trick to fix it, we mark the value being 'deeply used',
                // so any changes for this value or any nested will trigger rerender.
                var _1 = l.attach(Downgraded)[self].value;
                return t;
            }
            return Initial(l[self]).modified();
        };
    }
    TouchedPluginInstance.prototype.onSet = function (p) {
        this.setTouched(p.path);
    };
    return TouchedPluginInstance;
}());
function Touched($this) {
    if ($this) {
        var th_1 = $this;
        var _a = th_1[self].attach(PluginID), instance = _a[0], controls = _a[1];
        if (instance instanceof Error) {
            throw instance;
        }
        var inst_1 = instance;
        return {
            touched: function () { return inst_1.touched(th_1[self]); },
            untouched: function () { return !inst_1.touched(th_1[self]); }
        };
    }
    return {
        id: PluginID,
        init: function () {
            return new TouchedPluginInstance();
        }
    };
}

export { Touched };
//# sourceMappingURL=index.es.js.map

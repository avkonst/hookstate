'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var core = require('@hookstate/core');
var isEqual = _interopDefault(require('lodash.isequal'));
var cloneDeep = _interopDefault(require('lodash.clonedeep'));

var InitialPluginInstance = /** @class */ (function () {
    function InitialPluginInstance(initialValue) {
        var _this = this;
        this.getInitial = function (path) {
            var result = _this.initialState;
            path.forEach(function (p) {
                result = result && result[p];
            });
            return result;
        };
        this.getModified = function (l) {
            l.attach(core.Downgraded);
            return !isEqual(l.value, _this.getInitial(l.path));
        };
        this.initialState = cloneDeep(initialValue);
    }
    return InitialPluginInstance;
}());
var PluginID = Symbol('Initial');
function Initial($this) {
    if ($this) {
        if ($this[core.StateMarkerID]) {
            var $th_1 = $this;
            var _a = $th_1[core.self].attach(PluginID), instance = _a[0], link = _a[1];
            if (instance instanceof Error) {
                throw instance;
            }
            var inst_1 = instance;
            return {
                get: function () { return inst_1.getInitial($th_1[core.self].path); },
                modified: function () { return inst_1.getModified($th_1[core.self]); },
                unmodified: function () { return !inst_1.getModified($th_1[core.self]); }
            };
        }
        else {
            var _b = $this.with(PluginID), link_1 = _b[0], instance = _b[1];
            var inst_2 = instance;
            return {
                get: function () { return inst_2.getInitial(link_1.path); },
                modified: function () { return inst_2.getModified(link_1); },
                unmodified: function () { return !inst_2.getModified(link_1); }
            };
        }
    }
    return {
        id: PluginID,
        create: function (state) {
            return new InitialPluginInstance(state.value);
        }
    };
}

exports.Initial = Initial;
//# sourceMappingURL=index.js.map

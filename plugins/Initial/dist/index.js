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
        var $th_1 = $this;
        var instance = $th_1[core.self].attach(PluginID)[0];
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
    return {
        id: PluginID,
        init: function (state) {
            return new InitialPluginInstance(state[core.self].value);
        }
    };
}

exports.Initial = Initial;
//# sourceMappingURL=index.js.map

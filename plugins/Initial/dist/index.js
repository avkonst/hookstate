'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@hookstate/core');
var isEqual = require('lodash.isequal');
var cloneDeep = require('lodash.clonedeep');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var isEqual__default = /*#__PURE__*/_interopDefaultLegacy(isEqual);
var cloneDeep__default = /*#__PURE__*/_interopDefaultLegacy(cloneDeep);

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
            return !isEqual__default["default"](l.value, _this.getInitial(l.path));
        };
        this.initialState = cloneDeep__default["default"](initialValue);
    }
    return InitialPluginInstance;
}());
var PluginID = Symbol('Initial');
function Initial($this) {
    if ($this) {
        var $th_1 = $this;
        var instance = $th_1.attach(PluginID)[0];
        if (instance instanceof Error) {
            throw instance;
        }
        var inst_1 = instance;
        return {
            get: function () { return inst_1.getInitial($th_1.path); },
            modified: function () { return inst_1.getModified($th_1); },
            unmodified: function () { return !inst_1.getModified($th_1); }
        };
    }
    return {
        id: PluginID,
        init: function (state) {
            return new InitialPluginInstance(state.value);
        }
    };
}

exports.Initial = Initial;
//# sourceMappingURL=index.js.map

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
            l.with(core.DisabledTracking);
            return !isEqual(l.value, _this.getInitial(l.path));
        };
        this.initialState = cloneDeep(initialValue);
    }
    return InitialPluginInstance;
}());
var PluginID = Symbol('Initial');
function Initial(self) {
    if (self) {
        var _a = self.with(PluginID), link_1 = _a[0], instance = _a[1];
        var inst_1 = instance;
        return {
            get: function () { return inst_1.getInitial(link_1.path); },
            modified: function () { return inst_1.getModified(link_1); },
            unmodified: function () { return !inst_1.getModified(link_1); }
        };
    }
    return {
        id: PluginID,
        instanceFactory: function (initialValue) {
            return new InitialPluginInstance(initialValue);
        }
    };
}

exports.Initial = Initial;
//# sourceMappingURL=index.js.map

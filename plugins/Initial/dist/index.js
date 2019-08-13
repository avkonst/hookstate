'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var core = require('@hookstate/core');
var isEqual = _interopDefault(require('lodash.isequal'));
var cloneDeep = _interopDefault(require('lodash.clonedeep'));

var PluginID = Symbol('Initial');
// tslint:disable-next-line: function-name
function Initial(unused) {
    return {
        id: PluginID,
        instanceFactory: function (initialValue) {
            var initialState = cloneDeep(initialValue);
            var getInitial = function (path) {
                var result = initialState;
                path.forEach(function (p) {
                    result = result && result[p];
                });
                return result;
            };
            var modified = function (l) {
                l.with(core.DisabledTracking);
                return !isEqual(l.value, getInitial(l.path));
            };
            return {
                extensions: ['initial', 'modified', 'unmodified'],
                extensionsFactory: function (l) { return ({
                    get initial() {
                        return getInitial(l.path);
                    },
                    get modified() {
                        return modified(l);
                    },
                    get unmodified() {
                        return !modified(l);
                    },
                }); }
            };
        }
    };
}

exports.Initial = Initial;
//# sourceMappingURL=index.js.map

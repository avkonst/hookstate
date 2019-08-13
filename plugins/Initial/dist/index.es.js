import { DisabledTracking } from '@hookstate/core';
import isEqual from 'lodash.isequal';
import cloneDeep from 'lodash.clonedeep';

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
                l.with(DisabledTracking);
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

export { Initial };
//# sourceMappingURL=index.es.js.map

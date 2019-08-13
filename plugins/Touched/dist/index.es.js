import { DisabledTracking } from '@hookstate/core';

var PluginID = Symbol('Touched');
// tslint:disable-next-line: function-name
function Touched(unused) {
    return {
        id: PluginID,
        instanceFactory: function () {
            var touchedState = undefined;
            var setTouched = function (path) {
                touchedState = touchedState || {};
                var result = touchedState;
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
            var getTouched = function (path) {
                var result = touchedState;
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
            var touched = function (l) {
                var t = getTouched(l.path);
                if (t !== undefined) {
                    // For optimization purposes, there is nothing being used from the link value
                    // as a result it is left untracked and no rerender happens for the result of this function
                    // when the source value is updated.
                    // We do the trick to fix it, we mark the value being 'deeply used',
                    // so any changes for this value or any nested will trigger rerender.
                    var _1 = l.with(DisabledTracking).value;
                    return t;
                }
                return l.extended.modified;
            };
            return {
                onSet: function (p) { return setTouched(p); },
                extensions: ['touched', 'untouched'],
                extensionsFactory: function (l) { return ({
                    get touched() {
                        return touched(l);
                    },
                    get untouched() {
                        return !touched(l);
                    },
                }); }
            };
        }
    };
}

export { Touched };
//# sourceMappingURL=index.es.js.map

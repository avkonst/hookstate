var PluginID = Symbol('LocalPersistence');
// tslint:disable-next-line: function-name
function Persistence(localStorageKey) {
    return function () { return ({
        id: PluginID,
        init: function (state) {
            var persisted = localStorage.getItem(localStorageKey);
            if (persisted !== null) {
                var result = JSON.parse(persisted);
                state.set(result);
            }
            else if (!state.promised && !!!state.error) {
                localStorage.setItem(localStorageKey, JSON.stringify(state.value));
            }
            return {
                onSet: function (p) {
                    if ('state' in p) {
                        localStorage.setItem(localStorageKey, JSON.stringify(p.state));
                    }
                    else {
                        localStorage.removeItem(localStorageKey);
                    }
                }
            };
        }
    }); };
}

export { Persistence };
//# sourceMappingURL=index.es.js.map

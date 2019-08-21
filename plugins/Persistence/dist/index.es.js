var PluginID = Symbol('LocalPersistence');
// tslint:disable-next-line: function-name
function Persistence(localStorageKey) {
    return function () {
        return {
            id: PluginID,
            instanceFactory: function (initial) {
                return {
                    onInit: function () {
                        var persisted = localStorage.getItem(localStorageKey);
                        if (persisted !== null) {
                            var result = JSON.parse(persisted);
                            return result;
                        }
                        localStorage.setItem(localStorageKey, JSON.stringify(initial));
                        return initial;
                    },
                    onSet: function (p, v) {
                        localStorage.setItem(localStorageKey, JSON.stringify(v));
                    }
                };
            }
        };
    };
}

export { Persistence };
//# sourceMappingURL=index.es.js.map

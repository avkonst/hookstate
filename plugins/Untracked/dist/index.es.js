var PluginID = Symbol('Untracked');
function Untracked(self) {
    if (self) {
        var link_1 = self.with(PluginID)[0];
        return {
            get: function () { return link_1.getUntracked(); },
            set: function (v) { return link_1.setUntracked(v); }
        };
    }
    return {
        id: PluginID
    };
}

export { Untracked };
//# sourceMappingURL=index.es.js.map

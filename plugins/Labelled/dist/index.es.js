import { StateMarkerID, self } from '@hookstate/core';

var LabelledID = Symbol('Labelled');
function Labelled(labelOrLink) {
    if (typeof labelOrLink === 'string') {
        var label_1 = labelOrLink;
        return function () { return ({
            id: LabelledID,
            init: function () {
                return {
                    label: label_1
                };
            }
        }); };
    }
    if (labelOrLink[StateMarkerID]) {
        var th = labelOrLink;
        var plugin = th[self].attach(LabelledID)[0];
        if (plugin instanceof Error) {
            return undefined;
        }
        return plugin.label;
    }
    else {
        var th = labelOrLink;
        var plugin = th.with(LabelledID, function () { return undefined; });
        return plugin && plugin[1].label;
    }
}

export { Labelled };
//# sourceMappingURL=index.es.js.map

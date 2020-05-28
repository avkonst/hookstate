'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@hookstate/core');

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
    var th = labelOrLink;
    var plugin = th[core.self].attach(LabelledID)[0];
    if (plugin instanceof Error) {
        return undefined;
    }
    return plugin.label;
}

exports.Labelled = Labelled;
//# sourceMappingURL=index.js.map

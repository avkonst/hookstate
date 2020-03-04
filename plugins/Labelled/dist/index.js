'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var LabelledID = Symbol('Labelled');
function Labelled(labelOrLink) {
    if (typeof labelOrLink === 'string') {
        var label_1 = labelOrLink;
        return function () { return ({
            id: LabelledID,
            create: function () {
                return {
                    label: label_1
                };
            }
        }); };
    }
    var plugin = labelOrLink.with(LabelledID, function () { return undefined; });
    return plugin && plugin[1].label;
}

exports.Labelled = Labelled;
//# sourceMappingURL=index.js.map

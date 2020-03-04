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

export { Labelled };
//# sourceMappingURL=index.es.js.map

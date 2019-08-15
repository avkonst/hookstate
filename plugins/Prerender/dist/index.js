'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var core = require('@hookstate/core');
var isEqual = _interopDefault(require('lodash.isequal'));

// tslint:disable-next-line: function-name
function EqualsPrerender(transform) {
    return function (link, prev) {
        link.with(core.Prerender).extended.enablePrerender(isEqual);
        return transform(link, prev);
    };
}
function ScopedPrerender(props) {
    var scoped = core.useStateLink(props.state);
    return props.children(scoped);
}

exports.EqualsPrerender = EqualsPrerender;
exports.ScopedPrerender = ScopedPrerender;
//# sourceMappingURL=index.js.map

import { Prerender, useStateLink } from '@hookstate/core';
import isEqual from 'lodash.isequal';

// tslint:disable-next-line: function-name
function EqualsPrerender(transform) {
    return function (link, prev) {
        link.with(Prerender).extended.enablePrerender(isEqual);
        return transform(link, prev);
    };
}
function ScopedPrerender(props) {
    var scoped = useStateLink(props.state);
    return props.children(scoped);
}

export { EqualsPrerender, ScopedPrerender };
//# sourceMappingURL=index.es.js.map

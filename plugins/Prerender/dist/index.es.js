import { Prerender } from '@hookstate/core';
import isEqual from 'lodash.isequal';

// tslint:disable-next-line: function-name
function EqualsPrerender(transform) {
    return function (link, prev) {
        link.with(Prerender).extended.enablePrerender(isEqual);
        return transform(link, prev);
    };
}

export { EqualsPrerender };
//# sourceMappingURL=index.es.js.map

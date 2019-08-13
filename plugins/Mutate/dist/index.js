'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function extractValue(prevValue, value) {
    if (typeof value === 'function') {
        return value(prevValue);
    }
    return value;
}
function createArrayStateMutation(setValue) {
    // All actions (except set) should crash if prevValue is null or undefined.
    // It is intentional behavior.
    // Although this situation is not allowed by type checking of the typescript,
    // it is still possible to get null coming from ValueLink (see notes in the ValueLinkImpl)
    return {
        set: setValue,
        merge: function (other) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                var source = extractValue(copy, other);
                Object.keys(source).sort().forEach(function (i) {
                    var index = Number(i);
                    copy[index] = source[index];
                });
                return copy;
            });
        },
        update: function (key, value) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy[key] = extractValue(copy[key], value);
                return copy;
            });
        },
        concat: function (other) {
            if (other) {
                setValue(function (prevValue) {
                    var copy = prevValue.slice();
                    return copy.concat(extractValue(copy, other));
                });
            }
        },
        push: function (elem) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy.push(elem);
                return copy;
            });
        },
        pop: function () {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy.pop();
                return copy;
            });
        },
        insert: function (index, elem) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy.splice(index, 0, elem);
                return copy;
            });
        },
        remove: function (index) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy.splice(index, 1);
                return copy;
            });
        },
        swap: function (index1, index2) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy[index1] = prevValue[index2];
                copy[index2] = prevValue[index1];
                return copy;
            });
        }
    };
}
function createObjectStateMutation(setValue) {
    // All actions (except set and merge with empty object) should crash
    // if prevValue is null or undefined. It is intentional behavior.
    // Although this situation is not allowed by type checking of the typescript,
    // it is still possible to get null coming from ValueLink (see notes in the ValueLinkImpl)
    var merge = function (value) {
        setValue(function (prevValue) {
            var extractedValue = extractValue(prevValue, value);
            var keys = Object.keys(extractedValue);
            if (keys.length === 0) {
                // empty object to merge with
                return prevValue;
            }
            // this causes the intended crash if merging with
            // the prevously set to undefined | null value
            // eslint-disable-next-line
            var _unused = prevValue[keys[0]];
            return __assign({}, (prevValue
                // this causes the intended crash if merging with
                // the prevously set to undefined | null value
                // and the block with _unused variable is optimized out
                // by a bundler like webpack, minify, etc.
                || Object.keys(prevValue)), extractedValue);
        });
    };
    return {
        set: setValue,
        merge: merge,
        update: function (key, value) { return merge(function (prevValue) {
            var partialResult = {};
            partialResult[key] = extractValue(
            // this causes the intended crash if updating the property of
            // the prevously set to undefined | null value
            prevValue[key], value);
            return partialResult;
        }); }
    };
}
function createStringStateMutation(setValue) {
    // reserved for future extensions
    return {
        set: setValue
    };
}
function createNumberStateMutation(setValue) {
    // reserved for future extensions
    return {
        set: setValue
    };
}
function createValueStateMutation(setValue) {
    return {
        set: setValue
    };
}
// tslint:disable-next-line: function-name
function Mutate(state) {
    if (Array.isArray(state.value)) {
        return createArrayStateMutation(function (newValue) {
            return state.set(newValue);
        });
    }
    else if (typeof state.value === 'object' && state.value !== null) {
        return createObjectStateMutation(function (newValue) {
            return state.set(newValue);
        });
    }
    else if (typeof state.value === 'string') {
        return createStringStateMutation(function (newValue) {
            return state.set(newValue);
        });
    }
    else if (typeof state.value === 'number') {
        return createNumberStateMutation(function (newValue) {
            return state.set(newValue);
        });
    }
    else {
        return createValueStateMutation(function (newValue) {
            return state.set(newValue);
        });
    }
}

exports.Mutate = Mutate;
//# sourceMappingURL=index.js.map

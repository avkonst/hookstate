function extractValue(prevValue, value) {
    if (typeof value === 'function') {
        return value(prevValue);
    }
    return value;
}
function createArrayStateMutation(state) {
    // All actions (except set) should crash if prevValue is null or undefined.
    // It is intentional behavior.
    return {
        set: function (newValue) { return state.set(newValue); },
        merge: function (other) {
            state.set(function (prevValue) {
                var source = extractValue(prevValue, other);
                Object.keys(source).sort().forEach(function (i) {
                    var index = Number(i);
                    prevValue[index] = source[index];
                });
                return prevValue;
            });
        },
        update: function (key, value) { return state.nested[key].set(value); },
        concat: function (other) {
            if (other) {
                state.set(function (prevValue) {
                    return prevValue.concat(extractValue(prevValue, other));
                });
            }
        },
        push: function (elem) {
            state.set(function (prevValue) {
                prevValue.push(elem);
                return prevValue;
            });
        },
        pop: function () {
            state.set(function (prevValue) {
                prevValue.pop();
                return prevValue;
            });
        },
        insert: function (index, elem) {
            state.set(function (prevValue) {
                prevValue.splice(index, 0, elem);
                return prevValue;
            });
        },
        remove: function (index) {
            state.set(function (prevValue) {
                prevValue.splice(index, 1);
                return prevValue;
            });
        },
        swap: function (index1, index2) {
            var p1 = state.nested[index1].get();
            var p2 = state.nested[index2].get();
            state.nested[index1].set(p2);
            state.nested[index2].set(p1);
        }
    };
}
function createObjectStateMutation(state) {
    // All actions (except set) should crash if prevValue is null or undefined.
    // It is intentional behavior.
    return {
        set: function (v) { return state.set(v); },
        merge: function (value) {
            state.set(function (prevValue) {
                var extractedValue = extractValue(prevValue, value);
                Object.keys(extractedValue).forEach(function (key) {
                    prevValue[key] = extractValue[key];
                });
                return prevValue;
            });
        },
        update: function (key, value) { return state.nested[key].set(value); }
    };
}
function createStringStateMutation(state) {
    // reserved for future extensions
    return {
        set: function (v) { return state.set(v); }
    };
}
function createNumberStateMutation(state) {
    // reserved for future extensions
    return {
        set: function (v) { return state.set(v); }
    };
}
function createValueStateMutation(state) {
    return {
        set: function (v) { return state.set(v); }
    };
}
// tslint:disable-next-line: function-name
function Mutate(state) {
    if (Array.isArray(state.value)) {
        return createArrayStateMutation(state);
    }
    else if (typeof state.value === 'object' && state.value !== null) {
        return createObjectStateMutation(state);
    }
    else if (typeof state.value === 'string') {
        return createStringStateMutation(state);
    }
    else if (typeof state.value === 'number') {
        return createNumberStateMutation(state);
    }
    else {
        return createValueStateMutation(state);
    }
}

export { Mutate };
//# sourceMappingURL=index.es.js.map

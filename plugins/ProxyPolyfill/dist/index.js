'use strict';

function isImplemented() {
    try {
        new Proxy({}, {});
        return true;
    } catch (e) {
        return false;
    }
};

function ProxyImpl(target, handler) {
    this.target = target;
    if (Array.isArray(target)) {
        return target.map((e,i) => handler.get(target, i));
    } else {
        const result = {};
        Object.keys(target).map(k => {
            result[k] = handler.get(target, k)
        })
        return result;
    }
}

function implement() {
    console.log('Polyfill Proxy');
    Object.defineProperty(require('es5-ext/global'), 'Proxy', {
        value: ProxyImpl,
        configurable: true,
        enumerable: false,
        writable: true
    });
}

function polyfill() {
    if (!isImplemented()) {
        implement();
    }
    // test before continue
    var called = false;
    var p = new Proxy({name: 1}, {
        get: (t, k) => {
            called = true;
            return t[k];
        }
    });
    var unused = p.name;
    if (!called) {
        throw new Error('Failure to polyfill Proxy');
    }
};

polyfill();

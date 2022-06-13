

class Cache<T> {
    children: Record<string | number, WeakMap<Object, T>> = {}
    current: WeakMap<Object, T> = new WeakMap()
}

const HiddenPropID = Symbol('hookstate')

// export function getCache<T>(
//     scope: Object,
//     targetObject: Object,
//     targetObjectProperty: string | number | undefined,
//     factory: () => T
// ): T {
//     if (targetObjectProperty === undefined) {
//         let targetObjectCache = targetObject[HiddenPropID] as Cache<T> | undefined;
//         if (targetObjectCache === undefined) {
//             targetObjectCache = new Cache()
//             targetObject[HiddenPropID] = targetObjectCache
//         }
//         let r = targetObjectCache.current.get(scope)
//         if (r === undefined) {
//             r = factory()
//             targetObjectCache.current.set(scope, r)
//         }
//         return r
//     }

//     let nestedValue = targetObject[targetObjectProperty]
//     if (nestedValue === Object(nestedValue)) {
//         return getCache(scope, nestedValue, undefined, factory)
//     }

//     let targetObjectCache = targetObject[HiddenPropID] as Cache<T> | undefined;
//     if (targetObjectCache === undefined) {
//         targetObjectCache = new Cache()
//         targetObject[HiddenPropID] = targetObjectCache
//     }
//     let childCache = targetObjectCache.children[targetObjectProperty]
//     if (childCache === undefined) {
//         childCache = new WeakMap()
//         targetObjectCache.children[targetObjectProperty] = childCache
//     }
//     let r = childCache.get(scope)
//     if (r === undefined) {
//         r = factory()
//         childCache.set(scope, r)
//     }
//     return r
// }

// export function resetCache<T>(
//     scope: Object,
//     targetObject: Object,
//     targetObjectProperty: string | number | undefined
// ): void {
//     if (targetObjectProperty === undefined) {
//         let targetObjectCache = targetObject[HiddenPropID] as Cache<T> | undefined;
//         if (targetObjectCache === undefined) {
//             return;
//         }
//         targetObjectCache.current.delete(scope)
//         return;
//     }

//     let nestedValue = targetObject[targetObjectProperty]
//     if (nestedValue === Object(nestedValue)) {
//         return resetCache(scope, nestedValue, undefined)
//     }

//     let targetObjectCache = targetObject[HiddenPropID] as Cache<T> | undefined;
//     if (targetObjectCache === undefined) {
//         return
//     }
//     let childCache = targetObjectCache.children[targetObjectProperty]
//     if (childCache === undefined) {
//         return
//     }
//     childCache.delete(scope)
//     return;
// }

export function getCache<T>(
    scope: Object,
    parent: Object,
    key: string | number,
    value: any,
    factory: (value: any) => T,
    reconstruct: (existing: T, value: any) => void,
): T {
    if (value === Object(value)) {
        let c = value[HiddenPropID] as Cache<T> | undefined;
        if (c === undefined) {
            c = new Cache()
            value[HiddenPropID] = c
        }
        let r = c.current.get(scope)
        if (r === undefined) {
            r = factory(value)
            c.current.set(scope, r)
        } else {
            reconstruct(r, value)
        }
        return r
    }
    
    let c = parent[HiddenPropID] as Cache<T> | undefined;
    if (c === undefined) {
        c = new Cache()
        parent[HiddenPropID] = c
    }
    let childCache = c.children[key]
    if (childCache === undefined) {
        childCache = new WeakMap()
        c.children[key] = childCache
    }
    let r = childCache.get(scope)
    if (r === undefined) {
        r = factory(value)
        childCache.set(scope, r)
    } else {
        reconstruct(r, value)
    }
    return r
}

export function resetCache<T>(
    parent: Object,
    key: string | number,
    value: any
): void {
    if (value === Object(value)) {
        let c = value[HiddenPropID] as Cache<T> | undefined;
        if (c === undefined) {
            return
        }
        c.current = new WeakMap()
    }
    
    let c = parent[HiddenPropID] as Cache<T> | undefined;
    if (c === undefined) {
        return;
    }
    let childCache = c.children[key]
    if (childCache === undefined) {
        return
    }
    c.children[key] = new WeakMap()
}
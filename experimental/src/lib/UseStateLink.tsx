import React from 'react';
import { ObjectStateMutation, createObjectStateMutation, SetPartialStateAction } from './UseStateObject';
import { ArrayStateMutation, createArrayStateMutation } from './UseStateArray';

export enum ValidationSeverity {
    WARNING = 1,
    ERROR = 2
}

export interface ArrayExtensions<U> {
    first(condition?: (e: U) => boolean): U | undefined;
    firstPartial(condition?: (e: U) => boolean): Partial<U>;
}

export type Path = ReadonlyArray<string | number>;

export interface ValidationErrorMessage {
    readonly message: string;
    readonly severity: ValidationSeverity;
}

export interface ValidationError extends ValidationErrorMessage {
    readonly path: Path;
}

// TODO add support for Map and Set
export type NestedInferredLink<S, P extends {}> =
    S extends ReadonlyArray<(infer U)> ? NestedArrayLink<U, P> :
    S extends null ? undefined :
    S extends object ? NestedObjectLink<S, P> :
    undefined;

export type NestedArrayLink<U, P extends {}> = ReadonlyArray<ValueLink<U, P>>;

export type NestedObjectLink<S extends object, P extends {}> = {
    readonly [K in keyof Required<S>]: ValueLink<S[K], P>;
};

// TODO add support for Map and Set
export type InferredStateMutation<S> =
    S extends ReadonlyArray<(infer U)> ? ArrayStateMutation<U> :
    S extends null ? undefined :
    S extends object ? ObjectStateMutation<S> :
    undefined;

export interface ReadonlyValueLink<S, P extends {}> {
    readonly path: Path;

    readonly value: S;

    readonly initialValue: S | undefined;
    readonly modified: boolean;
    readonly unmodified: boolean;

    readonly valid: boolean;
    readonly invalid: boolean;
    readonly errors: ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError>;
}

export interface ValueLink<S, P extends {} = {}> extends ReadonlyValueLink<S, P> {
    readonly nested: NestedInferredLink<S, P>;
    readonly inferred: InferredStateMutation<S>;

    set(newValue: React.SetStateAction<S>): void;

    with<E>(plugin: Plugin<S, E>): ValueLink<S, P & E>;
    exts: P;

}

export interface Plugin<S, E extends {}> {
    onInit: (value: S) => (keyof E)[],
    onSet?: (path: Path) => void,
    // tslint:disable-next-line: no-any
    ext: (value: S, valueAtPath: any, path: Path) => E
}

export interface StateLink<S, P extends {}> {
    with<E>(plugin: Plugin<S, E>): StateLink<S, P & E>;
}

export type ValidationResult =
    string | ValidationErrorMessage | ReadonlyArray<string | ValidationErrorMessage>;

export interface GlobalValueProcessingHooks<S, P extends {}> {
    readonly __validate?: (currentValue: S, link: ReadonlyValueLink<S, P>) => ValidationResult | undefined;
    readonly __compare?: (newValue: S, oldValue: S | undefined, link: ReadonlyValueLink<S, P>) => boolean | undefined;
}

export interface ValueProcessingHooks<S, P extends {}> {
    readonly __validate?: (currentValue: S, link: ReadonlyValueLink<S, P>) => ValidationResult | undefined;
    readonly __compare?: (newValue: S, oldValue: S | undefined, link: ReadonlyValueLink<S, P>) => boolean | undefined;
}

export type ObjectProcessingHook<S, P extends {}> = {
    readonly [K in keyof S]?: InferredProcessingHooks<S[K], P>;
} & ValueProcessingHooks<S, P>;

export type ArrayProcessingHooks<U, P extends {}> = {
    readonly [K in number | '*']?: InferredProcessingHooks<U, P>;
} & ValueProcessingHooks<ReadonlyArray<U>, P>;

export type InferredProcessingHooks<S, P extends {}> =
    S extends ReadonlyArray<(infer U)> ? ArrayProcessingHooks<U, P> :
    S extends (infer Y)[] ? ArrayProcessingHooks<Y, P> :
    S extends number | string | boolean | null | undefined | symbol ? ValueProcessingHooks<S, P> :
    ObjectProcessingHook<S, P>;

export interface Settings<S> {
    // default is false
    readonly cloneInitial?: boolean;
    // default is false
    readonly skipSettingEqual?: boolean;
    // tslint:disable-next-line:no-any
    // readonly globalHooks?: GlobalValueProcessingHooks<any>;
    // readonly targetHooks?: InferredProcessingHooks<S>;
}

function defaultEqualityOperator<S>(a: S, b: S | undefined) {
    if (typeof b === 'object') {
        // check reference equality first for speed
        if (a === b) {
            return true;
        }
        return JSON.stringify(a) === JSON.stringify(b);
    }
    return a === b;
}

// tslint:disable-next-line:no-any
const defaultProcessingHooks: ValueProcessingHooks<any, {}> = {};

function extractValue<S>(prevValue: S, newValue: S | ((prevValue: S) => S)): S {
    if (typeof newValue === 'function') {
        return (newValue as ((prevValue: S) => S))(prevValue);
    }
    return newValue;
}

class ValueLinkDisabledFeatureError extends Error {
    constructor(op: string, hint: string, path: Path) {
        super(`ValueLink is used incorrectly. Attempted '${op}' at '/${path.join('/')}'. ${hint}`)
    }
}

class ValueLinkInvalidUsageError extends Error {
    constructor(op: string, path: Path) {
        super(`ValueLink is used incorrectly. Attempted '${op}' at '/${path.join('/')}'`)
    }
}

class ExtensionInvalidUsageError extends Error {
    constructor(op: string, path: Path) {
        super(`Extension is used incorrectly. Attempted '${op}' at '/${path.join('/')}'`)
    }
}

class ExtensionInvalidRegistrationError extends Error {
    constructor(path: Path) {
        super(`Extension can not be registered on nested ValueLink. Attempted 'with' at '/${path.join('/')}'`)
    }
}

class ExtensionConflictError extends Error {
    constructor(ext: string) {
        super(`Extension '${ext}' is already registered'`)
    }
}

class ExtensionUnknownError extends Error {
    constructor(ext: string) {
        super(`ValueLink extension '${ext}' is unknown'`)
    }
}

interface SubscribableTarget {
    updateIfUsed(path: Path): boolean;
}

interface Subscribable {
    // tslint:disable-next-line: no-any
    subscribe(l: SubscribableTarget): void;
    // tslint:disable-next-line: no-any
    unsubscribe(l: SubscribableTarget): void;
}

class State implements Subscribable {
    // tslint:disable-next-line: no-any
    public subscribers: Set<SubscribableTarget> = new Set();

    private extensions: Record<string, Plugin<any, {}>> = {};

    private _edition = 0;

    // tslint:disable-next-line:no-any
    protected _initial: any;

    // eslint-disable-next-line no-useless-constructor
    constructor(
        // tslint:disable-next-line:no-any
        protected _current: any,
        // tslint:disable-next-line: no-any
        protected _settings: Settings<any>
    ) {
        if (_settings.cloneInitial) {
            this._initial = JSON.parse(JSON.stringify(_current)); // maybe better to use specialised library
        }
    }

    getCurrent(path: Path) {
        let result = this._current;
        path.forEach(p => {
            result = result[p];
        });
        return result;
    }

    registerPlugin<S, E extends {}>(plugin: Plugin<S, E>) {
        if (this._edition !== 0) {
            return;
        }
        const extensions = plugin.onInit(this._current);
        extensions.forEach(e => {
            if (e in this.extensions) {
                throw new ExtensionConflictError(e as string);
            }
            this.extensions[e as string] = plugin as unknown as Plugin<any, {}>;
        });
        if (plugin.onSet) {
            const onSet = plugin.onSet;
            this.subscribe({
                updateIfUsed: (p) => {
                    onSet(p);
                    return true;
                }
            })
        }
        return;
    }

    getExtensions(path: Path): {} {
        const getter = (target: Record<string, Plugin<any, {}>>, key: PropertyKey) => {
            if (typeof key === 'symbol') {
                return undefined;
            }
            const plugin = target[key];
            if (plugin === undefined) {
                throw new ExtensionUnknownError(key.toString());
            }
            const extension = plugin.ext(this._current, this.getCurrent(path), path)[key];
            if (extension === undefined) {
                throw new ExtensionUnknownError(key.toString());
            }
            return extension;
        }
        return new Proxy(this.extensions, {
            getPrototypeOf: (target) => {
                return Object.getPrototypeOf(target);
            },
            setPrototypeOf: (target, v) => {
                throw new ExtensionInvalidUsageError('setPrototypeOf', path)
            },
            isExtensible: (target) => {
                return false;
            },
            preventExtensions: (target) => {
                throw new ExtensionInvalidUsageError('preventExtensions', path)
            },
            getOwnPropertyDescriptor: (target, p) => {
                const origin = Object.getOwnPropertyDescriptor(target, p);
                return origin && {
                    configurable: true, // JSON.stringify() does not work for an object without it
                    enumerable: origin.enumerable,
                    get: () => getter(target, p),
                    set: undefined
                };
            },
            has: (target, p) => {
                if (typeof p === 'symbol') {
                    return false;
                }
                return p in target;
            },
            get: getter,
            set: (target, p, value, receiver) => {
                throw new ExtensionInvalidUsageError('set', path)
            },
            deleteProperty: (target, p) => {
                throw new ExtensionInvalidUsageError('deleteProperty', path)
            },
            defineProperty: (target, p, attributes) => {
                throw new ExtensionInvalidUsageError('defineProperty', path)
            },
            enumerate: (target) => {
                return Object.keys(target);
            },
            ownKeys: (target) => {
                return Object.keys(target);
            },
            apply: (target, thisArg, argArray?) => {
                throw new ExtensionInvalidUsageError('apply', path)
            },
            construct: (target, argArray, newTarget?) => {
                throw new ExtensionInvalidUsageError('construct', path)
            }
        });
    }

    getInitial(path: Path) {
        if (!this._settings.cloneInitial) {
            throw new ValueLinkDisabledFeatureError('initialValue',
                'Enable this feature in settings: useStateLink(..., { cloneInitial: true })',
                path)
        }
        let result = this._initial;
        path.forEach(p => {
            // in contrast to the current value,
            // allow the initial may not exist
            result = result && result[p];
        });
        return result;
    }

    get settings() {
        return this._settings;
    }

    // tslint:disable-next-line:no-any
    // targetHooks(path: Path): ValueProcessingHooks<any, {}> {
    //     let result = this._settings.targetHooks;
    //     for (const p of path) {
    //         if (!result) {
    //             return defaultProcessingHooks;
    //         }
    //         result = result[p] || (typeof p === 'number' && result['*']);
    //     }
    //     return result || defaultProcessingHooks;
    // }

    // tslint:disable-next-line: no-any
    subscribe(l: SubscribableTarget) {
        this.subscribers.add(l);
    }

    // tslint:disable-next-line: no-any
    unsubscribe(l: SubscribableTarget) {
        this.subscribers.delete(l);
    }

    // tslint:disable-next-line: no-any
    setCurrent(path: Path, value: any) {
        this._edition += 1;
        if (path.length === 0) {
            this._current = value;
        }
        let result = this._current;
        path.forEach((p, i) => {
            if (i === path.length - 1) {
                if (!(p in result)) {
                    // if an array of object is about to be extended by new property
                    // we consider it is the whole object is changed
                    // which is identified by upper path
                    path = path.slice(0, -1)
                }
                result[p] = value;
            } else {
                result = result[p];
            }
        });
        this.subscribers.forEach(s => s.updateIfUsed(path));
    }
}

class ValueLinkImpl<S, P extends {}> implements ValueLink<S, P>, Subscribable {
    private subscribers: Set<SubscribableTarget> | undefined;

    private nestedCache: NestedInferredLink<S, P> | undefined;
    private nestedLinksCache: Record<string | number, ValueLinkImpl<S[keyof S], P>> | undefined;

    private valueTracked: S | undefined;
    private valueUsed: boolean | undefined;

    private initialValueCache: S | undefined;

    // private modifiedCache!: boolean;
    // private modifiedCacheEdition = -1;

    // private errorsCache!: ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError>;
    // private errorsCacheEdition = -1;

    constructor(
        public readonly state: State,
        public readonly path: Path,
        // tslint:disable-next-line: no-any
        public onUpdate: () => void,
        public valueUntracked: S
    ) { }

    get value(): S {
        // console.log('value used', this.path);
        if (this.valueTracked === undefined) {
            if (Array.isArray(this.valueUntracked)) {
                this.valueTracked = this.valueArrayImpl();
            } else if (typeof this.valueUntracked === 'object' && this.valueUntracked !== null) {
                this.valueTracked = this.valueObjectImpl();
            } else {
                this.valueTracked = this.valueUntracked;
                if (this.valueTracked === undefined) {
                    this.valueUsed = true;
                }
            }
        }
        // return this.nestedCache as NestedInferredLink<S>;
        return this.valueTracked!;
    }

    get initialValue(): S | undefined {
        if (this.initialValueCache === undefined) {
            // it still may get undefined, in this case the cache does not make an effect
            this.initialValueCache = this.state.getInitial(this.path) as S | undefined;
        }
        return this.initialValueCache;
    }

    set(newValue: React.SetStateAction<S>): void {
        // inferred() function checks for the nullability of the current value:
        // If value is not null | undefined, it resolves to ArrayLink or ObjectLink
        // which can not take null | undefined as a value.
        // However, it is possible that a user of this ValueLink
        // may call set(null | undefined).
        // In this case this null will leak via setValue(prevValue => ...)
        // to mutation actions for array or object,
        // which breaks the guarantee of ArrayLink and ObjectLink to not link nullable value.
        // Currently this causes a crash within ObjectLink or ArrayLink mutation actions.
        // This behavior is left intentionally to make it equivivalent to the following:
        // Example (plain JS):
        //    let myvar: { a: string, b: string } = { a: '', b: '' }
        //    myvar = undefined;
        //    myvar.a = '' // <-- crash here
        //    myvar = { a: '', b: '' } // <-- OK
        // Example (using value links):
        //    let myvar = useStateLink({ a: '', b: '' } as { a: string, b: string } | undefined);
        //    let myvar_a = myvar.nested.a; // get value link to a property
        //    myvar.set(undefined);
        //    myvar_a.set('') // <-- crash here
        //    myvar.set({ a: '', b: '' }) // <-- OK
        // if (this.state.settings.skipSettingEqual &&
        //     this.areValuesEqual(extractedNewValue, this.state.getCurrent(this.path) as S)) {
        //     return;
        // }
        if (typeof newValue === 'function') {
            newValue = (newValue as ((prevValue: S) => S))(this.state.getCurrent(this.path));
        }
        this.state.setCurrent(this.path, newValue);
    }

    with<E>(plugin: Plugin<S, E>): ValueLink<S, P & E> {
        if (this.path.length !== 0) {
            throw new ExtensionInvalidRegistrationError(this.path)
        }
        this.state.registerPlugin(plugin);
        return this as unknown as ValueLink<S, P & E>;
    }

    get exts() {
        return this.state.getExtensions(this.path) as P;
    }

    subscribe(l: SubscribableTarget) {
        if (this.subscribers === undefined) {
            this.subscribers = new Set();
        }
        this.subscribers.add(l);
    }

    unsubscribe(l: SubscribableTarget) {
        this.subscribers!.delete(l);
    }

    updateIfUsed(path: Path): boolean {
        // console.log('updateIfUsed', this.path);
        const update = () => {
            const firstChildKey = path[this.path.length];
            if (firstChildKey === undefined) {
                if (this.valueTracked !== undefined || this.valueUsed === true) {
                    // console.log('updateIfUsed updated', this.path);
                    this.onUpdate();
                    return true;
                }
                // console.log('updateIfUsed not updated (firstChildKey Undefined)', this.path, this.valueTracked || this.valueUsed, this.valueTracked, this.valueUsed);
                return false;
            }
            const firstChildValue = this.nestedLinksCache && this.nestedLinksCache[firstChildKey];
            if (firstChildValue === undefined) {
                // console.log('updateIfUsed not updated (firstChildValue Undefined)', this.path);
                return false;
            }
            // console.log('updateIfUsed offload to children', this.path);
            const r = firstChildValue.updateIfUsed(path);
            // console.log('updateIfUsed offload to children updated', this.path, r);
            return r;
        }

        const updated = update();
        if (!updated && this.subscribers !== undefined) {
            // console.log('updateIfUsed not updated, loop subscribers', this.path, this.subscribers);
            this.subscribers.forEach(s => s.updateIfUsed(path))
        }
        // console.log('updateIfUsed returning', this.path, updated);
        return updated;
    }

    // private areValuesEqual(newValue: S, oldValue: S | undefined): boolean {
    //     const localCompare = this.hooks.__compare;
    //     if (localCompare) {
    //         const localCompareResult = localCompare(newValue, oldValue, this);
    //         if (localCompareResult !== undefined) {
    //             return localCompareResult;
    //         }
    //     }
    //     const globalCompare = this.state.globalHooks().__compare;
    //     if (globalCompare) {
    //         const globalCompareResult = globalCompare(newValue, oldValue, this);
    //         if (globalCompareResult !== undefined) {
    //             return globalCompareResult;
    //         }
    //     }
    //     return defaultEqualityOperator(newValue, oldValue);
    // }

    get modified(): boolean {
        throw 'Functionality disabled';
        // if (this.modifiedCacheEdition < this.state.edition) {
        //     this.modifiedCacheEdition = this.state.edition;
        //     this.modifiedCache = !this.areValuesEqual(this.value, this.initialValue);
        // }
        // return this.modifiedCache;
    }

    get unmodified(): boolean {
        return !this.modified;
    }

    get valid(): boolean {
        return this.errors.length === 0;
    }

    get invalid(): boolean {
        return !this.valid;
    }

    private validate(validator: ((val: S, link: ReadonlyValueLink<S, P>) => ValidationResult | undefined) | undefined):
        ValidationError[] | undefined {
        throw 'Functionality disabled';
        // if (validator) {
        //     const errors = validator(this.value, this);
        //     if (errors !== undefined) {
        //         if (Array.isArray(errors)) {
        //             return (errors as ReadonlyArray<string | ValidationErrorMessage>).map(m =>
        //                 typeof m === 'string' ? {
        //                     path: this.path,
        //                     message: m,
        //                     severity: ValidationSeverity.ERROR
        //                 } : {
        //                     path: this.path,
        //                     message: m.message,
        //                     severity: m.severity
        //                 }
        //             );
        //         } else if (typeof errors === 'string') {
        //             return [{
        //                 path: this.path,
        //                 message: errors,
        //                 severity: ValidationSeverity.ERROR
        //             }];
        //         } else {
        //             return [{
        //                 path: this.path,
        //                 message: (errors as ValidationErrorMessage).message,
        //                 severity: (errors as ValidationErrorMessage).severity
        //             }];
        //         }
        //     }
        // }
        // return undefined;
    }

    get errors(): ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError> {
        throw 'Functionality disabled';
        // if (this.errorsCacheEdition < this.state.edition) {
        //     this.errorsCacheEdition = this.state.edition;

        //     const localHooks = this.hooks;
        //     let result: ValidationError[] =
        //         this.validate(localHooks.__validate) ||
        //         this.validate(this.state.globalHooks().__validate) ||
        //         [];
        //     const nestedHooks = Object.keys(localHooks).filter(i => typeof localHooks[i] !== 'function');
        //     if (nestedHooks.length > 0 && this.nested) {
        //         const nestedInst = this.nested;
        //         if (Array.isArray(nestedInst)) {
        //             if (localHooks['*']) {
        //                 nestedInst.forEach((n, i) => {
        //                     result = result.concat(n.errors as ValidationError[]);
        //                 });
        //             }
        //             nestedHooks
        //                 // Validation rule exists,
        //                 // but the corresponding nested link may not be created,
        //                 // (because it may not be inferred automatically)
        //                 // because the original array value cas miss the corresponding index
        //                 // The design choice is to skip validation in this case.
        //                 // A client can define per array level validation rule,
        //                 // where existance of the index can be cheched.
        //                 .filter(k => typeof k === 'number' && nestedInst[k] !== undefined)
        //                 .forEach(k => {
        //                     result = result.concat(nestedInst[k].errors as ValidationError[]);
        //                 });
        //         } else if (nestedInst) {
        //             nestedHooks
        //                 // Validation rule exists,
        //                 // but the corresponding nested link may not be created,
        //                 // (because it may not be inferred automatically)
        //                 // because the original object value can miss the corresponding key
        //                 // The design choice is to skip validation in this case.
        //                 // A client can define per object level validation rule,
        //                 // where existance of the property can be cheched.
        //                 .filter(k => nestedInst[k] !== undefined)
        //                 .forEach(k => {
        //                     result = result.concat(nestedInst[k].errors as ValidationError[]);
        //                 });
        //         }
        //     }

        //     const first = (condition?: (e: ValidationError) => boolean) => {
        //         return result.find(e => condition ? condition(e) : true);
        //     };
        //     const firstPartial = (condition?: (e: ValidationError) => boolean) => {
        //         const r = first(condition);
        //         if (r === undefined) {
        //             return {};
        //         }
        //         return r;
        //     };
        //     Object.assign(result, {
        //         first: first,
        //         firstPartial: firstPartial
        //     });

        //     this.errorsCache = result as unknown as ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError>;
        // }
        // return this.errorsCache;
    }

    get inferred(): InferredStateMutation<S> {
        if (!this.valueTracked) {
            this.valueUsed = true;
        }
        if (Array.isArray(this.valueUntracked)) {
            return createArrayStateMutation((newValue) =>
            // tslint:disable-next-line: no-any
            this.set(newValue as any)) as unknown as InferredStateMutation<S>
        } else if (typeof this.valueUntracked === 'object' && this.valueUntracked !== null) {
            return createObjectStateMutation((newValue) =>
            // tslint:disable-next-line: no-any
            this.set(newValue as any)) as unknown as InferredStateMutation<S>;
        } else {
            return undefined as unknown as InferredStateMutation<S>;
        }
    }

    get nested(): NestedInferredLink<S, P> {
        if (!this.valueTracked) {
            this.valueUsed = true;
        }
        if (this.nestedCache === undefined) {
            if (Array.isArray(this.valueUntracked)) {
                this.nestedCache = this.nestedArrayImpl();
            } else if (typeof this.valueUntracked === 'object' && this.valueUntracked !== null) {
                this.nestedCache = this.nestedObjectImpl();
            } else {
                this.nestedCache = undefined;
            }
        }
        return this.nestedCache as NestedInferredLink<S, P>;
    }

    private nestedArrayImpl(): NestedInferredLink<S, P> {
        const proxyGetterCache = {};
        this.nestedLinksCache = proxyGetterCache;

        const getter = (target: object, key: PropertyKey) => {
            if (key === 'length') {
                return (target as []).length;
            }
            if (key in Array.prototype) {
                return Array.prototype[key];
            }
            const index = Number(key);
            if (!Number.isInteger(index)) {
                return undefined;
            }
            const cachehit = proxyGetterCache[index];
            if (cachehit) {
                return cachehit;
            }
            const r = new ValueLinkImpl(
                this.state,
                this.path.slice().concat(index),
                this.onUpdate,
                target[index]
            )
            proxyGetterCache[index] = r;
            return r;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter) as unknown as NestedInferredLink<S, P>;
    }

    private valueArrayImpl(): S {
        const getter = (target: object, key: PropertyKey) => {
            if (key === 'length') {
                return (target as []).length;
            }
            if (key in Array.prototype) {
                return Array.prototype[key];
            }
            const index = Number(key);
            if (!Number.isInteger(index)) {
                return undefined;
            }
            return (this.nested)![index].value;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter) as unknown as S;
    }

    private nestedObjectImpl(): NestedInferredLink<S, P> {
        const proxyGetterCache = {}
        this.nestedLinksCache = proxyGetterCache;

        const getter = (target: object, key: PropertyKey) => {
            if (typeof key === 'symbol') {
                return undefined;
            }
            const cachehit = proxyGetterCache[key];
            if (cachehit) {
                return cachehit;
            }
            const r = new ValueLinkImpl(
                this.state,
                this.path.slice().concat(key.toString()),
                this.onUpdate,
                target[key]
            );
            proxyGetterCache[key] = r;
            return r;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter) as unknown as NestedInferredLink<S, P>;
    }

    private valueObjectImpl(): S {
        const getter = (target: object, key: PropertyKey) => {
            // console.log('value getter', key);
            if (typeof key === 'symbol') {
                return undefined;
            }
            return (this.nested)![key].value;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter) as unknown as S;
    }

    // tslint:disable-next-line: no-any
    private proxyWrap(objectToWrap: object, getter: (target: object, key: PropertyKey) => any) {
        return new Proxy(objectToWrap, {
            getPrototypeOf: (target) => {
                return Object.getPrototypeOf(target);
            },
            setPrototypeOf: (target, v) => {
                throw new ValueLinkInvalidUsageError('setPrototypeOf', this.path)
            },
            isExtensible: (target) => {
                return false;
            },
            preventExtensions: (target) => {
                throw new ValueLinkInvalidUsageError('preventExtensions', this.path)
            },
            getOwnPropertyDescriptor: (target, p) => {
                const origin = Object.getOwnPropertyDescriptor(target, p);
                return origin && {
                    configurable: true, // JSON.stringify() does not work for an object without it
                    enumerable: origin.enumerable,
                    get: () => getter(target as object, p),
                    set: undefined
                };
            },
            has: (target, p) => {
                if (typeof p === 'symbol') {
                    return false;
                }
                return p in target;
            },
            get: getter,
            set: (target, p, value, receiver) => {
                throw new ValueLinkInvalidUsageError('set', this.path)
            },
            deleteProperty: (target, p) => {
                throw new ValueLinkInvalidUsageError('deleteProperty', this.path)
            },
            defineProperty: (target, p, attributes) => {
                throw new ValueLinkInvalidUsageError('defineProperty', this.path)
            },
            enumerate: (target) => {
                return Object.keys(target);
            },
            ownKeys: (target) => {
                return Object.keys(target);
            },
            apply: (target, thisArg, argArray?) => {
                throw new ValueLinkInvalidUsageError('apply', this.path)
            },
            construct: (target, argArray, newTarget?) => {
                throw new ValueLinkInvalidUsageError('construct', this.path)
            }
        });
    }
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

class StateLinkImpl<S, P extends {}> implements StateLink<S, P> {
    constructor(public state: State) { }

    with<E>(plugin: Plugin<S, E>): StateLink<S, P & E> {
        this.state.registerPlugin(plugin);
        return this as StateLink<S, P & E>;
    }
}

function createState<S>(
    initial: S | (() => S),
    settings?: Settings<S>): State {
    let initialValue: S = initial as S;
    if (typeof initial === 'function') {
        initialValue = (initial as (() => S))();
    }
    return new State(initialValue, settings || {});
}

function useSubscribedStateLink<S, P extends {}>(
    state: State,
    path: Path, update: () => void,
    subscribeTarget: Subscribable
) {
    const link = new ValueLinkImpl<S, P>(
        state,
        path,
        update,
        state.getCurrent(path)
    );
    useIsomorphicLayoutEffect(() => {
        subscribeTarget.subscribe(link);
        return () => subscribeTarget.unsubscribe(link);
    });
    return link;
}

function useGlobalStateLink<S, P>(stateLink: StateLinkImpl<S, P>): ValueLink<S, P> {
    const [_, setValue] = React.useState({});
    return useSubscribedStateLink(stateLink.state, [], () => setValue({}), stateLink.state);
}

function useLocalStateLink<S>(initialState: S | (() => S), settings?: Settings<S>): ValueLink<S, {}> {
    const [value, setValue] = React.useState(() => ({ state: createState(initialState, settings) }));
    return useSubscribedStateLink(value.state, [], () => setValue({ state: value.state }), value.state);
}

function useDerivedStateLink<S, P extends {}>(originLink: ValueLinkImpl<S, P>): ValueLink<S, P> {
    const [_, setValue] = React.useState({});
    return useSubscribedStateLink(originLink.state, originLink.path, () => setValue({}), originLink);
}

export function createStateLink<S>(initial: S | (() => S), settings?: Settings<S>): StateLink<S, {}> {
    return new StateLinkImpl(createState(initial, settings));
}

export function useStateLink<S, P extends {}>(
    initialState: S | (() => S) | ValueLink<S, P> | StateLink<S, P>
): ValueLink<S, P> {
    // tslint:disable-next-line: no-any
    if (initialState instanceof ValueLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useDerivedStateLink(initialState) as ValueLink<S, P>;
    }
    if (initialState instanceof StateLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGlobalStateLink(initialState) as ValueLink<S, P>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalStateLink(initialState as S | (() => S)) as ValueLink<S, P>;
}

export function createStateWatch<S, P extends {}>(
    state: StateLink<S, P>,
    onSet: (newstate: S) => void
): () => void {
    if (state instanceof StateLinkImpl) {
        const target: SubscribableTarget = {
            updateIfUsed: p => {
                onSet(state.state.getCurrent([]));
                return false;
            }
        };
        state.state.subscribe(target)
        return () => state.state.unsubscribe(target);
    }
    return () => ({});
}

/**
 * Forces rerender of a hooked component when result of `watcher`
 * is changed due to the change of the current value in `state`.
 * Change of the result is determined by the default tripple equality operator.
 * @param state state to watch for
 * @param watcher state-to-result redusing function
 */
export function useStateWatch<S, R, P extends {}>(
    state: ValueLink<S, P> | StateLink<S, P>,
    watcher: (newstate: S, prev: R | undefined) => R
) {
    const link = useStateLink(state) as ValueLinkImpl<S, P>;
    const originOnUpdate = link.onUpdate;
    const result = watcher(link.value, undefined);
    link.onUpdate = () => {
        const updatedResult = watcher(link.state.getCurrent(link.path), result);
        if (updatedResult !== result) {
            originOnUpdate();
        }
    }
    return result;
}

export default useStateLink;

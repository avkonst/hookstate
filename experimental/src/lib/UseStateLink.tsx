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
export type NestedInferredLink<S> =
    S extends ReadonlyArray<(infer U)> ? NestedArrayLink<U> :
    S extends null ? undefined :
    S extends object ? NestedObjectLink<S> :
    undefined;

export type NestedArrayLink<U> = ReadonlyArray<ValueLink<U>>;

export type NestedObjectLink<S extends object> = {
    readonly [K in keyof Required<S>]: ValueLink<S[K]>;
};

// TODO add support for Map and Set
export type InferredLink<S> =
    S extends ReadonlyArray<(infer U)> ? ArrayLink<U> :
    S extends null ? undefined :
    S extends object ? ObjectLink<S> :
    undefined;

export interface ReadonlyValueLink<S> {
    readonly path: Path;

    readonly initialValue: S | undefined;
    readonly value: S;

    readonly modified: boolean;
    readonly unmodified: boolean;

    readonly valid: boolean;
    readonly invalid: boolean;
    readonly errors: ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError>;
}

export interface ValueLink<S> extends ReadonlyValueLink<S> {
    readonly nested: NestedInferredLink<S>;
    readonly inferred: InferredLink<S>;

    set(newValue: React.SetStateAction<S>): void;
}

export interface ArrayLink<U> extends ValueLink<U[]>, ArrayStateMutation<U> {}

export interface ObjectLink<S extends object> extends ValueLink<S>, ObjectStateMutation<S> {}

export interface StateLink<S> {}

export type ValidationResult =
    string | ValidationErrorMessage | ReadonlyArray<string | ValidationErrorMessage>;

export interface GlobalValueProcessingHooks<S> {
    readonly __validate?: (currentValue: S, link: ReadonlyValueLink<S>) => ValidationResult | undefined;
    readonly __compare?: (newValue: S, oldValue: S | undefined, link: ReadonlyValueLink<S>) => boolean | undefined;
}

export interface ValueProcessingHooks<S> {
    readonly __validate?: (currentValue: S, link: ReadonlyValueLink<S>) => ValidationResult | undefined;
    readonly __preset?: (newValue: S, link: ReadonlyValueLink<S>) => S;
    readonly __compare?: (newValue: S, oldValue: S | undefined, link: ReadonlyValueLink<S>) => boolean | undefined;
}

export type ObjectProcessingHook<S> = {
    readonly [K in keyof S]?: InferredProcessingHooks<S[K]>;
} & ValueProcessingHooks<S>;

export type ArrayProcessingHooks<U> = {
    readonly [K in number | '*']?: InferredProcessingHooks<U>;
} & ValueProcessingHooks<ReadonlyArray<U>>;

export type InferredProcessingHooks<S> =
    S extends ReadonlyArray<(infer U)> ? ArrayProcessingHooks<U> :
    S extends (infer Y)[] ? ArrayProcessingHooks<Y> :
    S extends number | string | boolean | null | undefined | symbol ? ValueProcessingHooks<S> :
    ObjectProcessingHook<S>;

export interface Settings<S> {
    // default is false
    readonly cloneInitial?: boolean;
    // default is false
    readonly skipSettingEqual?: boolean;
    readonly onset?: (newValue: S, initialValue: S | undefined, path: Path) => void;
    // tslint:disable-next-line:no-any
    readonly globalHooks?: GlobalValueProcessingHooks<any>;
    readonly targetHooks?: InferredProcessingHooks<S>;
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
const defaultProcessingHooks: ValueProcessingHooks<any> = {};

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

interface Subscribable {
    // tslint:disable-next-line: no-any
    subscribe(l: ValueLinkImpl<any>): void;
    // tslint:disable-next-line: no-any
    unsubscribe(l: ValueLinkImpl<any>): void;
}

class State implements Subscribable {
    // tslint:disable-next-line: no-any
    public subscribers: Set<ValueLinkImpl<any>> = new Set();
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
    targetHooks(path: Path): ValueProcessingHooks<any> {
        let result = this._settings.targetHooks;
        for (const p of path) {
            if (!result) {
                return defaultProcessingHooks;
            }
            result = result[p] || (typeof p === 'number' && result['*']);
        }
        return result || defaultProcessingHooks;
    }

    // tslint:disable-next-line: no-any
    subscribe(l: ValueLinkImpl<any>) {
        this.subscribers.add(l);
    }

    // tslint:disable-next-line: no-any
    unsubscribe(l: ValueLinkImpl<any>) {
        this.subscribers.delete(l);
    }

    // tslint:disable-next-line: no-any
    setCurrent(path: Path, value: any) {
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
        const onset = this.settings.onset;
        if (onset) {
            onset(this._current, this._initial, path);
        }
        this.subscribers.forEach(s => s.updateIfUsed(path));
    }
}

class ValueLinkInvalidUsageError extends Error {
    constructor(op: string, path: Path) {
        super(`ValueLink is used incorrectly. Attempted '${op}' at '/${path.join('/')}'`)
    }
}

class ValueLinkImpl<S> implements ValueLink<S>, Subscribable {
    private subscribers: Set<ValueLinkImpl<S>> | undefined;

    private nestedCache: NestedInferredLink<S> | undefined;
    private nestedLinksCache: Record<string | number, ValueLinkImpl<S[keyof S]>> | undefined;

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
        public readonly onUpdate: () => void,
        public readonly valueUntracked: S
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
            newValue =  (newValue as ((prevValue: S) => S))(this.state.getCurrent(this.path));
        }
        const localPreset = this.state.targetHooks(this.path).__preset;
        if (localPreset) {
            newValue = localPreset(newValue, this);
        }
        this.state.setCurrent(this.path, newValue);
    }

    subscribe(l: ValueLinkImpl<S>) {
        if (this.subscribers === undefined) {
            this.subscribers = new Set();
        }
        this.subscribers.add(l);
    }

    unsubscribe(l: ValueLinkImpl<S>) {
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

    private validate(validator: ((val: S, link: ReadonlyValueLink<S>) => ValidationResult | undefined) | undefined):
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

    get inferred(): InferredLink<S> {
        if (!this.valueTracked) {
            this.valueUsed = true;
        }
        if (Array.isArray(this.valueUntracked)) {
            return new ArrayLinkImpl(
                this as unknown as ValueLinkImpl<unknown[]>) as unknown as InferredLink<S>;
        } else if (typeof this.valueUntracked === 'object' && this.valueUntracked !== null) {
            return new ObjectLinkImpl(
                this as unknown as ValueLinkImpl<object>) as unknown as InferredLink<S>;
        } else {
            return undefined as unknown as InferredLink<S>;
        }
    }

    get nested(): NestedInferredLink<S> {
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
        return this.nestedCache as NestedInferredLink<S>;
    }

    private nestedArrayImpl(): NestedInferredLink<S> {
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
        return this.proxyWrap(this.valueUntracked as unknown as object, getter) as unknown as NestedInferredLink<S>;
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

    private nestedObjectImpl(): NestedInferredLink<S> {
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
        return this.proxyWrap(this.valueUntracked as unknown as object, getter) as unknown as NestedInferredLink<S>;
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

class ArrayOrObjectLinkBase<S> implements ValueLink<S> {
    constructor(readonly origin: ValueLink<S>) {
        if (origin instanceof ArrayOrObjectLinkBase) {
            origin = origin.origin as ValueLink<S>;
        }
    }

    get path(): Path {
        return this.origin.path;
    }
    get initialValue(): S | undefined {
        return this.origin.initialValue;
    }
    get value(): S {
        return this.origin.value;
    }
    get nested(): NestedInferredLink<S> {
        return this.origin.nested;
    }
    get modified(): boolean {
        return this.origin.modified;
    }
    get unmodified(): boolean {
        return this.origin.unmodified;
    }
    get valid(): boolean {
        return this.origin.valid;
    }
    get invalid(): boolean {
        return this.origin.invalid;
    }
    get errors(): ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError> {
        return this.origin.errors;
    }
    get inferred(): InferredLink<S> {
        return this as unknown as InferredLink<S>;
    }
    set(newValue: React.SetStateAction<S>): void {
        this.origin.set(newValue);
    }
}

class ArrayLinkImpl<U> extends ArrayOrObjectLinkBase<U[]> implements ArrayLink<U> {
    private arrayMutation: ArrayStateMutation<U>;

    constructor(private originImpl: ValueLinkImpl<U[]>) {
        super(originImpl);
        this.arrayMutation = createArrayStateMutation((newValue) => originImpl.set(newValue));
    }

    set(newValue: React.SetStateAction<U[]>): void {
        this.arrayMutation.set(newValue);
    }

    merge(other: React.SetStateAction<{ [index: number]: U; }>): void {
        this.arrayMutation.merge(other);
    }

    update(key: number, value: React.SetStateAction<U>): void {
        this.arrayMutation.update(key, value);
    }

    concat(other: React.SetStateAction<U[]>): void {
        this.arrayMutation.concat(other);
    }

    push(elem: U): void {
        this.arrayMutation.push(elem);
    }

    pop(): void {
        this.arrayMutation.pop();
    }

    insert(index: number, elem: U): void {
        this.arrayMutation.insert(index, elem);
    }

    remove(index: number): void {
        this.arrayMutation.remove(index);
    }

    swap(index1: number, index2: number): void {
        this.arrayMutation.swap(index1, index2);
    }
}

class ObjectLinkImpl<S extends object> extends ArrayOrObjectLinkBase<S> implements ObjectLink<S> {
    private objectMutation: ObjectStateMutation<S>;

    constructor(private originImpl: ValueLinkImpl<S>) {
        super(originImpl);
        this.objectMutation = createObjectStateMutation((newValue) => originImpl.set(newValue));
    }

    set(newValue: React.SetStateAction<S>): void {
        this.objectMutation.set(newValue);
    }

    merge(newValue: SetPartialStateAction<S>) {
        this.objectMutation.merge(newValue);
    }

    update<K extends keyof S>(key: K, value: React.SetStateAction<S[K]>): void {
        this.objectMutation.update(key, value);
    }
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

class StateLinkImpl<S> implements StateLink<S> {
    constructor(public state: State) { }
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

function useSubscribedStateLink<S>(state: State, path: Path, update: () => void, subscribeTarget: Subscribable) {
    const link = new ValueLinkImpl<S>(
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

function useGlobalStateLink<S>(stateLink: StateLinkImpl<S>): ValueLink<S> {
    const [_, setValue] = React.useState({});
    return useSubscribedStateLink(stateLink.state, [], () => setValue({}), stateLink.state);
}

function useLocalStateLink<S>(initialState: S | (() => S), settings?: Settings<S>): ValueLink<S> {
    const [value, setValue] = React.useState(() => ({ state: createState(initialState, settings) }));
    return useSubscribedStateLink(value.state, [], () => setValue({ state: value.state }), value.state);
}

function useDerivedStateLink<S>(originLink: ValueLinkImpl<S>): ValueLink<S> {
    const [_, setValue] = React.useState({});
    return useSubscribedStateLink(originLink.state, originLink.path, () => setValue({}), originLink);
}

export function createStateLink<S>(initial: S | (() => S), settings?: Settings<S>): StateLink<S> {
    return new StateLinkImpl(createState(initial, settings));
}

export function useStateLink<S>(
    initialState: S | (() => S) | ValueLink<S> | StateLink<S>,
    settings?: Settings<S>
): ValueLink<S> {
    if (initialState instanceof ValueLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useDerivedStateLink(initialState) as ValueLink<S>;
    }
    if (initialState instanceof ArrayOrObjectLinkBase &&
        initialState.origin instanceof ValueLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useDerivedStateLink(initialState.origin) as ValueLink<S>;
    }
    if (initialState instanceof StateLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGlobalStateLink(initialState) as ValueLink<S>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalStateLink(initialState as S | (() => S), settings);
}

export default useStateLink;

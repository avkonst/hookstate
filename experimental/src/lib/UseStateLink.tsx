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

export interface StateLink<S> {
    Observer: (props: React.PropsWithChildren<{}>) => JSX.Element;
}

export type ValidationResult =
    string | ValidationErrorMessage | ReadonlyArray<string | ValidationErrorMessage>;

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
    readonly skipSettingEqual?: boolean;

    // tslint:disable-next-line:no-any
    readonly globalHooks?: ValueProcessingHooks<any>;
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

interface ResolvedSettings {
    readonly skipSettingEqual: boolean;
    // tslint:disable-next-line:no-any
    readonly globalHooks: ValueProcessingHooks<any>;
    // tslint:disable-next-line:no-any
    readonly targetHooks: ValueProcessingHooks<any>;
}

function resolveSettings<S>(settings?: Settings<S>): ResolvedSettings {
    return {
        skipSettingEqual: (settings && settings.skipSettingEqual) || false,
        globalHooks: (settings && settings.globalHooks) || defaultProcessingHooks,
        targetHooks: (settings && settings.targetHooks) || defaultProcessingHooks
    };
}

function extractValue<S>(prevValue: S, newValue: S | ((prevValue: S) => S)): S {
    if (typeof newValue === 'function') {
        return (newValue as ((prevValue: S) => S))(prevValue);
    }
    return newValue;
}

class ReadonlyState {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        // tslint:disable-next-line:no-any
        protected _initial: any,
        // tslint:disable-next-line:no-any
        protected _current: any,
        protected _edition: number,
        protected _settings: ResolvedSettings
    ) { }

    getCurrent(path: Path) {
        let result = this._current;
        path.forEach(p => {
            result = result[p];
        });
        return result;
    }

    getInitial(path: Path) {
        let result = this._initial;
        path.forEach(p => {
            // in contrast to the current value,
            // allow the initial may not exist
            result = result && result[p];
        });
        return result;
    }

    get edition() {
        return this._edition;
    }

    get settings() {
        return this._settings;
    }

    globalHooks() {
        return this._settings.globalHooks;
    }

    // tslint:disable-next-line:no-any
    targetHooks(path: Path): ValueProcessingHooks<any> {
        let result = this._settings.targetHooks;
        path.forEach(p => {
            result = result && (result[p] || (typeof p === 'number' && result['*']));
        });
        return result || defaultProcessingHooks;
    }
}

class State extends ReadonlyState {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        // tslint:disable-next-line:no-any
        _initial: any,
        // tslint:disable-next-line:no-any
        _current: any,
        _edition: number,
        _settings: ResolvedSettings
    ) {
        super(_initial, _current, _edition, _settings);
    }

    // tslint:disable-next-line:no-any
    setCurrent(value: any): State {
        this._edition += 1;
        this._current = value;
        return this;
    }

    // tslint:disable-next-line:no-any
    setInitial(value: any): State {
        // update edition on every mutation
        // so consumers can invalidate their caches
        this._edition += 1;
        this._initial = value;
        return this;
    }
}

class ValueLinkImpl<S> implements ValueLink<S> {
    private inferredCache: InferredLink<S> | undefined = undefined;
    private inferredCacheEdition = -1;

    private nestedCache: NestedInferredLink<S> | undefined = undefined;
    private nestedCacheEdition = -1;
    private nestedLinksCache: Record<string | number, ValueLink<S[keyof S]>> = {};

    private valueCache: S | undefined;
    private valueCacheEdition = -1;

    private initialValueCache: S | undefined;
    private initialValueCacheEdition = -1;

    private hooksCache!: ValueProcessingHooks<S>;
    private hooksCacheEdition = -1;

    private modifiedCache!: boolean;
    private modifiedCacheEdition = -1;

    private errorsCache!: ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError>;
    private errorsCacheEdition = -1;

    // eslint-disable-next-line no-useless-constructor
    constructor(
        public readonly state: ReadonlyState,
        public readonly path: Path,
        public onSet: (newValue: S) => void
    ) { }

    get value(): S {
        if (this.valueCacheEdition < this.state.edition) {
            this.valueCacheEdition = this.state.edition;
            this.valueCache = this.state.getCurrent(this.path) as S;
        }
        return this.valueCache!;
    }

    get initialValue(): S | undefined {
        if (this.initialValueCacheEdition < this.state.edition) {
            this.initialValueCacheEdition = this.state.edition;
            this.initialValueCache = this.state.getInitial(this.path) as S | undefined;
        }
        return this.initialValueCache;
    }

    get hooks() {
        if (this.hooksCacheEdition < this.state.edition) {
            this.hooksCacheEdition = this.state.edition;
            this.hooksCache = this.state.targetHooks(this.path);
        }
        return this.hooksCache;
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
        let extractedNewValue = extractValue(this.value, newValue);
        const localPreset = this.hooks.__preset;
        if (localPreset) {
            extractedNewValue = localPreset(extractedNewValue, this);
        }
        const globalPreset = this.state.globalHooks().__preset;
        if (globalPreset) {
            extractedNewValue = globalPreset(extractedNewValue, this);
        }
        if (this.state.settings.skipSettingEqual &&
            this.areValuesEqual(extractedNewValue, this.value)) {
            return;
        }
        this.onSet(extractedNewValue);
    }

    private areValuesEqual(newValue: S, oldValue: S | undefined): boolean {
        const localCompare = this.hooks.__compare;
        if (localCompare) {
            const localCompareResult = localCompare(newValue, oldValue, this);
            if (localCompareResult !== undefined) {
                return localCompareResult;
            }
        }
        const globalCompare = this.state.globalHooks().__compare;
        if (globalCompare) {
            const globalCompareResult = globalCompare(newValue, oldValue, this);
            if (globalCompareResult !== undefined) {
                return globalCompareResult;
            }
        }
        return defaultEqualityOperator(newValue, oldValue);
    }

    get modified(): boolean {
        if (this.modifiedCacheEdition < this.state.edition) {
            this.modifiedCacheEdition = this.state.edition;
            this.modifiedCache = !this.areValuesEqual(this.value, this.initialValue);
        }
        return this.modifiedCache;
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
        if (validator) {
            const errors = validator(this.value, this);
            if (errors !== undefined) {
                if (Array.isArray(errors)) {
                    return (errors as ReadonlyArray<string | ValidationErrorMessage>).map(m =>
                        typeof m === 'string' ? {
                            path: this.path,
                            message: m,
                            severity: ValidationSeverity.ERROR
                        } : {
                            path: this.path,
                            message: m.message,
                            severity: m.severity
                        }
                    );
                } else if (typeof errors === 'string') {
                    return [{
                        path: this.path,
                        message: errors,
                        severity: ValidationSeverity.ERROR
                    }];
                } else {
                    return [{
                        path: this.path,
                        message: (errors as ValidationErrorMessage).message,
                        severity: (errors as ValidationErrorMessage).severity
                    }];
                }
            }
        }
        return undefined;
    }

    get errors(): ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError> {
        if (this.errorsCacheEdition < this.state.edition) {
            this.errorsCacheEdition = this.state.edition;

            const localHooks = this.hooks;
            let result: ValidationError[] =
                this.validate(localHooks.__validate) ||
                this.validate(this.state.globalHooks().__validate) ||
                [];
            const nestedHooks = Object.keys(localHooks).filter(i => typeof localHooks[i] !== 'function');
            if (nestedHooks.length > 0 && this.nested) {
                const nestedInst = this.nested;
                if (Array.isArray(nestedInst)) {
                    if (localHooks['*']) {
                        nestedInst.forEach((n, i) => {
                            result = result.concat(n.errors as ValidationError[]);
                        });
                    }
                    nestedHooks
                        // Validation rule exists,
                        // but the corresponding nested link may not be created,
                        // (because it may not be inferred automatically)
                        // because the original array value cas miss the corresponding index
                        // The design choice is to skip validation in this case.
                        // A client can define per array level validation rule,
                        // where existance of the index can be cheched.
                        .filter(k => typeof k === 'number' && nestedInst[k] !== undefined)
                        .forEach(k => {
                            result = result.concat(nestedInst[k].errors as ValidationError[]);
                        });
                } else if (nestedInst) {
                    nestedHooks
                        // Validation rule exists,
                        // but the corresponding nested link may not be created,
                        // (because it may not be inferred automatically)
                        // because the original object value can miss the corresponding key
                        // The design choice is to skip validation in this case.
                        // A client can define per object level validation rule,
                        // where existance of the property can be cheched.
                        .filter(k => nestedInst[k] !== undefined)
                        .forEach(k => {
                            result = result.concat(nestedInst[k].errors as ValidationError[]);
                        });
                }
            }

            const first = (condition?: (e: ValidationError) => boolean) => {
                return result.find(e => condition ? condition(e) : true);
            };
            const firstPartial = (condition?: (e: ValidationError) => boolean) => {
                const r = first(condition);
                if (r === undefined) {
                    return {};
                }
                return r;
            };
            Object.assign(result, {
                first: first,
                firstPartial: firstPartial
            });

            this.errorsCache = result as unknown as ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError>;
        }
        return this.errorsCache;
    }

    get inferred(): InferredLink<S> {
        if (this.inferredCacheEdition < this.state.edition) {
            this.inferredCacheEdition = this.state.edition;
            if (Array.isArray(this.value)) {
                this.inferredCache = new ArrayLinkImpl(
                    this as unknown as ValueLinkImpl<unknown[]>) as unknown as InferredLink<S>;
            } else if (typeof this.value === 'object' && this.value !== null) {
                this.inferredCache = new ObjectLinkImpl(
                    this as unknown as ValueLinkImpl<object>) as unknown as InferredLink<S>;
            } else {
                this.inferredCache = undefined as unknown as InferredLink<S>;
            }
        }
        return this.inferredCache as InferredLink<S>;
    }

    get nested(): NestedInferredLink<S> {
        if (this.nestedCacheEdition < this.state.edition) {
            this.nestedCacheEdition = this.state.edition;
            if (Array.isArray(this.value)) {
                this.nestedCache = this.nestedArrayImpl;
            } else if (typeof this.value === 'object' && this.value !== null) {
                this.nestedCache = this.nestedObjectImpl;
            } else {
                this.nestedCache = undefined;
            }
        }
        return this.nestedCache as NestedInferredLink<S>;
    }

    get nestedArrayImpl(): NestedInferredLink<S> {
        const proxyGetterCache = {};
        this.nestedLinksCache = proxyGetterCache;

        const getter = (target: any[], key: PropertyKey) => {
            if (key === 'length') {
                return target.length;
            }
            if (key in Array.prototype) {
                return Array.prototype[key];
            }
            // in contrast to object link,
            // do not allow to return value links
            // pointing to out of array bounds
            const cachehit = proxyGetterCache[key];
            if (cachehit) {
                return cachehit;
            }
            if (key in target) {
                const r = this.atArrayImpl(Number(key))
                proxyGetterCache[key] = r;
                return r;
            }
            return undefined;
        };
        const proxy = new Proxy(this.value as unknown as object, {
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
                    configurable: false,
                    enumerable: origin.enumerable,
                    value: undefined,
                    writable: false,
                    get: () => getter(target as any[], p),
                    set: undefined
                };
            },
            has: (target, p) => {
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
        })
        return proxy as unknown as NestedInferredLink<S>;
    }

    private atArrayImpl(k: number) {
        return new ValueLinkImpl(
            this.state,
            this.path.slice().concat(k),
            (newValue) => this.set((prevValue) => {
                const copy = (prevValue as unknown as unknown[]).slice();
                copy[k] = newValue;
                return copy as unknown as S;
            })
        );
    }

    get nestedObjectImpl(): NestedInferredLink<S> {
        const proxyGetterCache = {}
        this.nestedLinksCache = proxyGetterCache;

        const getter = (target: object, key: PropertyKey) => {
            if (typeof key === 'symbol') {
                return undefined;
            }
            // in cotrast to array link,
            // return for any key
            const cachehit = proxyGetterCache[key];
            if (cachehit) {
                return cachehit;
            }
            const r = this.atObjectImpl(key as keyof S);
            proxyGetterCache[key] = r;
            return r;
        };
        const proxy = new Proxy(this.value as unknown as object, {
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
                    configurable: false,
                    enumerable: origin.enumerable,
                    value: undefined,
                    writable: false,
                    get: () => getter(target as object, p),
                    set: undefined
                };
            },
            has: (target, p) => {
                if (typeof p === 'symbol') {
                    return false;
                }
                return true;
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
                // because object value link returns nested value link for any property key
                // it is impossible to know all of the available keys in advance
                throw new ValueLinkInvalidUsageError('enumerate', this.path)
            },
            ownKeys: (target) => {
                // because object value link returns nested value link for any property key
                // it is impossible to know all of the available keys in advance
                throw new ValueLinkInvalidUsageError('ownKeys', this.path)
            },
            apply: (target, thisArg, argArray?) => {
                throw new ValueLinkInvalidUsageError('apply', this.path)
            },
            construct: (target, argArray, newTarget?) => {
                throw new ValueLinkInvalidUsageError('construct', this.path)
            }
        })
        return proxy as unknown as NestedInferredLink<S>;
    }

    private atObjectImpl<K extends keyof S>(k: K): ValueLink<S[K]> {
        return new ValueLinkImpl(
            this.state,
            this.path.slice().concat(k.toString()),
            (newValue: S[K]) => this.set((prevValue: S) => {
                const copy: S = { ...prevValue };
                copy[k] = newValue;
                return copy;
            })
        );
    }
}

class ProxyLink<S> implements ValueLink<S> {
    constructor(readonly origin: ValueLink<S>) {
        if (origin instanceof ProxyLink) {
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

class ValueLinkInvalidUsageError extends Error {
    constructor(op: string, path: Path) {
        super(`ValueLink is used incorrectly. Attempted '${op}' at '/${path.join('/')}'`)
    }
}

class ArrayLinkImpl<U> extends ProxyLink<U[]> implements ArrayLink<U> {
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

class ObjectLinkImpl<S extends object> extends ProxyLink<S> implements ObjectLink<S> {
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

class StateLinkImpl<S> implements StateLink<S> {
    public state: State;
    public link: ValueLink<S>;
    public context: React.Context<{ state: State }> | undefined = undefined;
    public subscribers: React.Dispatch<React.SetStateAction<{ state: State }>>[] = [];

    constructor(
        initial: S | (() => S),
        public settings: ResolvedSettings
    ) {
        let initialValue: S = initial as S;
        if (typeof initial === 'function') {
            initialValue = (initial as (() => S))();
        }
        this.state = new State(initialValue, initialValue, 0, settings);
        this.link = new ValueLinkImpl<S>(
            this.state,
            [],
            (newValue) => {
                this.state.setCurrent(newValue);
                const newRef = {
                    state: this.state
                };
                this.subscribers.forEach(s => s(newRef));
            }
        );
    }

    // tslint:disable-next-line:function-name
    Observer = (props: React.PropsWithChildren<{}>) => {
        const [value, setState] = React.useState({
            state: this.state
        });
        React.useEffect(() => {
            this.subscribers.push(setState);
            return () => {
                this.subscribers = this.subscribers.filter(s => s !== setState);
            };
        }, [setState]);

        if (this.context === undefined) {
            this.context = React.createContext(value);
        }
        // submit new value every time to trigger rerender for children
        return <this.context.Provider {...props} value={value} />;
    }
}

export function createStateLink<S>(
    initial: S | (() => S),
    settings?: Settings<S>): StateLink<S> {
    return new StateLinkImpl(
        initial,
        resolveSettings(settings));
}

function useProxyStateLink<S>(originLink: ValueLinkImpl<S>): ValueLink<S> {
    const [value, setValue] = React.useState({
        state: new State(
            originLink.initialValue,
            originLink.value,
            0,
            {
                ...originLink.state.settings,
                targetHooks: originLink.hooks
            }
        ),
        originInitEdition: originLink.state.edition,
    });
    const isLocalStateStale = originLink.state.edition > value.originInitEdition;
    if (isLocalStateStale) {
        value.state = new State(
            originLink.initialValue,
            originLink.value,
            0,
            {
                ...originLink.state.settings,
                targetHooks: originLink.hooks
            }
        );
    }
    const result = new ValueLinkImpl<S>(
        value.state,
        [],
        (newValue) => setValue({
            state: value.state.setCurrent(newValue),
            originInitEdition: originLink.state.edition
        }));

    React.useEffect(() => {
        // set when the errors change, not just when validity status changes
        if (!defaultEqualityOperator(result.errors, originLink.errors) ||
            originLink.modified !== result.modified) {
            originLink.set(result.value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(result.errors),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(originLink.errors),
        originLink.modified,
        result.modified
    ]);
    return result;
}

function useContextStateLink<S>(stateLink: StateLinkImpl<S>): ValueLink<S> {
    if (stateLink.context === undefined) {
        // this allows to edit the global state
        // whitout active observers
        return stateLink.link;
    }
    // It is expected to be called within the provider scope,
    // after the context has been initialized
    // If not, the useContext will crash on undefined context.
    // Note: useContext is need to trigger rerendering the component
    // when state link changes its value.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useContext(stateLink.context);
    return stateLink.link;
}

function useLocalStateLink<S>(initialState: S | (() => S), settings?: Settings<S>): ValueLink<S> {
    const [value, setValue] = React.useState(() => {
        let initialValue: S = initialState as S;
        if (typeof initialState === 'function') {
            initialValue = (initialState as (() => S))();
        }
        return {
            state: new State(initialValue, initialValue, 0, resolveSettings(settings))
        };
    });
    return new ValueLinkImpl<S>(
        value.state,
        [],
        (newValue) => {
            setValue({
                state: value.state.setCurrent(newValue)
            });
        });
}

export function useStateLink<S>(
    initialState: S | (() => S) | ValueLink<S> | StateLink<S>,
    settings?: Settings<S>
): ValueLink<S> {
    if (initialState instanceof ValueLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useProxyStateLink(initialState) as ValueLink<S>;
    }
    if (initialState instanceof ProxyLink &&
        initialState.origin instanceof ValueLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useProxyStateLink(initialState.origin) as ValueLink<S>;
    }
    if (initialState instanceof StateLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useContextStateLink(initialState) as ValueLink<S>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalStateLink(initialState as S | (() => S), settings);
}

export default useStateLink;

export interface StateRef<S> {
    // placed to make sure type inference does not match compatible structure
    // on useStateLink call
    __synteticTypeInferenceMarkerRef: symbol;
    with(plugin: () => Plugin): StateRef<S>;
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R>
    destroy(): void
}

// R captures the type of result of transform function
export interface StateInf<R> {
    // placed to make sure type inference does not match empty structure
    // on useStateLink call
    __synteticTypeInferenceMarkerInf: symbol;
    with(plugin: () => Plugin): StateInf<R>;
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): StateInf<R2>
    destroy(): void;
}

// TODO add support for Map and Set
export type NestedInferredLink<S> =
    S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U>> :
    S extends null ? undefined :
    S extends object ? { readonly [K in keyof Required<S>]: StateLink<S[K]>; } :
    undefined;

export type Path = ReadonlyArray<string | number>;

export type SetStateAction<S> = (S | Promise<S>) | ((prevState: S) => (S | Promise<S>));

export type SetPartialStateAction<S> =
    S extends ReadonlyArray<(infer U)> ?
        ReadonlyArray<U> | Record<number, U> | ((prevValue: S) => (ReadonlyArray<U> | Record<number, U>)) :
    S extends object | string ? Partial<S> | ((prevValue: S) => Partial<S>) :
    React.SetStateAction<S>;

export interface StateLink<S> {
    readonly path: Path;
    readonly nested: NestedInferredLink<S>;

    // keep value in addition to get() because typescript compiler
    // does not handle elimination of undefined with get(), like in this example:
    // const state = useStateLink<number | undefined>(0)
    // const myvalue: number = statelink.value ? statelink.value + 1 : 0; // <-- compiles
    // const myvalue: number = statelink.get() ? statelink.get() + 1 : 0; // <-- does not compile
    readonly value: S;

    /** @warning experimental feature */
    readonly promised: boolean;
    /** @warning experimental feature */
    readonly error: ErrorValueAtPath | undefined;

    get(): S;
    set(newValue: SetStateAction<S>): void;
    merge(newValue: SetPartialStateAction<S>): void;

    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance];
}

export interface StateLinkPlugable<S> {
    getUntracked(): S;
    setUntracked(newValue: SetStateAction<S>): Path;
    mergeUntracked(mergeValue: SetPartialStateAction<S>): Path | Path[];
    update(path: Path | Path[]): void;
}

// type alias to highlight the places where we are dealing with root state value
// tslint:disable-next-line: no-any
export type StateValueAtRoot = any;
// tslint:disable-next-line: no-any
export type StateValueAtPath = any;
// tslint:disable-next-line: no-any
export type ErrorValueAtPath = any;

export type InitialValueAtRoot<S> = S | Promise<S> | (() => S | Promise<S>)

/** @warning experimental feature */
export const None = Symbol('none') as StateValueAtPath;

export interface PluginInstance {
    // if returns defined value,
    // it overrides the current / initial value in the state
    // it is only applicable for plugins attached via stateref, not via statelink
    readonly onInit?: () => StateValueAtRoot | void,
    readonly onPreset?: (path: Path, prevState: StateValueAtRoot,
        newValue: StateValueAtPath, prevValue: StateValueAtPath,
        mergeValue: StateValueAtPath | undefined) => void | StateValueAtRoot,
    readonly onSet?: (path: Path, newState: StateValueAtRoot,
        newValue: StateValueAtPath, prevValue: StateValueAtPath,
        mergeValue: StateValueAtPath | undefined) => void,
    readonly onDestroy?: (state: StateValueAtRoot) => void,
};

export interface Plugin {
    readonly id: symbol;
    readonly instanceFactory: (
        initial: StateValueAtRoot, linkFactory: () => StateLink<StateValueAtRoot>
    ) => PluginInstance;
}

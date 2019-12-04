import { Path } from './Declarations';

export const RootPath: Path = [];

export const StateMemoID = Symbol('StateMemo');
export const SynteticID = Symbol('SynteticTypeInferenceMarker');
export const DowngradedID = Symbol('Downgraded');
export const UnmountedCallback = Symbol('UnmountedCallback');
export const ProxyMarkerID = Symbol('ProxyMarker');

export const NoAction = () => { /* empty */ };
export const NoActionUnmounted = () => { /* empty */ };
NoActionUnmounted[UnmountedCallback] = true

export interface Subscriber {
    onSet(path: Path, actions: (() => void)[]): void;
}

export interface Subscribable {
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
}

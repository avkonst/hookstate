import { Path } from './Declarations';
export declare const RootPath: Path;
export declare const StateMemoID: unique symbol;
export declare const SynteticID: unique symbol;
export declare const DowngradedID: unique symbol;
export declare const UnmountedCallback: unique symbol;
export declare const ProxyMarkerID: unique symbol;
export declare const NoAction: () => void;
export declare const NoActionUnmounted: () => void;
export interface Subscriber {
    onSet(path: Path, actions: (() => void)[]): void;
}
export interface Subscribable {
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
}

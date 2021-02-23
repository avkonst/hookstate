import { Plugin, StateValueAtRoot, State } from '@hookstate/core';
interface BroadcastedExtensions {
    topic(): string;
}
export declare function Broadcasted<S>(topic: string, onLeader?: (link: State<StateValueAtRoot>, wasFollower: boolean) => void): () => Plugin;
export declare function Broadcasted<S>(self: State<S>): BroadcastedExtensions;
export {};

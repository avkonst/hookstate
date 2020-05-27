export interface Settings {
    monitored: string[];
    callstacksDepth: number;
}
export declare function DevToolsInitialize(settings: Settings): void;

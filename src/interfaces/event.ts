// All client events need to adhere to this basic interface
export interface IEvent {
    execute: (...args: any) => void;
}

// Helpers used in main
export interface IEventConstructor {
    new (): IEvent;
}

export function createEvent(ctor: IEventConstructor): IEvent {
    return new ctor();
}

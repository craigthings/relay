export default class Relay<T = void> {
    private onChangeCallbacks: Array<(data: T extends void ? void : T) => void> = [];
    private promiseResolvers: Array<(data: T extends void ? void : T) => void> = [];

    public addListener(callback: (data: T extends void ? void : T) => void): () => void {
        this.onChangeCallbacks.push(callback);
        return () => this.removeListener(callback);
    }

    public removeListener(callback: (data: T extends void ? void : T) => void): void {
        this.onChangeCallbacks = this.onChangeCallbacks.filter(cb => cb !== callback);
    }

    public dispatch(data?: T extends void ? never : T): void {
        for (let callback of this.onChangeCallbacks) {
            callback(data as T extends void ? void : T);
        }
        while (this.promiseResolvers.length) {
            const resolver = this.promiseResolvers.pop();
            if (resolver) {
                resolver(data as T extends void ? void : T);
            }
        }
    }

    public dispose(): void {
        this.onChangeCallbacks = [];
        this.promiseResolvers = [];
    }

    public then(resolve: (value: T extends void ? void : T) => void, reject: (reason?: any) => void): void {
        const newPromise = new Promise<T extends void ? void : T>((res, rej) => {
            this.promiseResolvers.push(res);
        });
        newPromise.then(resolve, reject);
    }
}

type RelayFunction<T = void> = {
    (): Promise<T extends void ? void : T>;
    (callback: (data: T extends void ? void : T) => void): () => void;
}

export function createRelay<T = void>(): Relay<T> & RelayFunction<T> {
    const relay = new Relay<T>();

    const callableRelay = ((callback?: (data: T extends void ? void : T) => void) => {
        if (callback) {
            return relay.addListener(callback);
        } else {
            return new Promise<T extends void ? void : T>((resolve) => {
                const oneTimeListener = (data: T extends void ? void : T) => {
                    resolve(data);
                    relay.removeListener(oneTimeListener);
                };
                relay.addListener(oneTimeListener);
            });
        }
    }) as Relay<T> & RelayFunction<T>;

    Object.setPrototypeOf(callableRelay, relay);
    return callableRelay;
}
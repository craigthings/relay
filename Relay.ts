export default class Relay<T> {
    private onChangeCallbacks: Array<(data: T extends void | undefined | null ? T : Exclude<T, undefined>) => void> = [];
    private promiseResolvers: Array<(data: T extends void | undefined | null ? T : Exclude<T, undefined>) => void> = [];

    public addListener(callback: (data: T extends void | undefined | null ? T : Exclude<T, undefined>) => void): () => void {
        this.onChangeCallbacks.push(callback);
        return () => this.removeListener(callback);
    }

    public removeListener(callback: (data: T extends void | undefined | null ? T : Exclude<T, undefined>) => void): void {
        this.onChangeCallbacks = this.onChangeCallbacks.filter(cb => cb !== callback);
    }

    public dispatch(data: T extends void | undefined | null ? T : Exclude<T, undefined>): void {
        for (let callback of this.onChangeCallbacks) {
            callback(data);
        }
        while (this.promiseResolvers.length) {
            const resolver = this.promiseResolvers.pop();
            if (resolver) {
                resolver(data);
            }
        }
    }

    public dispose(): void {
        this.onChangeCallbacks = [];
        this.promiseResolvers = [];
    }

    public then(resolve: (value: T extends void | undefined | null ? T : Exclude<T, undefined>) => void, reject: (reason?: any) => void): void {
        const newPromise = new Promise<T extends void | undefined | null ? T : Exclude<T, undefined>>((res, rej) => {
            this.promiseResolvers.push(res);
        });
        newPromise.then(resolve, reject);
    }
}

type RelayFunction<T> = {
    (): Promise<T extends void | undefined | null ? T : Exclude<T, undefined>>;
    (callback: (data: T extends void | undefined | null ? T : Exclude<T, undefined>) => void): () => void;
}

export function createRelay<T = undefined>(): Relay<T> & RelayFunction<T> {
    const relay = new Relay<T>();

    const callableRelay = ((callback?: (data: T extends void | undefined | null ? T : Exclude<T, undefined>) => void) => {
        if (callback) {
            return relay.addListener(callback);
        } else {
            return new Promise<T extends void | undefined | null ? T : Exclude<T, undefined>>((resolve) => {
                const oneTimeListener = (data: T extends void | undefined | null ? T : Exclude<T, undefined>) => {
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
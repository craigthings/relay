# ⚠ In Development ⚠

# Relay

A Relay is an event dispatcher that requires less management of constants, and provides much better autocomplete without needing to define types over and over. This can help reduce extra work and human error. It also provides neat tricks like awaiting an event to fire, and can use callbacks instead of event listeners.

```typescript
const onReady = createRelay<{id: number, isReady: boolean}>();

// set an event callback
onReady((data) => { 
  // data. <-- type is inferred and autocompletes 'id' and 'isReady'.
  console.log('ready:', data.isReady);
});

// or await the relay to fire
let result = await onReady();
console.log('ready:', result.isReady);

onReady.dispatch({id: 1, isReady: true}); // type is checked if formed properly.
```

Typically relays would be provided as an object of relays.

```typescript
type Document = {
  id: string,
  content: string,
};

const on = {
  update: createRelay<Document>(),
  added: createRelay<string>(),
  removed: createRelay<string>(),
};
```

Then somewhere else in your app you're able to do something like:

```typescript
// documentCollection.on. <-- autocompletes with 'update', 'added', and 'removed'.
documentCollection.on.update((data) => console.log("Update event received with data:", data.id));
documentCollection.on.added((id) => console.log("Added event received with ID:", id));
documentCollection.on.removed((id) => console.log("Removed event received with ID:", id));

```
## Utility Function

### `createRelay<T>()`

Creates a callable relay instance.

#### Returns

A callable relay instance.

#### Example

```typescript
const relay = createRelay<number>();

const disposer = relay((data) => {
  console.log(data);
});

relay.dispatch(42); // logs: 42

disposer();
relay.dispatch(43); // No logs, listener was removed
```

## Methods

### `addListener(callback)`

Adds a listener that will be called each time the relay is dispatched.

#### Parameters

- `callback`: A function to be called when the relay is dispatched.

#### Example

```typescript
const relay = new Relay<number>();
const listener = (data) => {
  console.log(data);
};

relay.addListener(listener);
relay.dispatch(42); // logs: 42

relay.removeListener(listener);
relay.dispatch(43); // No logs, listener was removed
```

### `removeListener(callback)`

Removes a previously added listener.

#### Parameters

- `callback`: The function to remove from the listeners.

#### Example

```typescript
const relay = new Relay<number>();
const listener = (data) => {
  console.log(data);
};

relay.addListener(listener);
relay.dispatch(42); // logs: 42

relay.removeListener(listener);
relay.dispatch(43); // No logs, listener was removed
```

### `dispatch(data)`

Dispatches the relay to all registered listeners.

#### Parameters

- `data?`: Optional data to pass to the listeners.

#### Example

```typescript
const relay = new Relay<number>();
relay.addListener((data) => {
  console.log(data);
});

relay.dispatch(42); // logs: 42
```

### `dispose()`

Removes all listeners from the relay.

#### Example

```typescript
const relay = new Relay<number>();
relay.addListener((data) => {
  console.log(data);
});

relay.dispatch(42); // logs: 42
relay.dispose();

relay.dispatch(43); // No logs, all listeners were removed
```

### `then()`

Allows the handling of relays through promises.

#### Parameters

- `resolve`: A function to be called when the relay is dispatched.
- `reject`: A function to be called if there is an error.

#### Example

```typescript
const relay = new Relay<number>();

relay.then((value) => {
  console.log(value);
}, (reason) => {
  console.error(reason);
});

// Alternatively:
let value = await relay();
console.log(value);

relay.dispatch(42); // logs: 42
```
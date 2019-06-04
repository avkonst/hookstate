# React-use-state-x
Tiny, type-safe, feature-rich useState-like React hook to manage complex state (objects, arrays, nested data, forms) and global stores (alternative to Redux/Mobx)

- [Quick start](#quick-start) - tiny demos in very short code samples
- [Features](#features) - why react-use-state-x?

API guide table of contents:

- [Array state](#array-state) - `useState` for arrays
- [Object state](#object-state) - `useState` for objects
- [Complex state](#complex-state) - `useState` for complex data
    - [Form state](#form-state) - two-way data binding, valuelink pattern
    - [Input validation](#input-validation) - automated validation of complex data in easy way
    - [Modification detection](#modification-detection) - automated detection if the current state and initial state are different
    - [Preset hook](#preset-hook) - reject or alter state mutations
    - [Cached state](#cached-state) - optimise updates of deeply nested complex state data
- [Global state](#global-state) - `useState` for complex data stored globally
    - [Global state reducer](#global-state-reducer) - build your custom global type-safe stores and reduce actions, replace Redux or Mobx

## Quick start

[Array state](#array-state) - `useState` for arrays ([read more...](#array-state)):
```tsx
import { useStateArray } from 'react-use-state-x';

const UseStateArrayExample = () => {
    // there are other actions available in addition to push and remove
    const [array, { push, remove }] = useStateArray([1, 2]);
    return (
        <div>
            {array.map((elem, index) =>
                <span>
                    Element {elem} (<button onClick={() => remove(index)}>Remove</button>)
                </span>
            )}
            <button onClick={() => push(array.length)}>Add</button>
        </div>
    );
};
```

[Object state](#object-state) - `useState` for objects ([read more...](#object-state)):
```tsx
import { useStateObject } from 'react-use-state-x';

const UseStateObjectExample = () => {
    // there are other actions available in addition to merge and remove
    const [instance, { merge, update }] = useStateObject({ a: 1, b: 'two', c: false });
    return (
        <div>
            Current object state: {JSON.stringify(instance)}
            <button onClick={() => update('a', 2)}>Update A field</button>
            <button onClick={() => merge({ b: 'Three', c: true })}>Update B and C fields</button>
        </div>
    );
};
```

[Complex state](#complex-state) and [Form state](#form-state) - `useState` for complex data and two-way form data binding via valuelink pattern ([read more...](#complex-state)):

```tsx
import { useStateLink } from 'react-use-state-x';

const UseStateLinkExample = () => {
    const stateLink = useStateLink({
        title: 'Code Complete',
        popularity: 1
    }, {
        targetHooks: {
            popularity: {
                __validate: (v) => !Number.isFinite(v) ? 'Popularity should be a number' : undefined
            }
        }
    });

    const links = stateLink.nested; // obtain valuelinks to nested fields
    return (
        <div>
            <label>Title</label>
            <input value={links.title.value} onChange={e => links.title.set(e.target.value)} />
            <label>Popularity</label>
            <input value={links.popularity.value} onChange={e => links.popularity.set(Number(e.target.value))} />
            {stateLink.valid ? 'The input is valid' : stateLink.errors.join(',')}
        </div>
    );
};
```

[Global state](#global-state) and [Global state reducer](#global-state-reducer) - `useState` for complex data stored globally wrapped to strict type-safe reducer API (alternative to Redux/Mobx, [read more...](#global-state)):

```tsx
//
// file: Store.tsx - implementation of type-safe, strict API for global store
//
import { useStateLink, createStateLink } from 'react-use-state-link';

export interface Book {
    title: string;
    popularity: number;
}

const Store = createStateLink<Book[]>([{
    title: 'Code complete',
    popularity: 1,
}]);

export const StoreObserver = Store.Observer;

export function useStore() {
    const link = useStateLink(Store);
    return {
        addBook(book: Book) {
            link.inferred.push(book);
        },
        updateTitle(bookIndex: number, title: string) {
            link.nested[bookIndex].nested.title.set(title);
        },
        getBooks(): Book[] {
            return link.value;
        }
    };
}

//
// file: OtherComponent.tsx - demonstrates how to use the global store in a component
//
import { useStore } from './Store'
const UseGlobalStoreExample = () => {
    const store = useStore();
    return (
        <div>
            {store.getBooks().map((book, index) => 
                // show the title in the editable input box for each book
                <input key={index} value={book.title} onChange={e => store.updateTitle(index, e.target.value)} />
            )}
            <button onClick={() => store.addBook({ title: 'Code complete', popularity: 1 })} >
                Add another book
            </button>
        </div>
    );
};

//
// file: App.tsx - activates the usage of the global store for the entire app
//
import { StoreObserver } from './Store';
const App = () => {
    return (
        <StoreObserver>
            {
                // nested components, which use the Store will re-render
                // when the Store state is changed
            }
            <UseGlobalStoreExample />
        </StoreObserver>
    );
};
```

## Features

- Concise, pragmatic but flexible API
  - very easy to learn
  - no boilerplate, just plain predictable state management
- First-class typescript support
  - completely written in typescript
  - compiles to javascript module and typescript definitions
  - correct and complete type inferrence for any type / complexity of managed data
- Tiny footprint. No external dependencies, except React.
- State management for complex data state, including:
  - arrays and objects
  - deeply nested combinations on arrays and objects
  - validation of input data
  - tracking of modifications
  - valuelink-like pattern for two-way data binding and form state management
- Global data state management using the same API
  - allows to drop Mobx / Redux completely and simplify the source code a lot
- Performance tuned:
  - offers component-level cache state management to minimise re-rendering when necessary
  - efficient global state observer using only `React.useContext` and `React.useState`

## Contribution

Use github ticketing system to ask questions, report bugs or request features. Feel free to submit pull requests.

## Installation

Using NPM:
```
npm install --save react-use-state-x
```

Using yarn:
```
yarn add react-use-state-x
```

## API guide

### Array state

`useStateArray` returns the current state of an array instance and a set of functions to mutate the state of the array in various ways. The following example demonstrates the usage of `push` mutation action, which adds one more element in to the array.

```tsx
const UseStateArrayExample = () => {
    const [array, { push }] = useStateArray([1, 2]);
    return (
        <div>
            {array.join(',')}
            <button onClick={() => push(array.length)}>Add</button>
        </div>
    );
};
```

There the following array mutation actions available:

- `set([...])` or `set((prevState) => [...])` sets new value of the array state. It has got the same behaviour as the second value returned from the `React.useState` function
- `merge({...})` or `merge((prevState) => ({...}))` sets new value of the array state, updating the provided elements of the array, for example:
    ```ts
    merge({
        0: 'the first element is updated',
        4: 'and the fifth too',
    })
    ```
    Note: `prevState` variable in the callback is a clone/copy of the current array state
- `update(index, newElementValue)` or `update(index, (prevElementValue) => newElementValue)` sets new value of the array state, updating the element of an array by the specified index
- `concat([...])` or `concat((prevState) => [...])` sets new value of the array state, appending the provided array to the end of the current array.

    Note: `prevState` variable in the callback is a clone/copy of the current array state
- `push(newElement)` sets new value of the array state, adding new element to the end
- `pop()` sets new value of the array state, removing the last element
- `insert(indexWhereToInsert, newElement)` sets new value of the array state, inserting the new element by the specified index
- `remove(index)` sets new value of the array state, removing the element by the specified index
- `swap(index1, index2)` sets new value of the array state, swapping two elements by the specified indexes

### Object state

`useStateObject` returns the current state of an object instance and a set of functions to mutate the state of the object in various ways. The following example demonstrates the usage of `merge` mutation action, which updates the specified properties of the object.

```tsx
const UseStateObjectExample = () => {
    const [instance, { merge }] = useStateObject({ a: 1, b: 'two' });
    return (
        <div>
            {JSON.stringify(instance)}
            <button onClick={() => merge({ b: 'Three' })}>Modify instance</button>
        </div>
    );
};
```

There the following object mutation actions available:

- `set([...])` or `set((prevState) => [...])` sets new value of the object state. It has got the same behaviour as the second value returned from the `React.useState` function
- `merge({...})` or `merge((prevState) => ({...}))` sets new value of the object state, updating the specified properties
- `update(propertyKey, newPropertyValue)` or `update(propertyKey, (prevPropertyValue) => newPropertyValue)` sets new value of the object state, updating the specified property

### Complex state

When the state data contains a mix of nested objects, arrays and primitive variables of different types, [`useStateArray`](#array-state) or [`useStateObject`](#object-state) are not sufficient anymore. We need something what can provide set-state-like actions for nested data and something what is aware of the types of these nested objects and arrays.

`useStateLink` is used in this case. For example:
```ts
interface Book {
    title: string;
    popularity: number;
    authors: string[];
}
interface Catalog {
    books: Book[];
    lastUpdated: Date;
}
const UseStateLinkExample = () => {
    // type annotation is for documentation purposes,
    // it is inferred by the compiler automatically
    const link: ValueLink<Catalog> = useStateLink({
        books: [
            {
                title: 'Code Complete',
                popularity: 1,
                authors: ['Steve McConnell']
            }
        ],
        lastUpdated: new Date()
    } as Catalog);
    ...
};
```

The `link` variable is of type `ValueLink<Catalog>`, which has got two fundamental properties:

- `value` - returns the instance of data, of `Catalog` type in this example
- and `set(...)` or `set((prevState) => ...)` - function which allows to set new value state, of `Catalog` type in this example, similarly to the setState variable returned by `React.useState` hook.

The `set` function will not accept partial updates. [Object state mutation actions](#object-state), like `merge`, `update`, etc. are available via `inferred` property. For example:
```ts
link.inferred.update('lastUpdated', new Date());
```
Because it is all typescript compiler checked, the first key for `update` can be only the names of the properties of the type of `value`, `Catalog` type in our example.

Updating the nested property, will cause the update of the original state, representated by `link.value` instance.

However, there is better way to update the nested fields:
```ts
link.nested.lastUpdated.set(new Date());
```

`nested` 'converts' a valuelink of an object to an object of nested value links. `link.nested` object will contain the same keys as the `value` object. These properties will be of type `ValueLink<T>` - nested value links to manage the state of nested fields. In the example above, we set the value of `ValueLink<Date>` link. Because it is all typescript compiler checked, it can only be a value of type `Date`.

Similarly, we can obtain the link to the `books` array:
```ts
// type annotation is for documentation purposes,
// it is inferred by the compiler automatically
const booksLink: ValueLink<Book[]> = link.nested.books;
```
It is nested valuelink of an array value. It has got `value` and `set` properties. [Array mutation actions](#array-state), like `push`, `pop`, `insert`, etc. can be accessed via `inferred` property. For example:
```ts
booksLink.inferred.push({
    title: 'Rapid Development',
    popularity: 2,
    authors: ['Steve McConnell']
});
```
Again, because it is typescript compiler checked, `push` will require the argument of compatible type, `Book` in the example.

Similary to object valuelink, array valuelink has got `nested` property, which 'converts' value link of an array to an array of nested valuelinks. For example:
```ts
// type annotation is for documentation purposes,
// it is inferred by the compiler automatically
const firstBookLink: ValueLink<Book> = booksLink.nested[0];
```
`firstBookLink` is valuelink of an object. Similarly to updating the property on the root object, we can update the property on the nested object:
```ts
firstBookLink.nested.popularity.set(prevValue => prevValue + 1);
```

`ValueLink`'s `path` property captures 'Javascript' object 'path' to an element relative to the root object. For example:
```ts
link.path === []
link.nested.books.path === ["books"]
link.nested.books.nested[0].path === ["books", 0]
link.nested.books.nested[0].nested.title.path === ["books", 0, "title"]
```

I hope, this example demonstrates how it is possible to traverse the complex data and manage deeply nested properties.

#### Form state

Form state is frequently referred as two-way data binding. Valuelink pattern is perfect way to achieve it. Because `useStateLink` returns `ValueLink` it can be used straight away to manage form state. Let's continue the above example:
```tsx
const BookEditorExample = (props: { book: Book }) => {
    // note we obtain nested links straight away
    const links = useStateLink(props.book).nested;
    return (
        <div>
            <label>Title</label>
            <input
                value={links.title.value}
                onChange={e => links.title.set(e.target.value)}
            />
            <label>Popularity</label>
            <input
                value={links.popularity.value}
                onChange={e => links.popularity.set(Number(e.target.value))}
            />
        </div>
    );
};
```

The nested link to edit a book, could even come from the parent component, i.e. all down from the top component, which uses `useStateLink` hook.

```ts
const BookEditorExample = (props: { link: ValueLink<Book> }) => {
    const links = link.nested;
    ...
};
```
#### Input validation

Since we integrated the valuelink with the [form state](#form-state) and user input, it would be good to have some data validation logic put in place.

`useStateLink` allows to define data validation rules. The rules can be attached to entire root level objects or deeply nested fields. The structure of validation rules is type checked by typescript compiler, i.e. it will not allow rules for unknown properties, for example.

Let's expand the above example, adding some validation logic:
```ts
    const link = useStateLink<Catalog>({
        books: [
            {
                title: 'Code complete',
                popularity: 1,
                authors: ['Steve McConnell']
            }
        ],
        lastUpdated: new Date()
    }, {
        targetHooks: {
            books: {
                __validate: v => v.length === 0 ? 'There should be at least one book' : undefined,
                // wild-card hooks, applied to all elements of an array,
                // which do not have specificaly targeted hooks
                '*': {
                    title: {
                        __validate: v => v.length === 0 ? 'There should be non-empty book title' : undefined
                    },
                    popularity: {
                        __validate: v => !Number.isFinite(v) ? 'Popularity should be a number' : undefined
                    }
                },
                // hooks specifically targeting the first element of an array
                0: { }
            }
        }
    });
```

We provide the seconds argument of type `Settings<Catalog>`, which contains some `__validation` hooks. Validation hooks should return error message (or array of error messages, i.e. string[]) in case of validation failure. And `undefined` otherwise. These hooks are invoked by valuelink (or it's nested children valuelinks) when one of the following `ValueLink`'s properties is accessed:

- `errors` returns the array of all errors captured by validation. For example:
    ```ts
    const errorMessage = link.errors.firstPartial().message || 'Form data is valid';
    ```
- `valid` (`invalid`) returns true (false) if there are no `errors`. It can be used to prevent form submit action:
    ```tsx
    const submitButton = <button disabled={link.invalid}>Submit</button>;
    ```

#### Modification detection

`ValueLink` properties `modified` and `unmodified` allow to check if the current value state is different to the initial state. It can be used to detect what parts of data have been touched, eg. in form input. For example:

```ts
// true if any of nested fields have been modified
link.modified;
// true if any of books have been modified
link.nested.books.modified; 
// true if any property of the first book has been modified
link.nested.books.nested[0].modified; 
// true if title of the first book has been modified
link.nested.books.nested[0].nested.title.modified; 
```

The `initialValue` property of `ValueLink` returns the initial state value.

The default comparison operator checks for structural identity. It is effectively the same as `JSON.stringify(link.initialValue) === JSON.stringify(link.value)`. The comparison operator can be modified or extended using valuelink settings, similarly to validation settings. For example:
```ts
    const link = useStateLink<Catalog>({
        books: [
            {
                title: 'Code complete',
                popularity: 1,
                authors: ['Steve McConnell']
            }
        ],
        lastUpdated: new Date()
    }, {
        targetHooks: {
            __compare: (current, initial, l) => current.lastUpdated === (initial && initial.lastUpdated),
        }
    });
```
If `__compare` hook returns `undefined`, default comparison operator is used.

#### Preset hook

In addition to `__validate` and `__compare` hooks, there is `__preset` hook. It can be used to reject invalid input, alter the mutation actions or for debugging purposes.

For example, let's say our `Book`'s `popularity` input field should allow only digits:
```tsx
const BookPopularityEditorExample = () => {
    const valuelink = useStateLink(0, {
        targetHooks: {
            // the hook returns new value if number,
            // and the old value, otherwise
            // so, typing characters in the input field below
            // makes no effect
            __preset: (v: number, l: ReadonlyValueLink<number>) => Number.isFinite(v) ? v : l.value
        }
    });
    return (
        <div>
            <label>Popularity</label>
            <input
                value={valuelink.value}
                // Number() return NaN in case of bad input
                onChange={e => valuelink.set(Number(e.target.value))}
            />
        </div>
    );
};
```

Let's say we also would like to update `lastUpdated` property automatically every time any change is made to our catalog:
```tsx
    const link = useStateLink<Catalog>({
        books: [
            {
                title: 'Code complete',
                popularity: 1,
                authors: ['Steve McConnell']
            }
        ],
        lastUpdated: new Date()
    }, {
        targetHooks: {
            __preset: v => ({ lastUpdated: new Date(), ...v })
        }
    });
```

Preset hook is useful for debugging sometimes:
```tsx
    const link = useStateLink<Catalog>({
        books: [
            {
                title: 'Code complete',
                popularity: 1,
                authors: ['Steve McConnell']
            }
        ],
        lastUpdated: new Date()
    }, {
        targetHooks: {
            __preset: v => {
                console.log('Catalog is updated', v)
                return v;
            },
            books: {
                __preset: v => {
                    console.log('Books are updated', v)
                    return v;
                } 
            }
        }
    });
```

If we would like to put preset hook for every property, we can use `globalHooks` instead of `targetHooks`:
```tsx
    const link = useStateLink<Catalog>({
        books: [
            {
                title: 'Code complete',
                popularity: 1,
                authors: ['Steve McConnell']
            }
        ],
        lastUpdated: new Date()
    }, {
        globalHooks: {
            __preset: (v, l) => {
                console.log(`Value by path ${l.path} is set to ${v}`);
                return v;
            }
        },
    });
```

#### Cached state

One of the problems with massive objects participating in React state lifecycle is performance of rendering of all of the components relying on the state data. This problem is not specific to this library, it is true in general: frequent massive data updates are hard in performance.

Returning to the `Catalog` example above, an application could render views / edit-forms for all books from the single [complex state](#complex-state) of the `Catalog`. It could use [form state](#form-state) per every book to allow editing capabilities for the catalog. If a user decides to update a title of a single book, it would cause re-rendering for entire catalog on every key stroke, because update of nested data results in the update of the root state. The solution to this problem is to use temporary local to form component state, while capturing user's input, and update parent's state once editing is completed. For example:

```tsx
const BookEditorExample = (props: { link: ValueLink<Book> }) => {
    // we create local per-component state from the property supplied by the parent
    const link = useStateLink(props.link.value);
    return (
        // when user leaves the editor, update the parent automatically
        <div onBlur={() => props.link.set(link.value)}>
            <label>Title</label>
            <input
                // use local state to manage user's input
                value={link.nested.title.value}
                onChange={e => link.nested.title.set(e.target.value)}
            />
            <label>Popularity</label>
            <input
                // use local state to manage user's input
                value={link.nested.popularity.value}
                onChange={e => link.nested.popularity.set(Number(e.target.value))}
            />
            <button
                disabled={props.link.modifed}
                // update parent's state once finished
                onClick={() => props.link.set(link.value)}
            >
            Save
            </button>
        </div>
    );
};
```

This improves the performance a lot, but does not allow us to reuse validation rules defined for the parent's valuelink. Let's modify the example and inherit validation rules and other hooks from the parent's link:

```tsx
const BookEditorExample = (props: { link: ValueLink<Book> }) => {
    // notice we dropped .value from props.link.value as an input for the initial local state
    const link = useStateLink(props.link);
    // the rest is the same
    ...
};
```
The created local `link` inherited validation rules from the parent link.

Plus, there are two more bonuses:
  - the parent link's value is updated from the local link's value automatically every time, when `valid` and `modified` status becomes different between parent link and local link. This allows parent components to react on `valid` and `modified` status changes as soon as they happen (i.e. while user types in the form.)
  - if the parent's state is updated by some other external way (eg. new data is received from a server), the local form state will use the updated parent's state instead of the last form's state

### Global state

Previously we relied on React to store the state per component. When multiple components need to use the shared state, which can be initialized prior to mounting of React components, we need to create global state store. Traditionally it was done using libraries like Redux or Mobx. This library allow to achieve the same but with simpler API and cleaner code.

Let's create the global store (we continue using the same example as above):
```ts
const GlobalStore = createStateLink(
    // supply the initial value for the store
    // it can be read from localStore or can be set to a default
    // until the data is fetched from a server, for example
    {
        books: [
            {
                title: 'Code complete',
                popularity: 1,
                authors: ['Steve McConnell']
            }
        ],
       lastUpdated: new Date()
    } as Catalog);
```

`createStateLink` has got the second argument which allows to specify [validation rules](#input-validation), [preset hooks](#preset-hook), and other settings as for `useStateLink`.

Now, create a component which uses the store state (reads and updates):

```tsx
const UseStateLinkExample = () => {
    const link = useStateLink(GlobalStore);

    return (
        <div>
            {JSON.stringify(link.value)}
            <button
                onClick={() => link.nested.books.inferred.push({
                    title: 'Code complete',
                    popularity: 1,
                    authors: ['Steve McConnell']
                })}
            >
            Add the second book
            </button>
        </div>
    );
};
```

And all of the components, which use global store link in the rendering logic, should be nested within the observer.

```tsx
const App = () => {
    return (
        <GlobalStore.Observer>
            {
                // nested components, which use GlobalStore will re-render
                // when GlobalStore state is changed
            }
            ...
        </GlobalStore.Observer>
    );
};
```

One observer per application is enough, but you can specify few to provide fine-grained observation and improve the performance by doing so.

#### Global state reducer

Valuelink API might not be the best to expose to consuming components. We can provide Mobx-like store functionality with clear type-safe API. For example:

```tsx
// assuming it is module's private variable
const GlobalStore = createStateLink({ books: [], lastUpdated: new Date } as Catalog);

// export the observer component
export const StoreObserver = GlobalStore.Observer;

// export the hook to the store
export function useStore() {
    const link = useStateLink(GlobalStore);
    return {
        addBook(book: Book) {
            link.nested.books.inferred.push(book);
        },
        updateTitle(bookIndex: number, title: string) {
            link.nested.books.nested[bookIndex].nested.title.set(title);
        },
        getBooks() {
            return link.value.books;
        }
    };
}

```

Now, this store can be used as the following:
```tsx
const UseStoreExample = () => {
    const store = useStore();

    return (
        <div>
            {JSON.stringify(store.getBooks())}
            <button
                onClick={() => store.addBook({
                    title: 'Code complete',
                    popularity: 1,
                    authors: ['Steve McConnell']
                })}
            >
            Add the second book
            </button>
        </div>
    );
};
```

Of course, you can create many independent stores per application.

Same result as using Redux or Mobx, but with cleaner & fewer lines of code, using smaller library overall, which handles all state lifecycle management scenarios.

Hope you enjoy using it. Feel free to contact me via github tickets or contribute to the library.

## Future work

Write unit tests. The library is tested severely in scope of other projects, as some of these seriously rely on this library. However, it should not be an excuse not to write unit tests for this library. It has not been done because of lack of time.

## Alternatives

  - [valuelink](https://www.npmjs.com/package/valuelink) for complex local state management and two-way data binding. 
    - This work was initially inspired by the implementation of [valuelink](https://www.npmjs.com/package/valuelink), but I wanted greater type-safety of the API and some other features to handle greater variety of usecases in concise and simple way.
  - [react-use](https://github.com/streamich/react-use) `useList` and `useMap` libraries for local state management of arrays and objects
  - [mobx-react-lite](https://www.npmjs.com/package/mobx-react-lite) for global state management

## License

MIT

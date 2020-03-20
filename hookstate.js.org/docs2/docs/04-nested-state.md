---
id: nested-state
title: Nested state
sidebar_label: Nested state
---

import { PreviewSample } from '../src/PreviewSample'

[Local state](./local-state) and [Global state](./global-state) sections show examples, where state data is a primitive value. Next, we will have a look into one of the most powerful features of the Hookstate - the interface to a nested state of a complex object state. The interface is the same for local and global states and works equally well for both cases.

## Accessing and mutating nested state

Let's consider the following example where a state value is an array of objects. It demonstrates how to dive into nested state of the array and deep nested state of an element
of the array. The state of an element is passed to a child component as a property. The child component gets and sets the deep nested state. 

<PreviewSample example="local-complex-from-documentation" />

As you can see, all the power and flexibility is really behind one `nested` function, which
allows to *walk* complex states and target individual deep nested property for update.
Read more about [StateLink.nested](typedoc-hookstate-core#nested), [StateLink.get](typedoc-hookstate-core#get) and [StateLink.set](typedoc-hookstate-core#set) in the [API reference](typedoc-hookstate-core).

## Scalable nested state / Scoped state

<PreviewSample example="local-complex-from-documentation" />

## Dealing with nullable state

denull

## Advanced mutations for an array state 

### Updating existing element

### Appending new element

### Deleting existing element

### Concatenating with another array

### Swapping two elements

### Partial updates and deletions

## Advanced mutations for an object state 

TODO document LinkState.keys

### Updating existing property

### Adding new property

### Deleting existing property

### Swapping two properties

### Partial updates and deletions

## Advanced mutations for a string state 

### Updating existing property

### Concatenating with another string

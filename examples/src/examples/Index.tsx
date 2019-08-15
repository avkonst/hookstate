import React from 'react';

import { ExampleComponent as ExampleGlobalPrimitive } from './getting-started';
import { ExampleComponent as ExampleGlobalArray } from './global-array';
import { ExampleComponent as ExampleGlobalObject } from './global-object';
import { ExampleComponent as ExampleGlobalComplex } from './global-complex';
import { ExampleComponent as ExampleLocalForm } from './local-form';
import { ExampleComponent as ExampleGlobalMultiConsumers } from './global-multiple-consumers';
import { ExampleComponent as ExampleLocalMultiConsumers } from './local-multiple-consumers';
import { ExampleComponent as ExampleGlobalMultiConsumersFromRoot } from './global-multiple-consumers-from-root';
import { ExampleComponent as ExamplePerformanceLargeTable } from './performance-demo-large-table';
import { A } from 'hookrouter';

export interface ExampleMeta {
    name: string,
    description: JSX.Element,
    demo: JSX.Element;
}

export const ExampleIds = {
    GlobalPrimitive: 'getting-started',
    GlobalObject: 'global-object',
    GlobalArray: 'global-array',
    GlobalComplex: 'global-complex',
    LocalForm: 'local-form',
    GlobalMutlipleConsumers: 'global-multiple-consumers',
    LocalMutlipleConsumers: 'local-multiple-consumers',
    GlobalMutlipleConsumersFromRoot: 'global-multiple-consumers-from-root',
    PerformanceLargeTable: 'performance-demo-large-table',
}

const baseUrl = 'https://raw.githubusercontent.com/avkonst/hookstate/master/examples/src/examples/'

export const ExampleCodeUrl = (id: string) => `${baseUrl}${id}.tsx`;

const ExampleLink = (props: {id: string, title?: string}) =>
    <A href={props.id}>{props.title ? props.title : ExamplesRepo.get(props.id)!.name}</A>

const StateLinkHref = () =>
    <code><a href="https://github.com/avkonst/hookstate#api-documentation">StateLink</a></code>

export const ExamplesRepo: Map<string, ExampleMeta> = new Map();
ExamplesRepo.set(ExampleIds.GlobalPrimitive, {
    name: 'Global State: Primitive',
    description: <>Create the state and use it
        within and outside of a React component. Few lines of code. No bolierplate!</>,
    demo: <ExampleGlobalPrimitive />
});
ExamplesRepo.set(ExampleIds.GlobalObject, {
    name: 'Global State: Object',
    description: <>This one is similar to <ExampleLink id={ExampleIds.GlobalPrimitive} /> example but
        the state holds an object instance instead of the primitive type value.
        The <code>nested</code> property of the <StateLinkHref /> helps
        to traverse the object and access/mutate object's properties.
        </>,
    demo: <ExampleGlobalObject />
});
ExamplesRepo.set(ExampleIds.GlobalArray, {
    name: 'Global State: Array',
    description: <>This one similar to <ExampleLink id={ExampleIds.GlobalPrimitive} /> example but
        the state holds an array instance. The <code>nested</code> property
        of the <StateLinkHref /> helps to get to the state of the array elements and access/mutate it.
        </>,
    demo: <ExampleGlobalArray />
});
ExamplesRepo.set(ExampleIds.GlobalComplex, {
    name: 'Global State: Complex',
    description: <>The state of most applications is likely a complex type structure.
        Hookstate makes it easy to access and mutate deeply nested fields in very easy way
        via <code>nested</code> property of the the <StateLinkHref />.
        This examles builds on top
        of <ExampleLink id={ExampleIds.GlobalObject} /> and <ExampleLink id={ExampleIds.GlobalArray} /> examples.
        </>,
    demo: <ExampleGlobalComplex />
});
ExamplesRepo.set(ExampleIds.LocalForm, {
    name: 'Local State: Form Sample',
    description: <>Local component state can be managed in the same way as the global state.
        The difference with the <ExampleLink id={ExampleIds.GlobalPrimitive} /> is
        that the state is automatically created by <code>useStateLink</code> and
        saved per component but not globaly.
        The local state is not preserved when a component is unmounted.
        It is very similar to the original <code>React.useState</code> functionaly,
        but the <StateLinkHref /> has got more features.
        </>,
    demo: <ExampleLocalForm />
});
ExamplesRepo.set(ExampleIds.GlobalMutlipleConsumers, {
    name: 'Global State: Optimized Rendering',
    description: <>Hookstate tracks
        what subset of the state data is used, by what component, and what is changed.
        And it rerenders only the components affected by a change.
        It is the key feature of the Hookstate and it does it automatically for the
        components, which consume the global state. The same optimization
        is available for the local (per component) state
        (see <ExampleLink id={ExampleIds.LocalMutlipleConsumers} /> example).
        Change the data and watch the rerendering of ONLY the affected components.
        </>,
    demo: <ExampleGlobalMultiConsumers />
});
ExamplesRepo.set(ExampleIds.LocalMutlipleConsumers, {
    name: 'Local State: Optimized Rendering',
    description: <>The rendering of the local (per component) state
        can be also optimized the same way as
        for <ExampleLink id={ExampleIds.GlobalMutlipleConsumers} title="the global state" />.
        The difference is
        that the state is created per 'root' component and corresponding 'leaves' of the state
        are passed to the nested components as properties. In fact it is possible to use
        the global state in the 'root' component too, and still have rendering optimized
        (see <ExampleLink id={ExampleIds.GlobalMutlipleConsumersFromRoot} /> example).
        This can be used to efficiently render large data forms regadless
        of whether the state is coming from local variable or global.
        </>,
    demo: <ExampleLocalMultiConsumers />
});
ExamplesRepo.set(ExampleIds.GlobalMutlipleConsumersFromRoot, {
    name: 'Combined State: Optimized Rendering',
    description: <>The same demo as in the <ExampleLink id={ExampleIds.GlobalMutlipleConsumers} /> example,
        but the global state is consumed in the 'root' component and 'leaves' of the state
        are passed to the nested components as properties. The same is demonstrated for the local state
        in the <ExampleLink id={ExampleIds.LocalMutlipleConsumers} /> example. This is the recommended way to
        consume the global state, when a large subset of the state is being used / rendered. It is because
        the automated tracking of used nested properties allows to build very efficient index to locate
        the affected by a state change components very quickly
        (see <ExampleLink id={ExampleIds.PerformanceLargeTable} /> example).
        </>,
    demo: <ExampleGlobalMultiConsumersFromRoot />
});
ExamplesRepo.set(ExampleIds.PerformanceLargeTable, {
    name: 'Performance Demo: Large Table',
    description: <>Watch how Hookstate handles <b><u>1 out of 10000</u> table cells updates <u>every millisecond</u></b>.
        Stretch the matrix to 100x100 and set 50 cells to update per every 1ms interval. And "Follow the White Rabbit".
        The used technique is explained in the <ExampleLink id={ExampleIds.GlobalMutlipleConsumersFromRoot} /> example.
        </>,
    demo: <ExamplePerformanceLargeTable />
});

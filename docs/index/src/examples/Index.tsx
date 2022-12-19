import React from 'react';

import { ExampleComponent as ExampleGlobalPrimitive } from './global-getting-started';
import { ExampleComponent as ExampleGlobalPrimitiveInterface } from './global-getting-started-interface';
import { ExampleComponent as ExampleLocalPrimitive } from './local-getting-started';
import { ExampleComponent as ExampleAsyncState } from './local-async-state';
import { ExampleComponent as ExampleLocalComplexFromDocumentation } from './local-complex-from-documentation';
import { ExampleComponent as ExampleLocalComplexTreeStructure } from './local-complex-tree-structure';
import { ExampleComponent as ExamplePerformanceLargeForm } from './performance-demo-large-form';
import { ExampleComponent as ExampleGlobalMultipleConsumersStateFragment } from './global-multiple-consumers-statefragment';

import { ExampleComponent as ExamplePluginIdentifiable } from './plugin-identifiable';
import { ExampleComponent as ExamplePluginSubscribable } from './plugin-subscribable';
import { ExampleComponent as ExamplePluginSnapshotable } from './plugin-snapshotable';
import { ExampleComponent as ExamplePluginLocalstored } from './plugin-localstored';
import { ExampleComponent as ExamplePluginBroadcasted } from './plugin-broadcasted';
import { ExampleComponent as ExamplePluginValidation } from './plugin-validation';
import { ExampleComponent as ExamplePluginCustom } from './plugin-custom';

import { ExampleComponent as ExampleWithUseEffect } from './with-use-effect';

const baseUrl = 'https://raw.githubusercontent.com/avkonst/hookstate/master/docs/index/src/examples/'

export const ExampleCodeUrl = (id: string) => `${baseUrl}${id}.tsx`;

export const ExamplesRepo: Map<string, React.ReactElement> = new Map();
ExamplesRepo.set('global-getting-started', <ExampleGlobalPrimitive />);
ExamplesRepo.set('global-getting-started-interface', <ExampleGlobalPrimitiveInterface />);
ExamplesRepo.set('local-getting-started', <ExampleLocalPrimitive />);
ExamplesRepo.set('local-complex-from-documentation', <ExampleLocalComplexFromDocumentation />);
ExamplesRepo.set('local-async-state', <ExampleAsyncState />);
ExamplesRepo.set('local-complex-tree-structure', <ExampleLocalComplexTreeStructure />);
ExamplesRepo.set('performance-demo-large-form', <ExamplePerformanceLargeForm />);
ExamplesRepo.set('global-multiple-consumers-statefragment', <ExampleGlobalMultipleConsumersStateFragment />);

ExamplesRepo.set('plugin-identifiable', <ExamplePluginIdentifiable />);
ExamplesRepo.set('plugin-subscribable', <ExamplePluginSubscribable />);
ExamplesRepo.set('plugin-snapshotable', <ExamplePluginSnapshotable />);
ExamplesRepo.set('plugin-validation', <ExamplePluginValidation />);
ExamplesRepo.set('plugin-localstored', <ExamplePluginLocalstored />);
ExamplesRepo.set('plugin-broadcasted', <ExamplePluginBroadcasted />);

ExamplesRepo.set('plugin-custom', <ExamplePluginCustom />);

ExamplesRepo.set('with-use-effect', <ExampleWithUseEffect />);

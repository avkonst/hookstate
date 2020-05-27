import React from 'react';

import { ExampleComponent as ExampleGlobalPrimitive } from './global-getting-started';
import { ExampleComponent as ExampleGlobalPrimitiveInterface } from './global-getting-started-interface';
import { ExampleComponent as ExampleLocalPrimitive } from './local-getting-started';
import { ExampleComponent as ExampleAsyncState } from './local-async-state';
import { ExampleComponent as ExampleLocalComplexFromDocumentation } from './local-complex-from-documentation';
import { ExampleComponent as ExampleLocalComplexTreeStructure } from './local-complex-tree-structure';
import { ExampleComponent as ExamplePerformanceLargeTable } from './performance-demo-large-table';
import { ExampleComponent as ExamplePerformanceLargeForm } from './performance-demo-large-form';
import { ExampleComponent as ExampleGlobalMultipleConsumersStateFragment } from './global-multiple-consumers-statefragment';

import { ExampleComponent as ExamplePluginLabelled } from './plugin-labelled';
import { ExampleComponent as ExamplePluginInitial } from './plugin-initial';
import { ExampleComponent as ExamplePluginTouched } from './plugin-touched';
import { ExampleComponent as ExamplePluginPersistence } from './plugin-persistence';
import { ExampleComponent as ExamplePluginValidation } from './plugin-validation';
import { ExampleComponent as ExamplePluginUntracked } from './plugin-untracked';

const baseUrl = 'https://raw.githubusercontent.com/avkonst/hookstate/master/docs/index/src/examples/'

export const ExampleCodeUrl = (id: string) => `${baseUrl}${id}.tsx`;

export const ExamplesRepo: Map<string, React.ReactElement> = new Map();
ExamplesRepo.set('global-getting-started', <ExampleGlobalPrimitive />);
ExamplesRepo.set('global-getting-started-interface', <ExampleGlobalPrimitiveInterface />);
ExamplesRepo.set('local-getting-started', <ExampleLocalPrimitive />);
ExamplesRepo.set('local-complex-from-documentation', <ExampleLocalComplexFromDocumentation />);
ExamplesRepo.set('local-async-state', <ExampleAsyncState />);
ExamplesRepo.set('local-complex-tree-structure', <ExampleLocalComplexTreeStructure />);
ExamplesRepo.set('performance-demo-large-table', <ExamplePerformanceLargeTable />);
ExamplesRepo.set('performance-demo-large-form', <ExamplePerformanceLargeForm />);
ExamplesRepo.set('global-multiple-consumers-statefragment', <ExampleGlobalMultipleConsumersStateFragment />);
ExamplesRepo.set('plugin-labelled', <ExamplePluginLabelled />);
ExamplesRepo.set('plugin-initial', <ExamplePluginInitial />);
ExamplesRepo.set('plugin-touched', <ExamplePluginTouched />);
ExamplesRepo.set('plugin-validation', <ExamplePluginValidation />);
ExamplesRepo.set('plugin-persistence', <ExamplePluginPersistence />);
ExamplesRepo.set('plugin-untracked', <ExamplePluginUntracked />);

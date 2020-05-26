import React from 'react';

import { ExampleComponent as ExampleGlobalPrimitive } from './global-getting-started';
import { ExampleComponent as ExampleGlobalPrimitiveInterface } from './global-getting-started-interface';
import { ExampleComponent as ExampleLocalPrimitive } from './local-getting-started';
import { ExampleComponent as ExampleAsyncState } from './local-async-state';
import { ExampleComponent as ExampleLocalComplexFromDocumentation } from './local-complex-from-documentation';
import { ExampleComponent as ExampleLocalComplexTreeStructure } from './local-complex-tree-structure';
import { ExampleComponent as ExamplePerformanceLargeTable } from './performance-demo-large-table';
import { ExampleComponent as ExamplePerformanceLargeForm } from './performance-demo-large-form';

import { ExampleComponent as ExamplePluginInitial } from './plugin-initial';
import { ExampleComponent as ExamplePluginTouched } from './plugin-touched';
import { ExampleComponent as ExamplePluginPersistence } from './plugin-persistence';
import { ExampleComponent as ExamplePluginValidation } from './plugin-validation';
import { ExampleComponent as ExamplePluginUntracked } from './plugin-untracked';

import ExampleIds from './ids';

const baseUrl = 'https://raw.githubusercontent.com/avkonst/hookstate/master/docs/index/src/examples/'

export const ExampleCodeUrl = (id: string) => `${baseUrl}${id}.tsx`;

export const ExamplesRepo: Map<string, React.ReactElement> = new Map();
ExamplesRepo.set(ExampleIds.GlobalPrimitive, <ExampleGlobalPrimitive />);
ExamplesRepo.set(ExampleIds.GlobalPrimitiveInterface, <ExampleGlobalPrimitiveInterface />);
ExamplesRepo.set(ExampleIds.LocalPrimitive, <ExampleLocalPrimitive />);
ExamplesRepo.set(ExampleIds.LocalComplexFromDocumentation, <ExampleLocalComplexFromDocumentation />);
ExamplesRepo.set(ExampleIds.AsyncState, <ExampleAsyncState />);
ExamplesRepo.set(ExampleIds.LocalComplexTreeStructure, <ExampleLocalComplexTreeStructure />);
ExamplesRepo.set(ExampleIds.PerformanceLargeTable, <ExamplePerformanceLargeTable />);
ExamplesRepo.set(ExampleIds.PerformanceLargeForm, <ExamplePerformanceLargeForm />);
ExamplesRepo.set(ExampleIds.PluginInitial, <ExamplePluginInitial />);
ExamplesRepo.set(ExampleIds.PluginTouched, <ExamplePluginTouched />);
ExamplesRepo.set(ExampleIds.PluginValidation, <ExamplePluginValidation />);
ExamplesRepo.set(ExampleIds.PluginPersistence, <ExamplePluginPersistence />);
ExamplesRepo.set(ExampleIds.PluginUntracked, <ExamplePluginUntracked />);

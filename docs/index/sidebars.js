/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    someSidebar: {
        Introduction: [
            'getting-started',
            'global-state',
            'local-state',
            'nested-state',
            'scoped-state',
            'nullable-state',
            'asynchronous-state',
            'recursive-state',
            'exporting-state',
            // 'dynamic-states-store',
            'using-without-statehook',
            // 'using-with-memo',
            // 'moving-from-redux-mobx',
            'migrating-to-v2'
        ],
        Performance: [
            'performance-intro',
            'performance-large-state',
            'performance-frequent-updates',
            'performance-batched-updates',
            'performance-managed-rendering',
            'performance-preact',
        ],
        Extensions: [
            'extensions-overview',
            'extensions-initial',
            'extensions-touched',
            'extensions-validation',
            'extensions-labelled',
            // 'extensions-broadcasted',
            'extensions-persistence',
            // 'extensions-offline',
            'writing-plugin'
        ],
        'Development Tools': ['devtools'],
        'API Reference': [
            'typedoc-hookstate-core',
            'exceptions'
        ],
    },
};

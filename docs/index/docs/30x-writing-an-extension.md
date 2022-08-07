---
id: writing-extension
title: Writing your own extension
sidebar_label: Writing an extension
---

import { PreviewSample } from '../src/PreviewSample'

An extension is effectively a factory of a set of callbacks. All callbacks are optional.

`onCreate` callback returns implementation for extension methods and properties which are added to a State object, where this extension is activated. If your extension does not add any properties or methods, do not provide `onCreate` callback or return `{}` from it.

Here is an example of an extension which has got all possible callbacks and prints console logs when callbacks are called. It also defines an extension method and an extension property. The example is relatively long, because we provided extensive comments and mentioned other available capabilities,
which we did not use in this instance.

For more information, check out how the existing standard plugins are implemented. In case of any issues, just raise a ticket on Github.

<PreviewSample example="plugin-custom" />


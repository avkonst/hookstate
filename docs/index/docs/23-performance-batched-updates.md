---
id: performance-batched-updates
title: Batching state updates
sidebar_label: Batching updates
---

import { PreviewSample } from '../src/PreviewSample'

If you have got an event handler, which results in multiple state update actions
(for the same nested part of a state or different), React will batch state updates and will minimize rerendering natively.

---
id: performance-intro
title: Performance overview
sidebar_label: Overview
---

import { PreviewSample } from '../src/PreviewSample'

Performance is one of the main goals of the Hookstate project alongside with simple and flexible API. Hookstate has got two technologies built-in, which make it stand out and deliver incredible performance for applications:

1. Hookstate does Proxy-based state value usage tracking to identify what components require rerendering when a state is changed.
2. Hookstate has got [scoped state](./scoped-state) feature which multiplies the effect of the first, particularly for the cases involving [large states](./performance-large-state) and [frequent updates](./performance-frequent-updates).


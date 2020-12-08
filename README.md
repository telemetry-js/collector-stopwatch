# collector-stopwatch

> **Collect durations through convenient start/stop methods.**  
> A [`telemetry`](https://github.com/telemetry-js/telemetry) plugin.

[![npm status](http://img.shields.io/npm/v/telemetry-js/collector-stopwatch.svg)](https://www.npmjs.org/package/@telemetry-js/collector-stopwatch)
[![node](https://img.shields.io/node/v/@telemetry-js/collector-stopwatch.svg)](https://www.npmjs.org/package/@telemetry-js/collector-stopwatch)
[![Test](https://github.com/telemetry-js/collector-stopwatch/workflows/Test/badge.svg?branch=main)](https://github.com/telemetry-js/collector-stopwatch/actions)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Table of Contents

<details><summary>Click to expand</summary>

- [Usage](#usage)
- [Options](#options)
- [Install](#install)
- [Acknowledgements](#acknowledgements)
- [License](#license)

</details>

## Usage

```js
const telemetry = require('@telemetry-js/telemetry')()
const stopwatch = require('@telemetry-js/collector-stopwatch')
const selectDuration = stopwatch('select_query.duration')

telemetry.task()
  .collect(selectDuration)
  .schedule(..)

// Elsewhere in your app
const stop = selectDuration.start()

// Sometime later
stop()
```

You can `start()` multiple stopwatches (if you want them to have the same metric name) repeatedly and/or in parallel. The following example will result in two emitted metrics with the elapsed milliseconds between the `start()` and `stop()` calls: ~1000 and ~5000.

```js
const stop = selectDuration.start()
const stop2 = selectDuration.start()

setTimeout(stop, 1000)
setTimeout(stop2, 5000)
```

If you need multiple distinct metric names, create multiple plugins:

```js
const selectDuration = stopwatch('select_query.duration')
const insertDuration = stopwatch('insert_query.duration')

telemetry.task()
  .collect(selectDuration)
  .collect(insertDuration)
```

## Options

_Yet to document._

## Install

With [npm](https://npmjs.org) do:

```
npm install @telemetry-js/collector-stopwatch
```

## Acknowledgements

This project is kindly sponsored by [Reason Cybersecurity Inc](https://reasonsecurity.com).

[![reason logo](https://cdn.reasonsecurity.com/github-assets/reason_signature_logo.png)](https://reasonsecurity.com)

## License

[MIT](LICENSE) © Vincent Weevers

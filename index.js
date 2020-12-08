'use strict'

const EventEmitter = require('events').EventEmitter
const singleMetric = require('@telemetry-js/metric').single

module.exports = function (name, options) {
  if (typeof name !== 'string' || name === '') {
    throw new TypeError('The first argument "name" must be a non-empty string')
  } else if (options != null && typeof options !== 'object') {
    throw new TypeError('The second argument "options" must be an object')
  }

  const metricOptions = Object.assign({}, options, { unit: 'milliseconds' })
  const queues = []
  const stops = new Set()

  const pluginFn = function () {
    const queue = []
    queues.push(queue)
    return new StopwatchCollector(queue)
  }

  const record = function (startTime) {
    const date = new Date()
    const endTime = date.getTime()
    const duration = endTime - startTime

    for (const queue of queues) {
      const metric = singleMetric(name, metricOptions)
      metric.record(duration, date)
      queue.push(metric)
    }
  }

  pluginFn.start = function () {
    const stop = record.bind(null, Date.now())
    stops.add(stop)
    return stop
  }

  pluginFn.stop = function () {
    for (const stop of stops) {
      stop()
    }

    stops.clear()
  }

  if (options && options.start) {
    pluginFn.start()
  }

  return pluginFn
}

class StopwatchCollector extends EventEmitter {
  constructor (queue) {
    super()
    this._queue = queue
  }

  start (callback) {
    this._queue.length = 0
    process.nextTick(callback)
  }

  ping (callback) {
    this._flush()

    // No need to dezalgo ping()
    callback()
  }

  stop (callback) {
    this._flush()
    process.nextTick(callback)
  }

  _flush () {
    for (const metric of this._queue) {
      this.emit('metric', metric)
    }

    this._queue.length = 0
  }
}

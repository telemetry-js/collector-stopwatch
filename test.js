'use strict'

const test = require('tape')
const stopwatch = require('.')

test('start/stop', async function (t) {
  t.plan(1)

  const plugin = stopwatch('test.duration')
  const collector = plugin()
  const stop1 = plugin.start()
  const stop2 = plugin.start()

  await sleep(100)
  stop1()

  await sleep(100)
  stop2()

  const stop3 = plugin.start()
  stop3()

  t.same(await collect(collector, 'ping'), [{
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 100
  }, {
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 200
  }, {
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 0
  }])
})

test('start on creation', async function (t) {
  t.plan(1)

  const plugin = stopwatch('test.duration', { start: true })
  const collector = plugin()

  await sleep(100)
  plugin.stop()

  t.same(await collect(collector, 'ping'), [{
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 100
  }])
})

test('collector.stop() flushes metrics', async function (t) {
  t.plan(1)

  const plugin = stopwatch('test.duration')
  const collector = plugin()
  const stop1 = plugin.start()
  const stop2 = plugin.start()

  await sleep(100)
  stop1()
  stop2()

  t.same(await collect(collector, 'stop'), [{
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 100
  }, {
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 100
  }])
})

test('plugin.stop() stops all stopwatches', async function (t) {
  t.plan(1)

  const plugin = stopwatch('test.duration')
  const collector = plugin()

  plugin.start()
  plugin.start()

  await sleep(100)
  plugin.stop()

  t.same(await collect(collector, 'stop'), [{
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 100
  }, {
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 100
  }])
})

test('can be collected by multiple tasks', async function (t) {
  t.plan(2)

  const plugin = stopwatch('test.duration')
  const collector1 = plugin()
  const collector2 = plugin()
  const stop = plugin.start()

  await sleep(100)
  stop()

  t.same(await collect(collector1, 'ping'), [{
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 100
  }])

  t.same(await collect(collector2, 'ping'), [{
    name: 'test.duration',
    unit: 'milliseconds',
    resolution: 60,
    value: 100
  }])
})

function collect (collector, method) {
  return new Promise((resolve, reject) => {
    const metrics = []
    const push = metrics.push.bind(metrics)

    collector.on('metric', push)

    collector[method || 'ping']((err) => {
      collector.removeListener('metric', push)
      if (err) return reject(err)

      metrics.forEach(simplify)
      resolve(metrics)
    })
  })
}

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function simplify (metric) {
  delete metric.tags
  delete metric.date
  delete metric.statistic

  metric.value = Math.round(metric.value / 50) * 50

  return metric
}

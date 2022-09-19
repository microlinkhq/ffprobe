'use strict'

const execa = require('execa')
const test = require('ava')

const { path: ffprobePath } = require('..')

test('expose ffprobe path', async t => {
  const result = await execa(ffprobePath, ['-version'])
  console.log(result)
  t.is(result.exitCode, 0)
})

test('run arbitrary command', async t => {
  const result = await execa(ffprobePath, [
    '-print_format',
    'json',
    '-v',
    'quiet',
    '-show_format',
    '-show_streams',
    '-show_error',
    'https://microlink.io/favicon.ico'
  ])

  console.log(result)

  t.is(result.exitCode, 0)
  t.true(!!result.stdout)
  t.false(!!result.stderr)
  t.false(result.failed)
  t.false(result.timedOut)
  t.false(result.isCanceled)
  t.false(result.killed)
})

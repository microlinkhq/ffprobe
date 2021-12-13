'use strict'

const execa = require('execa')
const test = require('ava')

const { path: ffprobePath } = require('..')

test('expose ffprobe path', async t => {
  const { exitCode } = await execa(ffprobePath, ['-version'])
  t.is(exitCode, 0)
})

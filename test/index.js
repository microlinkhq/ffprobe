'use strict'

const $ = require('tinyspawn')
const test = require('ava')

const { path: ffprobePath } = require('..')

test('expose ffprobe path', async t => {
  const result = await $(`${ffprobePath} --version`)
  console.log(result)
  t.is(result.exitCode, 0)
})

test.only('run arbitrary command', async t => {
  const cmd = `${ffprobePath} -print_format json -v quiet -show_format -show_streams -show_error https://microlink.io/favicon.ico`
  const result = await $(cmd)

  t.is(result.exitCode, 0)
  t.true(!!result.stdout)
  t.false(!!result.stderr)
  t.false(result.killed)
})

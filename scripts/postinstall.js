'use strict'

const { existsSync, mkdirSync } = require('fs')
const { writeFile } = require('fs').promises
const { promisify } = require('util')
const lzma = require('lzma-native')
const tar = require('tar-stream')
const stream = require('stream')
const path = require('path')
const got = require('got')
const os = require('os')

const platform = process.env.FFPROBE_PLATFORM || process.platform
const arch = process.env.FFPROBE_ARCH || os.arch()

const URL = {
  // mac m1
  'darwin+arm64': 'https://cdn.microlink.io/ffprobe-4-4-1.tar.xz',
  // linux production
  'linux+x64':
    'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz'
}

const pipeline = promisify(stream.pipeline)

const main = async () => {
  const extract = tar.extract()
  let ffProbeData

  extract.on('entry', (header, stream, cb) => {
    const chunk = []
    stream.on('data', data => chunk.push(data))
    stream.on('end', () => {
      const file = {
        data: Buffer.concat(chunk),
        mode: header.mode,
        mtime: header.mtime,
        path: header.name,
        type: header.type
      }

      if (file.path.endsWith('ffprobe')) {
        ffProbeData = file.data
        requestStream.destroy(new Error('ABORTED_BY_USER'))
      }
      cb()
    })
  })

  const hash = `${platform}+${arch}`
  const requestStream = got.stream(URL[hash])

  try {
    await pipeline(requestStream, lzma.Decompressor(), extract)
  } catch (err) {
    if (err.message !== 'ABORTED_BY_USER') throw err
  }

  const binPath = path.resolve(__dirname, '../bin')

  if (!existsSync(binPath)) mkdirSync(binPath)
  await writeFile(path.join(binPath, 'ffprobe'), ffProbeData, { mode: 493 })
}

main()
  .catch(err => console.error(err) && process.exit(1))
  .then(process.exit)

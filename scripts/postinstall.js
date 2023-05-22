'use strict'

const { existsSync, mkdirSync } = require('fs')
const { writeFile } = require('fs/promises')
const { promisify } = require('util')
const lzma = require('lzma-native')
const tar = require('tar-stream')
const stream = require('stream')
const path = require('path')
const got = require('got')
const os = require('os')

const platform = process.env.FFPROBE_PLATFORM ?? process.platform
const arch = process.env.FFPROBE_ARCH ?? os.arch()
const channel = process.env.FFPROBE_CHANNEL ?? 'git'

const URL = {
  // mac m1
  'darwin+arm64': 'https://cdn.microlink.io/ffprobe.tar.xz',
  // linux production
  'linux+x64':
    channel === 'git'
      ? 'https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz'
      : 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz'
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
  const url = URL[hash]

  if (!url) {
    throw new Error(
      `No binary available for \`${platform}\` platform and \`${arch}\` architecture.`
    )
  }

  const requestStream = got.stream(URL[hash], {
    https: { rejectUnauthorized: false }
  })

  try {
    await pipeline(requestStream, lzma.Decompressor(), extract)
  } catch (err) {
    if (err.message !== 'ABORTED_BY_USER') throw err
  }

  const binPath = path.resolve(__dirname, '../bin')

  if (!existsSync(binPath)) mkdirSync(binPath)
  await writeFile(path.join(binPath, 'ffprobe'), ffProbeData, { mode: 0o755 })
}

main().catch(error => console.error(error) || process.exit(1))

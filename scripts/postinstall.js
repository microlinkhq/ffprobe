'use strict'

const { pipeline } = require('node:stream/promises')
const { existsSync, mkdirSync } = require('fs')
const { writeFile } = require('fs/promises')
const lzma = require('lzma-native')
const tar = require('tar-stream')
const path = require('path')
const got = require('got')
const os = require('os')

const platform = process.env.FFPROBE_PLATFORM ?? process.platform
const arch = process.env.FFPROBE_ARCH ?? os.arch()
const channel = process.env.FFPROBE_CHANNEL ?? 'stable'

const URL = {
  // mac m1
  'darwin+arm64': 'https://cdn.microlink.io/ffprobe.tar.xz',
  // linux production
  'linux+x64':
    channel === 'stable'
      ? 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz'
      : 'https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz'
}

const main = async () => {
  const hash = `${platform}+${arch}`
  const url = URL[hash]

  if (!url) {
    throw new Error(
      `No binary available for \`${platform}\` platform and \`${arch}\` architecture.`
    )
  }

  const extract = tar.extract()
  let buffer = []

  extract.on('entry', (header, stream, next) => {
    const chunk = []
    stream
      .on('data', data => chunk.push(data))
      .on('end', () => {
        if (!header.name.endsWith('ffprobe')) return next()
        buffer = Buffer.concat(chunk)
        extract.destroy(new Error('ABORTED_BY_USER'))
      })
  })

  try {
    await pipeline(got.stream(URL[hash]), lzma.Decompressor(), extract)
  } catch (error) {
    if (error.message !== 'ABORTED_BY_USER') throw error
  }

  const binPath = path.resolve(__dirname, '../bin')

  if (!existsSync(binPath)) mkdirSync(binPath)
  await writeFile(path.join(binPath, 'ffprobe'), buffer, { mode: 0o755 })
}

main().catch(error => console.error(error) || process.exit(1))

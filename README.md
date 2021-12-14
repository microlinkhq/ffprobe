<div align="center">
  <img src="https://cdn.microlink.io/logo/banner.png">
  <br>
  <br>
</div>


![Last version](https://img.shields.io/github/tag/microlinkhq/ffprobe.svg?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/microlinkhq/ffprobe.svg?style=flat-square)](https://coveralls.io/github/microlinkhq/ffprobe)
[![NPM Status](https://img.shields.io/npm/dm/@microlink/ffprobe.svg?style=flat-square)](https://www.npmjs.org/@microlink/ffprobe)

> An always up-to-date static `ffprobe` binary for Node.js.

## Install

```bash
$ npm install @microlink/ffprobe --save
```

## Usage

```js
const { path: ffprobePath } = require('@microlink/ffprobe')
const execa = require('execa')

execa(ffprobePath, ['--version']).then(({ stdout }) => console.log(stdout))
```

## License

**ffprobe** © [microlink.io](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/ffprobe/blob/master/LICENSE.md) License.<br>
Authored and maintained by [microlink.io](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/ffprobe/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlink.io](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)

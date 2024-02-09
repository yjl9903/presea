# presea

[![version](https://img.shields.io/npm/v/presea?label=presea)](https://www.npmjs.com/package/presea) [![CI](https://github.com/yjl9903/presea/actions/workflows/ci.yaml/badge.svg)](https://github.com/yjl9903/presea/actions/workflows/ci.yaml)

An utility function for bundling Node.js single executable applications.

From [Node.js 20](https://nodejs.org/en/blog/announcements/v20-release-announce), it supports Single Executable Applications experimentally. This package integrates the binary bundle steps with [unbuild](https://github.com/unjs/unbuild) following [Single executable applications | Node.js v20.0.0 Document](https://nodejs.org/api/single-executable-applications.html).

## Installation

```bash
npm i -D presea
```

## Usage

```ts
import { bundle } from 'presea'

await bundle('path/to/package')
```

### GitHub Actions

Here is an example GitHub Actions config to bundle single executable applications.

You should replace `<bin>` to your own binary name which is the same as your `package.json` or your build config.

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  bundle:
    name: Bundle on ${{ matrix.target }}

    runs-on: ${{ matrix.os }}

    strategy:
      fail-fast: false
      matrix:
        include:
          - target: linux
            os: ubuntu-latest
            binary: ./dist/<bin>
          - target: windows
            os: windows-latest
            binary: .\dist\<bin>.exe

    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2.2.4

      - name: Setup node
        uses: actions/setup-node@v3
        with:
          node-version: 20.x
          cache: pnpm

      - name: Install
        run: pnpm install

      - name: Build
        run: pnpm build  # now binary is located at matrix.binary

      # Upload to release and so on...
```

### unbuild

> **Warning**
>
> Currently, SEA only supports for a single script, and can not require other node_modules.
>
> But unbuild can not bundle the whole project into a single script.
>
> See [feat: unbuild bundle into a single script](https://github.com/yjl9903/presea/issues/9).

You should provide field `bin` in your `package.json` like the following config.

```JSON
{
  "bin": {
    "hello": "./dist/hello.mjs"
  }
}
```

Import presea preset in your `build.config.ts`.

```ts
// build.config.ts

import { defineBuildConfig } from 'unbuild';

import { Sea } from 'presea/unbuild';

export default defineBuildConfig({
  preset: Sea(),
  // Your config...
});
```

Then, just run `unbuild` and the bundled single executable application is in your output directory.

```bash
$ npx unbuild

$ ./dist/hello world
Hello, world!
```

## Development

+ Clone this repository
+ Use `pnpm` as the package manager (`npm i -g pnpm`)
+ Install dependencies using `pnpm install`
+ Build the module using `pnpm build` or stub the module using `pnpm dev`
+ Test the bundle using `cd example && pnpm i && pnpm build`

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)

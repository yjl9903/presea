# unbuild-sea

[![CI](https://github.com/yjl9903/unbuild-sea/actions/workflows/ci.yaml/badge.svg)](https://github.com/yjl9903/unbuild-sea/actions/workflows/ci.yaml)

An [unbuild](https://github.com/unjs/unbuild) preset for bundling Node single executable applications.

## Installation

```bash
npm i -D unbuild unbuild-sea
```

## Usage

You should provide field `bin` in your `package.json` like the following config.

```JSON
{
  "bin": {
    "hello": "./dist/hello.mjs"
  }
}
```

Import unbuild-sea preset in your `build.config.ts`.

```ts
// build.config.ts

import { defineBuildConfig } from 'unbuild';

import { Sea } from 'unbuild-sea';

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

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)

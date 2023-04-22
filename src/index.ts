import type { BuildContext, BuildPreset } from 'unbuild';

import fs from 'node:fs';
import path from 'node:path';

import type { SeaOptions } from './types';

export type { SeaOptions };

export function Sea(_options: Partial<SeaOptions> = {}): BuildPreset {
  return {
    hooks: {
      async 'build:done'(ctx) {
        const options = await resolveOptions(ctx, _options);
        console.log(options);
      }
    }
  };
}

async function resolveOptions(
  ctx: BuildContext,
  options: Partial<SeaOptions>
): Promise<SeaOptions> {
  const inferred = inferBinary();

  return {
    binary: options.binary ?? inferred?.name ?? 'cli',
    main: options.main ?? inferred?.main ?? ctx.buildEntries[0].path,
    node: options.node ?? process.argv[0]
  };

  function inferBinary() {
    try {
      const p = path.join(ctx.options.rootDir, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (pkg.bin) {
        const [bin] = Object.entries(pkg.bin);
        const name = bin[0];
        const main = bin[1];
        if (name && main && typeof name === 'string' && typeof main === 'string') {
          const mainPath = path.join(ctx.options.rootDir, main);
          if (fs.existsSync(mainPath)) {
            return {
              name,
              main: mainPath
            };
          }
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
}

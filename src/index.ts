import type { BuildContext, BuildPreset } from 'unbuild';

import fs from 'node:fs';
import path from 'node:path';

import { lightRed } from '@breadc/color';

import type { SeaOptions } from './types';

import { bundle } from './bundle';
import { platform } from 'node:os';
import { execa } from 'execa';

export type { SeaOptions };

export function Sea(_options: Partial<SeaOptions> = {}): BuildPreset {
  return {
    hooks: {
      async 'build:done'(ctx) {
        const options = await resolveOptions(ctx, _options);
        if (options) {
          await bundle(options);
        }
      }
    }
  };
}

async function resolveOptions(
  ctx: BuildContext,
  options: Partial<SeaOptions>
): Promise<SeaOptions | undefined> {
  // Disable bundle sea when stub
  if (ctx.options.stub) {
    return undefined;
  }

  const inferred = inferBinary();
  const node = options.node ?? process.argv[0];

  const version = (await execa(node, ['--version'])).stdout;
  const match = /^v(\d+)/.exec(version);
  if (!match || +match[1] < 20) {
    console.log(
      lightRed(`× Your node version ${version} may not support single executable applications`)
    );
    return undefined;
  }

  return {
    binary: options.binary ?? inferred?.name ?? 'cli',
    main: options.main ?? inferred?.main ?? ctx.buildEntries[0].path,
    node,
    sign: false,
    outDir: options.outDir ?? ctx.options.outDir,
    postject: {
      machoSegmentName:
        options.postject?.machoSegmentName ?? platform() === 'darwin' ? 'NODE_SEA' : undefined,
      overwrite: options.postject?.overwrite ?? true,
      sentinelFuse:
        options.postject?.sentinelFuse ?? 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'
    }
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

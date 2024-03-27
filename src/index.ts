import path from 'node:path';
import { platform } from 'node:os';

import { execa } from 'execa';
import { lightRed } from '@breadc/color';

import type { SeaOptions } from './types';

import { inferBinary, bundle as rawBundle } from './bundle';

export type { SeaOptions };

export async function bundle(rootDir: string, options: Partial<Omit<SeaOptions, 'postject'>> = {}) {
  const inferred = inferBinary(rootDir);
  const node = options.node ?? process.argv[0];

  const version = (await execa(node, ['--version'])).stdout;
  const match = /^v(\d+)/.exec(version);
  if (!match || +match[1] < 20) {
    console.log(
      lightRed(`× Your node version ${version} may not support single executable applications`)
    );
    return undefined;
  }

  const main = options.main ?? inferred?.main;
  if (main === undefined) {
    throw new Error('You should provide a script');
  }

  const config: SeaOptions = {
    binary: options.binary ?? inferred?.name ?? 'cli',
    main,
    node,
    sign: options.sign ?? false,
    outDir: options.outDir ?? path.join(rootDir, './dist'),
    warning: options.warning === true ? true : false,
    useSnapshot: options.useSnapshot === true ? true : false,
    useCodeCache: options.useCodeCache === true ? true : false,
    assets: {
      ...options.assets
    },
    postject: {
      machoSegmentName: platform() === 'darwin' ? 'NODE_SEA' : undefined,
      overwrite: true,
      sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'
    }
  };

  return await rawBundle(config);
}

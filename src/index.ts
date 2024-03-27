import path from 'node:path';
import { platform } from 'node:os';

import { execa } from 'execa';
import { lightRed } from '@breadc/color';
import { loadConfig } from 'c12';

import type { SeaOptions } from './types';

import { inferBinary, bundle as rawBundle } from './bundle';

export type { SeaOptions };

export async function bundle(
  rootDir: string,
  options: Partial<Omit<SeaOptions, 'postject'> & { loadConfig: boolean }> = {}
) {
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

  const loaded = options.loadConfig
    ? await loadConfig<Omit<SeaOptions, 'postject'>>({
        cwd: rootDir,
        name: 'presea',
        packageJson: true,
        rcFile: false,
        globalRc: false,
        envName: false
      })
    : undefined;

  const main = options.main ?? loaded?.config?.main ?? inferred?.main;
  if (main === undefined) {
    throw new Error('You should provide a script');
  }

  const outDir = options.outDir
    ? path.resolve(rootDir, options.outDir)
    : loaded?.config?.outDir
    ? path.resolve(loaded?.config?.outDir)
    : path.join(rootDir, './dist');

  const config: SeaOptions = {
    binary: options.binary ?? loaded?.config?.binary ?? inferred?.name ?? 'cli',
    main,
    node,
    outDir,
    sign: options.sign ?? loaded?.config?.sign ?? false,
    warning: (options.warning ?? loaded?.config?.warning) === true ? true : false,
    useSnapshot: (options.useSnapshot ?? loaded?.config?.useSnapshot) === true ? true : false,
    useCodeCache: (options.useCodeCache ?? loaded?.config?.useCodeCache) === true ? true : false,
    assets: {
      ...loaded?.config?.assets,
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

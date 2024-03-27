import fs from 'node:fs';
import path from 'node:path';

import ncc from '@vercel/ncc';
import { rimraf } from 'rimraf';
import { breadc } from 'breadc';

import { version } from '../package.json';

import { bundle } from './index';

const cli = breadc('presea', { version });

cli
  .command('<input>', 'Bundle into single execution')
  .option('--cwd <cwd>', { description: '', cast: (cwd) => cwd ?? process.cwd() })
  .option('--out-dir <dir>', { description: 'Out dir', default: 'dist' })
  .option('--empty-out-dir', { description: '', default: true })
  .action(async (input, options) => {
    const outDir = path.resolve(options.cwd, options.outDir);

    if (options.emptyOutDir) {
      await rimraf(outDir).catch(() => {});
    }

    const { code, assets } = await ncc(path.resolve(options.cwd, input));

    const main = path.resolve(outDir, 'cli.js');
    await fs.promises.mkdir(outDir, { recursive: true }).catch(() => {});
    await fs.promises.writeFile(main, code, 'utf-8');

    const root = options.cwd;
    await bundle(root ?? process.cwd(), { loadConfig: true, main });
  });

cli.run(process.argv.slice(2)).catch((err) => console.error(err));

import { breadc } from 'breadc';

import { version } from '../package.json';

import { bundle } from './index';

const cli = breadc('presea', { version });

cli.command('[root]', 'Bundle into single execution').action(async (root) => {
  await bundle(root ?? process.cwd(), { loadConfig: true });
});

cli.run(process.argv.slice(2)).catch((err) => console.error(err));

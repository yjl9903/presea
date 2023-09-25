import { defineBuildConfig } from 'unbuild';

import { Sea } from '../src/unbuild';

export default defineBuildConfig({
  entries: ['./src/hello'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true
  },
  preset: Sea()
});

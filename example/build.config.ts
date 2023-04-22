import { defineBuildConfig } from 'unbuild';

import { Sea } from '../src/index';

export default defineBuildConfig({
  entries: [
    {
      builder: 'mkdist',
      input: './src',
      outDir: './dist/'
    }
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true
  },
  preset: Sea()
});

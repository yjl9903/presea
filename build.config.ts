import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/cli', 'src/unbuild'],
  declaration: true,
  clean: true,
  externals: ['unbuild'],
  rollup: {
    emitCJS: true
  }
});

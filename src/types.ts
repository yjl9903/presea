export interface SeaOptions {
  binary: string;

  main: string;

  node: string;

  outDir: string;

  sign: boolean;

  postject: {
    machoSegmentName: string | undefined;
    overwrite: boolean;
    sentinelFuse: string;
  };
}

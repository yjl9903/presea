export interface SeaOptions {
  /**
   * The output binary name. By default it is inferred from your package.json.
   */
  binary: string;

  /**
   * The entry point script path of your application. By default it is inferred from your package.json.
   */
  main: string;

  /**
   * Node binary path.
   *
   * You should provide a node executable with version higher than 20.0.0.
   */
  node: string;

  /**
   * Binary output directory.
   *
   * By default it is the same as unbuild context.
   */
  outDir: string;

  /**
   * Enable sign on macOS or Windows.
   */
  sign: boolean;

  /**
   * Enable sea warning
   *
   * @default false
   */
  warning: boolean;

  /**
   * Postject configuration.
   */
  postject: {
    machoSegmentName: string | undefined;
    overwrite: boolean;
    sentinelFuse: string;
  };
}

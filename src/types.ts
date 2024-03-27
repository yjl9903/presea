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
   * @link
   *
   * @default false
   */
  warning: boolean;

  /**
   * @see https://nodejs.org/dist/latest-v20.x/docs/api/single-executable-applications.html#startup-snapshot-support
   *
   * @default false
   */
  useSnapshot: boolean;

  /**
   * @see https://nodejs.org/dist/latest-v20.x/docs/api/single-executable-applications.html#v8-code-cache-support
   *
   * @default false
   */
  useCodeCache: boolean;

  /**
   * @see https://nodejs.org/en/blog/release/v20.12.0#sea-support-embedding-assets
   *
   * @default {}
   */
  assets: Record<string, string>;

  /**
   * Postject configuration.
   */
  postject: {
    machoSegmentName: string | undefined;
    overwrite: boolean;
    sentinelFuse: string;
  };
}

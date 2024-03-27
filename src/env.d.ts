declare module '@vercel/ncc' {
  export default (inputFile: string, options?: {}) =>
    new Promise<{ code: string; assets: Record<string, { source: string }> }>();
}

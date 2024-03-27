import type { SeaOptions } from './types';

import fs from 'node:fs';
import path from 'node:path';
import { platform } from 'node:os';

import { execa } from 'execa';
// @ts-expect-error
import { inject } from 'postject';
import { cyan, lightGreen } from '@breadc/color';

export function inferBinary(root: string) {
  try {
    const p = path.join(root, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(p, 'utf-8'));
    if (pkg.bin) {
      const [bin] = Object.entries(pkg.bin);
      const name = bin[0];
      const main = bin[1];
      if (name && main && typeof name === 'string' && typeof main === 'string') {
        const mainPath = path.join(root, main);
        if (fs.existsSync(mainPath)) {
          return {
            name,
            main: mainPath
          };
        }
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function bundle(options: SeaOptions) {
  // Split logs
  console.log();

  // Generate sea-config.json
  const seaConfig = makeSeaConfig(options);

  try {
    // Generate the blob to be injected
    await execa(options.node, ['--experimental-sea-config', seaConfig.file])
      .pipeStdout?.(process.stdout)
      .pipeStderr?.(process.stderr);

    // Create a copy of the node executable
    const execPath = copyNodeExecutable(options);

    try {
      console.log(cyan(`ℹ Bundling ${options.binary} (Path: ${execPath})`));

      // Remove the signature of the binary
      if (options.sign) {
        await removeSignature(execPath);
      }

      // Inject the blob into the copied binary
      await injectBlob(options, seaConfig, execPath);

      // Sign the binary
      if (options.sign) {
        await addSignature(execPath);
      }

      console.log(
        lightGreen(
          `✔ Single executable application bundle succeeded for ${path.basename(options.binary)}`
        )
      );
      const size = fs.statSync(execPath).size;
      console.log(`Σ Binary size: ${cyan(formatSize(size))}`);
    } catch (error) {
      console.error(error);
      fs.rmSync(execPath);
    }
  } catch (error) {
    console.error(error);
  } finally {
    fs.rmSync(seaConfig.file);
  }
}

function makeSeaConfig(options: SeaOptions) {
  const file = path.join(options.outDir, 'sea-config.json');
  const config = {
    main: options.main,
    output: path.join(options.outDir, 'sea-prep.blob'),
    disableExperimentalSEAWarning: !options.warning,
    useSnapshot: options.useSnapshot,
    useCodeCache: options.useCodeCache,
    assets: options.assets
  };

  fs.writeFileSync(file, JSON.stringify(config, null, 2), 'utf-8');

  return {
    file,
    config
  };
}

function copyNodeExecutable(options: SeaOptions) {
  const binary = platform() === 'win32' ? ensureSuffix(options.binary, '.exe') : options.binary;
  const execPath = path.join(options.outDir, binary);
  if (fs.existsSync(execPath)) {
    fs.rmSync(execPath);
  }
  fs.copyFileSync(options.node, execPath);
  return execPath;

  function ensureSuffix(p: string, suf: string) {
    if (p.endsWith(suf)) {
      return p;
    } else {
      return p + suf;
    }
  }
}

async function removeSignature(execPath: string) {
  if (platform() === 'darwin') {
    await execa('codesign', ['--remove-signature', execPath])
      .pipeStdout?.(process.stdout)
      .pipeStderr?.(process.stderr);
  } else if (platform() === 'win32') {
    try {
      await execa('signtool', ['remove', '/s', execPath])
        .pipeStdout?.(process.stdout)
        .pipeStderr?.(process.stderr);
    } catch {}
  }
}

async function injectBlob(
  options: SeaOptions,
  seaConfig: ReturnType<typeof makeSeaConfig>,
  execPath: string
) {
  let resourceData: Buffer;
  const resource = seaConfig.config.output;
  try {
    await fs.promises.access(resource, fs.constants.R_OK);
    resourceData = fs.readFileSync(resource);
  } catch {
    throw new Error(`Can't read resource file ${resource}`);
  }

  await inject(execPath, 'NODE_SEA_BLOB', resourceData, {
    machoSegmentName: options.postject.machoSegmentName,
    overwrite: options.postject.overwrite,
    sentinelFuse: options.postject.sentinelFuse
  });
}

async function addSignature(execPath: string) {
  if (platform() === 'darwin') {
    await execa('codesign', ['--sign', '-', execPath])
      .pipeStdout?.(process.stdout)
      .pipeStderr?.(process.stderr);
  } else if (platform() === 'win32') {
    try {
      await execa('signtool', ['sign', '/fd', 'SHA256', execPath])
        .pipeStdout?.(process.stdout)
        .pipeStderr?.(process.stderr);
    } catch {}
  }
}

function formatSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

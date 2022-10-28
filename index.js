import url from 'url';
import esbuild from 'esbuild';
import { promises as fs } from 'fs';

function isPackageModule(moduleUrl) {
  return moduleUrl.includes('/node_modules/');
}

function isJsModule(moduleUrl) {
  return /\.m?jsx?$/i.test(moduleUrl);
}

async function transform(source, filePath) {
  const { code } = await esbuild.transform(source, {
    loader: 'jsx',
    format: 'esm',
    target: 'esnext',
    sourcemap: 'inline',
    sourcefile: filePath
  });

  return code;
}

// Node < v16.12.0:
export async function transformSource(source, context) {
  if (!isJsModule(context.url) || isPackageModule(context.url)) {
    return { source };
  }

  const result = await transform(source.toString(), url.fileURLToPath(context.url));

  return { source: result };
}

// Node >= v16.12.0:
export async function load(sourceUrl, context, defaultLoad) {
  if (!isJsModule(sourceUrl) || isPackageModule(sourceUrl)) {
    return defaultLoad(sourceUrl, context, defaultLoad)
  }

  const filename = url.fileURLToPath(sourceUrl);
  const rawSource = await fs.readFile(filename, 'utf8');
  const result = await transform(rawSource, filename);

  return { format: 'module', source: result, shortCircuit: true };
}

// Export a jest compatible transform as the default export:
export default {
  processAsync: transform
};

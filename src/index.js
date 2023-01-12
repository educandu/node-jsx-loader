import url from 'url';
import esbuild from 'esbuild';
import { promises as fs } from 'fs';

function isPackageModule(moduleUrl) {
  return moduleUrl.includes('/node_modules/');
}

function isJsModule(moduleUrl) {
  return (/\.m?jsx?$/i).test(moduleUrl);
}

export async function load(sourceUrl, context, defaultLoad) {
  if (!isJsModule(sourceUrl) || isPackageModule(sourceUrl)) {
    return defaultLoad(sourceUrl, context, defaultLoad);
  }

  const filename = url.fileURLToPath(sourceUrl);
  const rawSource = await fs.readFile(filename, 'utf8');
  const { code } = await esbuild.transform(rawSource, {
    loader: 'jsx',
    format: 'esm',
    target: 'esnext',
    sourcemap: 'inline',
    sourcefile: filename
  });

  return { format: 'module', source: code, shortCircuit: true };
}

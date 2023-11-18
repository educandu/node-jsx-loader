import url from 'node:url';
import { promises as fs } from 'node:fs';
import esbuild from 'esbuild';

const LOADERS = ['css', 'js', 'json', 'jsx', 'ts', 'tsx'];
const LOADER_TO_JS = ['cjs', 'mjs'];
const LOADER_TO_TS = ['cts', 'mts'];

const isPackageModule = moduleUrl => moduleUrl.includes('/node_modules/');

const isJsModule = moduleUrl => (/\.m?[jt]sx?$/i).test(moduleUrl);

/**
 * This function is used to determine the loader for a given module.
 * For example if a loaded jsx file calls `import './styles.css'` then
 * the css loader will be used to load the css file.
 * Also, if the jsx call hook in js file, the js loader will be used to load the js file.
 */
function getLoader(moduleUrl) {
  const loader = moduleUrl.split('.').pop();
  if (LOADERS.includes(loader)) {
    if (LOADER_TO_JS.includes(loader)) {
      return 'js';
    }
    if (LOADER_TO_TS.includes(loader)) {
      return 'ts';
    }
    return loader;
  }
  throw new Error(`Unknown loader for ${moduleUrl}`);
}

/**
 * This function is used to determine the format for a given module.
 * @param {string} moduleUrl
 * @returns {'cjs' | 'esm'}
 */
function getFormat(moduleUrl) {
  const loader = moduleUrl.split('.').pop();
  if (LOADER_TO_JS.includes(loader)) {
    return 'cjs';
  }
  if (LOADER_TO_TS.includes(loader)) {
    return 'esm';
  }
  return 'esm';
}

/**
 * This is the main function for `experimental-loader`
 */
export async function load(sourceUrl, context, defaultLoad) {
  if (!isJsModule(sourceUrl) || isPackageModule(sourceUrl)) {
    return defaultLoad(sourceUrl, context, defaultLoad);
  }

  const filename = url.fileURLToPath(sourceUrl);
  const rawSource = await fs.readFile(filename, 'utf8');
  const loader = getLoader(filename);
  const format = getFormat(filename);

  const { code } = await esbuild.transform(rawSource, {
    loader,
    format,
    target: 'esnext',
    sourcemap: 'inline',
    sourcefile: filename
  });

  return { format: 'module', source: code, shortCircuit: true };
}

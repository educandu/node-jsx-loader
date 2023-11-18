import url from 'node:url';
import { promises as fs } from 'node:fs';
import esbuild from 'esbuild';

const isPackageModule = moduleUrl => moduleUrl.includes('/node_modules/');

const isJsModule = moduleUrl => (/\.m?[jt]sx?$/i).test(moduleUrl);

const isTypeScriptModule = moduleUrl => (/\.tsx?$/i).test(moduleUrl);

export async function load(sourceUrl, context, defaultLoad) {
  if (!isJsModule(sourceUrl) || isPackageModule(sourceUrl)) {
    return defaultLoad(sourceUrl, context, defaultLoad);
  }

  const filename = url.fileURLToPath(sourceUrl);
  const rawSource = await fs.readFile(filename, 'utf8');
  const { code } = await esbuild.transform(rawSource, {
    loader: isTypeScriptModule(sourceUrl) ? 'tsx' : 'jsx',
    format: 'esm',
    target: 'esnext',
    sourcemap: 'inline',
    sourcefile: filename
  });

  return { format: 'module', source: code, shortCircuit: true };
}

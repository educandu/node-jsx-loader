import url from 'url';
import esbuild from 'esbuild';

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

// Export a node compatible transform function:
export async function transformSource(source, context) {
  if (!isJsModule(context.url) || isPackageModule(context.url)) {
    return { source };
  }

  const result = await transform(source.toString(), url.fileURLToPath(context.url));

  return { source: result };
}

// Export a jest compatible transform as the default export:
export default {
  processAsync: transform
};

import esbuild from 'esbuild';

function isPackageModule(moduleUrl) {
  return moduleUrl.includes('/node_modules/');
}

function isJsModule(moduleUrl) {
  return /\.m?jsx?$/i.test(moduleUrl);
}

// eslint-disable-next-line no-unused-vars
export async function transformSource(source, context, _defaultGetSource) {
  if (!isJsModule(context.url) || isPackageModule(context.url)) {
    return { source };
  }

  const transformOptions = {
    loader: 'jsx',
    format: 'esm',
    target: 'esnext',
    sourcemap: 'inline'
  };

  const { code } = await esbuild.transform(source.toString(), transformOptions);

  return { source: code };
}

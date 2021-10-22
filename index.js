import url from 'url';
import swc from '@swc/core';

function isPackageModule(moduleUrl) {
  return moduleUrl.includes('/node_modules/');
}

function isJsonFile(moduleUrl) {
  return moduleUrl.endsWith('.json');
}

// eslint-disable-next-line no-unused-vars
export async function transformSource(source, context, _defaultGetSource) {
  const filename = url.fileURLToPath(context.url);

  if (isPackageModule(context.url) || isJsonFile(context.url)) {
    return { source };
  }

  const transformOptions = {
    configFile: false,
    isModule: true,
    swcrc: false,
    filename,
    jsc: {
      parser: {
        syntax: 'ecmascript',
        jsx: true
      },
      target: 'es2021',
      keepClassNames: true
    },
    module: {
      type: 'es6',
      strict: true,
      strictMode: false,
      noInterop: true,
      ignoreDynamic: true
    },
    sourceMaps: 'inline',
    inlineSourcesContent: true
  };

  const { code } = await swc.transform(source.toString(), transformOptions);

  return { source: code };
}

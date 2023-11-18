import { load } from './index.js';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { assert, createSandbox } from 'sinon';
import { beforeEach, describe, expect, it } from 'vitest';

const loaderFilePath = fileURLToPath(new URL('./index.js', import.meta.url).href);
const jsxTestFileUrl = new URL('./test-files/test-file.jsx', import.meta.url).href;
const outputTestFilePath = fileURLToPath(new URL('./test-files/test-file-with-output.js', import.meta.url).href);

describe('index', () => {
  const sandbox = createSandbox();

  describe('when used as a node loader', () => {
    let output;

    beforeEach(async () => {
      const { stdout } = await promisify(execFile)('node', ['--loader', loaderFilePath, outputTestFilePath]);
      output = stdout.trim();
    });

    it('should run the node process correctly', () => {
      expect(output).toBe('Hello World!');
    });
  });

  describe('when calling `load` directly', () => {
    let defaultLoad;

    beforeEach(() => {
      defaultLoad = sandbox.fake(() => ({ source: 'original' }));
    });

    describe('when called with a JSON file extension', () => {
      it('should not transform it', async () => {
        const { source } = await load('file:///my-module.json', {}, defaultLoad);
        expect(source).toBe('original');
        assert.calledOnce(defaultLoad);
      });
    });
    describe('when called with a module from node_modules', () => {
      it('should not transform it', async () => {
        const { source } = await load('file:///my-project/node_modules/my-module.js', {}, defaultLoad);
        expect(source).toBe('original');
        assert.calledOnce(defaultLoad);
      });
    });
    describe('when called with a local module containing JSX', () => {
      it('should return format "module"', async () => {
        const { format } = await load(jsxTestFileUrl, {}, defaultLoad);
        expect(format).toBe('module');
      });
      it('should transform it to Javascript', async () => {
        const { source } = await load(jsxTestFileUrl, {}, defaultLoad);
        expect(source.toString()).toContain('React.createElement("p", null, "Hello World")');
      });
      it('should write a source map', async () => {
        const { source } = await load(jsxTestFileUrl, {}, defaultLoad);
        expect(source.toString()).toContain('//# sourceMappingURL=');
      });
    });
  });

});

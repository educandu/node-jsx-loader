import fs from 'fs';
import url from 'url';
import sinon from 'sinon';
import jestTransform, { transformSource, load } from './index.js';

const testFileUrl = new URL('./test-file.jsx', import.meta.url).href;
const testFilePath = url.fileURLToPath(testFileUrl);
const testFileContent = fs.readFileSync(testFilePath, 'utf8');

describe('jestTransform.processAsync', () => {
  describe('when called with a local module containing JSX', () => {
    it('should transform it to Javascript', async () => {
      const result = await jestTransform.processAsync(testFileContent, '/app/my-project/my-module.js');
      expect(result).toContain('React.createElement("p", null, "Hello World")');
    });
    it('should write a source map', async () => {
      const result = await jestTransform.processAsync(testFileContent, '/app/my-project/my-module.js');
      expect(result).toContain('//# sourceMappingURL=');
    });
  });
});

describe('transformSource', () => {
  describe('when called with a JSON file extension', () => {
    it('should not transform it', async () => {
      const { source } = await transformSource(Buffer.from(testFileContent), { url: 'file:///my-module.jSoN' });
      expect(source.toString()).toBe(testFileContent);
    });
  });
  describe('when called with a module from node_modules', () => {
    it('should not transform it', async () => {
      const { source } = await transformSource(Buffer.from(testFileContent), { url: 'file:///my-project/node_modules/my-module.js' });
      expect(source.toString()).toBe(testFileContent);
    });
  });
  describe('when called with a local module containing JSX', () => {
    it('should transform it to Javascript', async () => {
      const { source } = await transformSource(Buffer.from(testFileContent), { url: 'file:///my-project/my-module.js' });
      expect(source.toString()).toContain('React.createElement("p", null, "Hello World")');
    });
    it('should write a source map', async () => {
      const { source } = await transformSource(Buffer.from(testFileContent), { url: 'file:///my-project/my-module.js' });
      expect(source.toString()).toContain('//# sourceMappingURL=');
    });
  });
});

describe('load', () => {
  let defaultLoad;

  beforeEach(() => {
    defaultLoad = sinon.fake(() => ({ source: 'original' }));
  });

  describe('when called with a JSON file extension', () => {
    it('should not transform it', async () => {
      const { source } = await load('file:///my-module.jSoN', {}, defaultLoad);
      expect(source).toBe('original')
      sinon.assert.calledOnce(defaultLoad);
    });
  });
  describe('when called with a module from node_modules', () => {
    it('should not transform it', async () => {
      const { source } = await load('file:///my-project/node_modules/my-module.js', {}, defaultLoad);
      expect(source).toBe('original')
      sinon.assert.calledOnce(defaultLoad);
    });
  });
  describe('when called with a local module containing JSX', () => {
    it('should return format "module"', async () => {
      const { format } = await load(testFileUrl, {}, defaultLoad);
      expect(format).toBe('module');
    });
    it('should transform it to Javascript', async () => {
      const { source } = await load(testFileUrl, {}, defaultLoad);
      expect(source.toString()).toContain('React.createElement("p", null, "Hello World")');
    });
    it('should write a source map', async () => {
      const { source } = await load(testFileUrl, {}, defaultLoad);
      expect(source.toString()).toContain('//# sourceMappingURL=');
    });
  });
});

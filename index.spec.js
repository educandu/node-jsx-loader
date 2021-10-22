import { transformSource } from './index.js';

const someJsx = `
import React from 'react';

export default function MyComponent() {
  return (
    <p>Hello World</p>
  );
}
`;

describe('transformSource', () => {
  describe('when called with a JSON file extension', () => {
    it('should not transform it', async () => {
      const { source } = await transformSource(Buffer.from(someJsx), { url: 'file:///my-module.json' });
      expect(source.toString()).toBe(someJsx);
    });
  });
  describe('when called with a module from node_modules', () => {
    it('should not transform it', async () => {
      const { source } = await transformSource(Buffer.from(someJsx), { url: 'file:///my-project/node_modules/my-module.js' });
      expect(source.toString()).toBe(someJsx);
    });
  });
  describe('when called with a local module containing JSX', () => {
    it('should transform it to Javascript', async () => {
      const { source } = await transformSource(Buffer.from(someJsx), { url: 'file:///my-project/my-module.js' });
      expect(source.toString()).toContain('React.createElement("p", null, "Hello World"));');
    });
    it('should write a source map', async () => {
      const { source } = await transformSource(Buffer.from(someJsx), { url: 'file:///my-project/my-module.js' });
      expect(source.toString()).toContain('//# sourceMappingURL=');
    });
  });
});

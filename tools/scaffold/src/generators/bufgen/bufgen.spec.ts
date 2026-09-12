import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { initBufgenGenerator } from './bufgen.js';
import { InitBufgenGeneratorSchema } from './schema.js';

describe('bufgen generator', () => {
  let tree: Tree;
  const options: InitBufgenGeneratorSchema = {
    repoNamespace: 'testns',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    license: 'MIT',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await initBufgenGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'testns-bufgen');
    expect(config).toBeDefined();
  });
});

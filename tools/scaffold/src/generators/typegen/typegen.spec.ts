import { readProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import type { InitTypegenGeneratorSchema } from './schema.js';
import { initTypegenGenerator } from './typegen.js';

describe('typegen generator', () => {
  let tree: Tree;
  const options: InitTypegenGeneratorSchema = {
    repoNamespace: 'testns',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await initTypegenGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'testns-typegen');
    expect(config).toBeDefined();
  });
});

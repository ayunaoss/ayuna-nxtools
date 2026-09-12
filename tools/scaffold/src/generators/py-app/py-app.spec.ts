import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { pyAppGenerator } from './py-app.js';
import { PyAppGeneratorSchema } from './schema.js';

describe('py-app generator', () => {
  let tree: Tree;
  const options: PyAppGeneratorSchema = {
    name: 'test',
    repoNamespace: 'test-namespace',
    authorName: 'Test Author',
    authorEmail: 'author@test.com',
    summary: 'Test summary',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await pyAppGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test-namespace-test');
    expect(config).toBeDefined();
  });
});

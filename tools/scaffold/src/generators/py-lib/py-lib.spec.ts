import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { pyLibGenerator } from './py-lib.js';
import { PyLibGeneratorSchema } from './schema.js';

describe('py-lib generator', () => {
  let tree: Tree;
  const options: PyLibGeneratorSchema = {
    name: 'test',
    repoNamespace: 'test-namespace',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    summary: 'This is a test Python library',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await pyLibGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test-namespace-test');
    expect(config).toBeDefined();
  });
});

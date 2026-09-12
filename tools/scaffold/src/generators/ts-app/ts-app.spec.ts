import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { tsAppGenerator } from './ts-app.js';
import { TsAppGeneratorSchema } from './schema.js';

describe('ts-app generator', () => {
  let tree: Tree;
  const options: TsAppGeneratorSchema = {
    name: 'test',
    repoNamespace: 'test-namespace',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    summary: 'This is a test TypeScript application',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await tsAppGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test-namespace-test');
    expect(config).toBeDefined();
  });
});

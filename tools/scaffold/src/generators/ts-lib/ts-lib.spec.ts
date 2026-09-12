import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { tsLibGenerator } from './ts-lib.js';
import { TsLibGeneratorSchema } from './schema.js';

describe('ts-lib generator', () => {
  let tree: Tree;
  const options: TsLibGeneratorSchema = {
    name: 'test',
    repoNamespace: 'test-namespace',
    authorName: 'Test Author',
    authorEmail: 'test@example.com',
    summary: 'This is a test TypeScript library',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await tsLibGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test-namespace-test');
    expect(config).toBeDefined();
  });
});

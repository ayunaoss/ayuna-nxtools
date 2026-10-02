import { readProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { goLibGenerator } from './go-lib.js';
import type { GoLibGeneratorSchema } from './schema.js';

describe('go-lib generator', () => {
  let tree: Tree;
  const options: GoLibGeneratorSchema = {
    repoNamespace: 'acme',
    name: 'test',
    modulePrefix: 'github.com/org/source',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await goLibGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});

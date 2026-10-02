import { readProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { goAppGenerator } from './go-app.js';
import type { GoAppGeneratorSchema } from './schema.js';

describe('go-app generator', () => {
  let tree: Tree;
  const options: GoAppGeneratorSchema = {
    repoNamespace: 'acme',
    name: 'test',
    modulePrefix: 'github.com/org/source',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await goAppGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});

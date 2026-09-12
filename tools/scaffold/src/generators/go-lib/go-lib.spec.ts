import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { goLibGenerator } from './go-lib.js';
import { GoLibGeneratorSchema } from './schema.js';

describe('go-lib generator', () => {
  let tree: Tree;
  const options: GoLibGeneratorSchema = {
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

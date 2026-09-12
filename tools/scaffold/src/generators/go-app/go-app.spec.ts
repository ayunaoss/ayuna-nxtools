import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { goAppGenerator } from './go-app.js';
import { GoAppGeneratorSchema } from './schema.js';

describe('go-app generator', () => {
  let tree: Tree;
  const options: GoAppGeneratorSchema = {
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

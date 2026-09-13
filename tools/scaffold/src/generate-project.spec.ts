import {
  readProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { initBufgenGenerator } from './generators/bufgen/bufgen.js';
import { goAppGenerator } from './generators/go-app/go-app.js';
import { goLibGenerator } from './generators/go-lib/go-lib.js';
import { pyAppGenerator } from './generators/py-app/py-app.js';
import { pyLibGenerator } from './generators/py-lib/py-lib.js';
import { tsAppGenerator } from './generators/ts-app/ts-app.js';
import { tsLibGenerator } from './generators/ts-lib/ts-lib.js';

describe('Generate a project', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write(
      'package.json',
      JSON.stringify({ name: '@acme/workspace', description: 'Test workspace' }),
    );
    tree.write('pnpm-workspace.yaml', 'packages: []\n');
  });

  it('creates the documented bufgen, library, and application projects', async () => {
    await initBufgenGenerator(tree, {
      repoNamespace: 'acme',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
      license: 'MIT',
    });
    await goLibGenerator(tree, {
      name: 'go-library',
      modulePrefix: 'github.com/acme/workspace',
    });
    await goAppGenerator(tree, {
      name: 'go-app',
      modulePrefix: 'github.com/acme/workspace',
    });
    await pyLibGenerator(tree, {
      name: 'py-library',
      repoNamespace: 'acme',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
    });
    await pyAppGenerator(tree, {
      name: 'py-app',
      repoNamespace: 'acme',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
    });
    await tsLibGenerator(tree, {
      name: 'ts-library',
      repoNamespace: 'acme',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
    });
    await tsAppGenerator(tree, {
      name: 'ts-app',
      repoNamespace: 'acme',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
    });

    expect(readProjectConfiguration(tree, 'acme-bufgen').targets?.codegen)
      .toMatchObject({ executor: '@ayunaio/scaffold:codegen-proto' });
    expect(readProjectConfiguration(tree, 'go-library')).toMatchObject({
      root: 'libs/go/go-library',
      projectType: 'library',
    });
    expect(readProjectConfiguration(tree, 'go-app')).toMatchObject({
      root: 'apps/go/go-app',
      projectType: 'application',
    });
    expect(readProjectConfiguration(tree, 'acme-py-library')).toMatchObject({
      root: 'libs/py/acme-py-library',
      projectType: 'library',
    });
    expect(readProjectConfiguration(tree, 'acme-py-app')).toMatchObject({
      root: 'apps/py/acme-py-app',
      projectType: 'application',
    });
    expect(readProjectConfiguration(tree, 'acme-ts-library')).toMatchObject({
      root: 'libs/ts/acme-ts-library',
      projectType: 'library',
    });
    expect(readProjectConfiguration(tree, 'acme-ts-app')).toMatchObject({
      root: 'apps/ts/acme-ts-app',
      projectType: 'application',
    });

    for (const path of [
      'bufgen/buf.yaml',
      'bufgen/go/go.mod',
      'bufgen/py/pyproject.toml',
      'bufgen/ts/package.json',
      'libs/go/go-library/go.mod',
      'apps/go/go-app/go.mod',
      'libs/py/acme-py-library/pyproject.toml',
      'apps/py/acme-py-app/pyproject.toml',
      'libs/ts/acme-ts-library/package.json',
      'apps/ts/acme-ts-app/package.json',
    ]) {
      expect(tree.exists(path)).toBe(true);
    }

    const goWork = tree.read('go.work', 'utf-8');
    expect(goWork).toContain('./bufgen/go');
    expect(goWork).toContain('./libs/go/go-library');
    expect(goWork).toContain('./apps/go/go-app');

    const pyproject = tree.read('pyproject.toml', 'utf-8');
    expect(pyproject).toContain('bufgen/py');
    expect(pyproject).toContain('libs/py/acme-py-library');
    expect(pyproject).toContain('apps/py/acme-py-app');

    const pnpmWorkspace = tree.read('pnpm-workspace.yaml', 'utf-8');
    expect(pnpmWorkspace).toContain('bufgen/ts');
    expect(pnpmWorkspace).toContain('libs/ts/acme-ts-library');
    expect(pnpmWorkspace).toContain('apps/ts/acme-ts-app');
  });
});

import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  type Tree,
} from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TsAppGeneratorSchema } from './schema.js';
import { updatePnpmWorkspace } from '../../utils.js';

const generatorDirectory = dirname(fileURLToPath(import.meta.url));

export async function tsAppGenerator(
  tree: Tree,
  options: TsAppGeneratorSchema,
) {
  const resolvedNames = names(options.name);
  const resolvedNs = names(options.repoNamespace);

  const projectName = `${resolvedNs.fileName}-${resolvedNames.fileName}`;
  const projectRoot = `apps/ts/${projectName}`;

  addProjectConfiguration(tree, projectName, {
    root: projectRoot,
    projectType: 'application',
    sourceRoot: projectRoot,
    targets: {
      build: {
        executor: 'nx:run-commands',
        options: {
          command: `pnpm run build`,
          cwd: projectRoot,
        },
      },
      lint: {
        executor: 'nx:run-commands',
        options: {
          command: `oxlint src`,
          cwd: projectRoot,
        },
      },
      test: {
        executor: 'nx:run-commands',
        options: {
          command: `pnpm run test`,
          cwd: projectRoot,
        },
      },
    },
  });

  generateFiles(tree, join(generatorDirectory, 'files'), projectRoot, {
    name: resolvedNames.fileName,
    namePropertyName: resolvedNames.propertyName,
    projectName,
    repoNamespace: resolvedNs.fileName,
    authorName: options.authorName,
    authorEmail: options.authorEmail,
    summary: options.summary ?? 'My sample TypeScript application',
    tmpl: '',
  });

  updatePnpmWorkspace(tree, projectRoot);
  await formatFiles(tree);
}

export default tsAppGenerator;

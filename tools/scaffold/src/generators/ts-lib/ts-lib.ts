import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addProjectConfiguration, formatFiles, generateFiles, names, type Tree } from '@nx/devkit';
import { updatePnpmWorkspace } from '../../utils.js';
import type { TsLibGeneratorSchema } from './schema.js';

const generatorDirectory = dirname(fileURLToPath(import.meta.url));

export async function tsLibGenerator(tree: Tree, options: TsLibGeneratorSchema) {
  const resolvedNames = names(options.name);
  const resolvedNs = names(options.repoNamespace);

  const projectName = `${resolvedNs.fileName}-${resolvedNames.fileName}`;
  const projectRoot = `libs/ts/${projectName}`;

  addProjectConfiguration(tree, projectName, {
    root: projectRoot,
    projectType: 'library',
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
          command: `biome check src`,
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
    nameClass: resolvedNames.className,
    namePropertyName: resolvedNames.propertyName,
    projectName,
    repoNamespace: resolvedNs.fileName,
    repoNamespaceClass: resolvedNs.className,
    authorName: options.authorName,
    authorEmail: options.authorEmail,
    summary: options.summary ?? 'My sample TypeScript library',
    tmpl: '',
  });

  updatePnpmWorkspace(tree, projectRoot);
  await formatFiles(tree);
}

export default tsLibGenerator;

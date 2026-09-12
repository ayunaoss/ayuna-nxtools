import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  type Tree,
} from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PyLibGeneratorSchema } from './schema.js';
import { updateRootPyProjectToml } from '../../utils.js';

const generatorDirectory = dirname(fileURLToPath(import.meta.url));

export async function pyLibGenerator(
  tree: Tree,
  options: PyLibGeneratorSchema,
) {
  const resolvedNames = names(options.name);
  const resolvedNs = names(options.repoNamespace);

  const projectName = `${resolvedNs.fileName}-${resolvedNames.fileName}`;
  const projectRoot = `libs/py/${projectName}`;

  addProjectConfiguration(tree, projectName, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: projectRoot,
    targets: {
      build: {
        executor: 'nx:run-commands',
        options: {
          command: `uv sync --active --all-groups`,
          cwd: projectRoot,
        },
      },
    },
  });

  generateFiles(tree, join(generatorDirectory, 'files'), projectRoot, {
    name: resolvedNames.fileName,
    projectName: projectName,
    projectNameClass: resolvedNames.className,
    projectNameSnake: projectName.replace(/-/g, '_'),
    repoNamespace: resolvedNs.fileName,
    repoNamespaceClass: resolvedNs.className,
    authorName: options.authorName,
    authorEmail: options.authorEmail,
    summary: options.summary,
    tmpl: '',
  });

  updateRootPyProjectToml(tree, projectRoot, projectName);
  await formatFiles(tree);
}

export default pyLibGenerator;

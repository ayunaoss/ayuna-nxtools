import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addProjectConfiguration, formatFiles, generateFiles, names, type Tree } from '@nx/devkit';
import type { InitTypegenGeneratorSchema } from './schema.js';

const generatorDirectory = dirname(fileURLToPath(import.meta.url));

export async function initTypegenGenerator(tree: Tree, options: InitTypegenGeneratorSchema) {
  const resolvedNs = names(options.repoNamespace);
  const goModPrefix = options.goModPrefix ?? 'github.com/org/project';
  const goModulePath = `${goModPrefix}/libs/go/gotypes`;

  addProjectConfiguration(tree, `${resolvedNs.fileName}-typegen`, {
    root: 'typegen',
    sourceRoot: 'typegen',
    projectType: 'library',
    targets: {
      build: {
        executor: 'nx:run-commands',
        options: {
          command: 'echo -e "Build is just a placeholder"',
          cwd: 'typegen',
        },
      },
    },
  });

  generateFiles(tree, join(generatorDirectory, 'files'), 'typegen', {
    goModulePath,
    goModPrefix,
    repoNamespace: resolvedNs.fileName,
    repoNamespaceClass: resolvedNs.className,
    authorName: options.authorName,
    authorEmail: options.authorEmail,
    tmpl: '',
  });

  await formatFiles(tree);
}

export default initTypegenGenerator;

import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  type Tree,
} from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { InitBufgenGeneratorSchema } from './schema.js';
import {
  updateGoWork,
  updateRootPyProjectToml,
  updatePnpmWorkspace,
} from '../../utils.js';

const generatorDirectory = dirname(fileURLToPath(import.meta.url));

export async function initBufgenGenerator(
  tree: Tree,
  options: InitBufgenGeneratorSchema,
) {
  const resolvedNs = names(options.repoNamespace);
  const goModPrefix = options.goModPrefix ?? 'github.com/org/project';
  const goModulePath = `${goModPrefix}/bufgen/go`;

  addProjectConfiguration(tree, `${resolvedNs.fileName}-bufgen`, {
    root: 'bufgen',
    sourceRoot: 'bufgen',
    projectType: 'library',
    targets: {
      build: {
        executor: 'nx:run-commands',
        options: {
          command:
            'echo -e "Try running one of codegen|codepurge|bufsync|gosync|pysync|tssync instead."',
          cwd: 'bufgen',
        },
      },
      codegen: {
        executor: '@ayunaio/scaffold:codegen-proto',
      },
      codepurge: {
        executor: '@ayunaio/scaffold:codepurge-proto',
      },
      bufsync: {
        executor: 'nx:run-commands',
        options: {
          command: 'buf dep update',
          cwd: 'bufgen',
        },
      },
      gosync: {
        executor: 'nx:run-commands',
        options: {
          command: 'go mod tidy && go build -v ./...',
          cwd: 'bufgen/go',
        },
      },
      pysync: {
        executor: 'nx:run-commands',
        options: {
          command: 'uv sync --active --all-groups',
          cwd: 'bufgen/py',
        },
      },
      tssync: {
        executor: 'nx:run-commands',
        options: {
          command: 'pnpm install && pnpm run build',
          cwd: 'bufgen/ts',
        },
      },
    },
  });

  generateFiles(tree, join(generatorDirectory, 'files'), 'bufgen', {
    goModulePath,
    goModPrefix,
    repoNamespace: resolvedNs.fileName,
    repoNamespaceClass: resolvedNs.className,
    authorName: options.authorName,
    authorEmail: options.authorEmail,
    license: options.license,
    tmpl: '',
  });

  updateGoWork(tree, 'bufgen/go');
  updateRootPyProjectToml(tree, 'bufgen/py', `${resolvedNs.fileName}-bufgen`);
  updatePnpmWorkspace(tree, 'bufgen/ts');
  await formatFiles(tree);
}

export default initBufgenGenerator;

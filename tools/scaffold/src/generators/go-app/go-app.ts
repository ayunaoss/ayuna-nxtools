import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  type Tree,
} from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GoAppGeneratorSchema } from './schema.js';
import { updateGoWork } from '../../utils.js';

const generatorDirectory = dirname(fileURLToPath(import.meta.url));

export async function goAppGenerator(
  tree: Tree,
  options: GoAppGeneratorSchema,
) {
  const resolvedNames = names(options.name);
  const projectRoot = `apps/go/${resolvedNames.fileName}`;

  // Construct the module path for the Go application
  const prefix = options.modulePrefix ?? 'github.com/org/project';
  const modulePath = `${prefix}/${projectRoot}`;

  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    sourceRoot: projectRoot,
    projectType: 'application',
    targets: {
      build: {
        executor: 'nx:run-commands',
        options: {
          command: `go mod tidy && go build -v ./...`,
          cwd: projectRoot,
        },
      },
      test: {
        executor: 'nx:run-commands',
        options: {
          command: `go test -v -race ./...`,
          cwd: projectRoot,
        },
      },
      lint: {
        executor: 'nx:run-commands',
        options: {
          command: `golangci-lint run`,
          cwd: projectRoot,
        },
      },
    },
  });

  generateFiles(tree, join(generatorDirectory, 'files'), projectRoot, {
    name: resolvedNames.fileName,
    modulePrefix: prefix,
    modulePath,
    tmpl: '',
  });

  updateGoWork(tree, projectRoot);
  await formatFiles(tree);
}

export default goAppGenerator;

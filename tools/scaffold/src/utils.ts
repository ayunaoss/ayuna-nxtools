import {
  existsSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { load, dump } from 'js-toml';
import { parseDocument, YAMLSeq } from 'yaml';
import type { Tree } from '@nx/devkit';
import { fileURLToPath } from 'node:url';

// ===== Constants =====

const GENERATED_OUTPUTS = ['go', 'py', 'ts'] as const;
const SCHEMA_OUTPUTS = ['schema', 'schemas', 'openapi'] as const;
const GENERATED_SUFFIXES = [
  '.pb.go',
  '.connect.go',
  '_pb.py',
  '_pb2.py',
  '_pb2.pyi',
  '_connect.py',
  '_pb.ts',
  '_pb.js',
  '_pb.js.map',
  '_pb.d.ts',
  '_pb.d.ts.map',
];
const SCHEMA_SUFFIXES = ['.json', '.yaml', '.yml'];

const GO_SCAN_DIRS = ['libs/go', 'apps/go'];
const GO_DIRECT_PROJECTS = ['bufgen/go'];
const PY_SCAN_DIRS = ['libs/py', 'apps/py'];
const PY_DIRECT_PROJECTS = ['bufgen/py'];
const TS_SCAN_DIRS = ['libs/ts', 'apps/ts'];
const TS_DIRECT_PROJECTS = ['bufgen/ts'];

const _scriptDir = dirname(fileURLToPath(import.meta.url));

// ===== Internal helpers =====

function* filesIn(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* filesIn(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function purgeFilesInDir(
  dir: string,
  suffixes: string[],
  shouldDelete?: (name: string) => boolean,
): void {
  if (!existsSync(dir)) return;

  for (const filePath of filesIn(dir)) {
    const name = basename(filePath);

    if (
      suffixes.some((s) => name.endsWith(s)) &&
      (shouldDelete ? shouldDelete(name) : true)
    ) {
      unlinkSync(filePath);
    }
  }
}

// --- go.work helpers ---

// Collects entries from both `use ./path` and `use ( ... )` forms, deduplicating via Set.
function parseGoWorkEntries(content: string): string[] {
  const entries = new Set<string>();

  for (const m of content.matchAll(/^use\s+(\.\/\S+)/gm)) {
    entries.add(m[1]);
  }

  for (const m of content.matchAll(/^use\s*\(([\s\S]*?)\)/gm)) {
    for (const line of m[1].split('\n')) {
      const t = line.trim();
      if (t.startsWith('./')) entries.add(t);
    }
  }

  return [...entries];
}

// Strips ALL use directives (both forms) and writes a single normalised block.
function serializeGoWork(content: string, entries: string[]): string {
  const cleaned = content
    .replace(/^use\s*\([\s\S]*?\)\n?/gm, '')
    .replace(/^use\s+\.\/\S+.*\n?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();

  if (entries.length === 0) return cleaned + '\n';
  return cleaned + `\n\nuse (\n${entries.map((e) => `\t${e}`).join('\n')}\n)\n`;
}

// --- pyproject.toml helpers ---

interface PyUvData {
  members: string[];
  sources: Record<string, unknown>;
}

interface PyUvWorkspaceData extends PyUvData {
  parsed: Record<string, unknown>;
}

function getPyUvWorkspaceData(
  parsed: Record<string, unknown>,
): PyUvData | null {
  const uv = (parsed['tool'] as Record<string, unknown> | undefined)?.['uv'] as
    Record<string, unknown> | undefined;

  if (!uv) return null;

  const workspace = uv['workspace'] as Record<string, unknown> | undefined;
  if (!workspace) return null;

  if (!Array.isArray(workspace['members'])) workspace['members'] = [];
  const members = workspace['members'] as string[];

  if (typeof uv['sources'] !== 'object' || uv['sources'] === null)
    uv['sources'] = {};

  const sources = uv['sources'] as Record<string, unknown>;

  return { members, sources };
}

function readPyUvWorkspace(root: string): PyUvWorkspaceData | null {
  const content = readFileSync(join(root, 'pyproject.toml'), 'utf-8');
  const parsed = load(content) as Record<string, unknown>;
  const data = getPyUvWorkspaceData(parsed);

  if (!data) {
    console.log(
      'No [tool.uv.workspace] section found in pyproject.toml, skipping.',
    );
    return null;
  }

  return { parsed, ...data };
}

function writePyProjectToml(
  root: string,
  parsed: Record<string, unknown>,
): void {
  writeFileSync(join(root, 'pyproject.toml'), dump(parsed));
}

function readPyProjectName(projectAbsPath: string): string | null {
  const tomlPath = join(projectAbsPath, 'pyproject.toml');

  if (!existsSync(tomlPath)) return null;

  try {
    const parsed = load(readFileSync(tomlPath, 'utf-8')) as Record<
      string,
      unknown
    >;
    return (
      ((parsed['project'] as Record<string, unknown> | undefined)?.['name'] as
        string | undefined) ?? null
    );
  } catch {
    return null;
  }
}

// --- pnpm-workspace.yaml helpers ---

interface PnpmWorkspaceData {
  doc: ReturnType<typeof parseDocument>;
  packages: YAMLSeq;
}

function readPnpmWorkspaceData(root: string): PnpmWorkspaceData | null {
  const content = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf-8');
  const doc = parseDocument(content);
  const packages = doc.get('packages');

  if (!(packages instanceof YAMLSeq)) {
    console.log('No packages array found in pnpm-workspace.yaml, skipping.');
    return null;
  }

  return { doc, packages };
}

function addPnpmPackageEntry(
  doc: ReturnType<typeof parseDocument>,
  packages: YAMLSeq,
  packagePath: string,
): void {
  const entry = doc.createNode(packagePath);
  entry.type = 'QUOTE_SINGLE';
  packages.add(entry);
}

// --- project discovery ---

function discoverProjects(
  root: string,
  scanDirs: string[],
  directPaths: string[],
  marker: string,
): string[] {
  const found: string[] = [];

  for (const scanDir of scanDirs) {
    const scanAbsPath = join(root, scanDir);

    if (!existsSync(scanAbsPath)) continue;

    for (const entry of readdirSync(scanAbsPath, { withFileTypes: true })) {
      if (
        entry.isDirectory() &&
        existsSync(join(scanAbsPath, entry.name, marker))
      ) {
        found.push(join(scanDir, entry.name));
      }
    }
  }

  for (const directPath of directPaths) {
    if (
      existsSync(join(root, directPath)) &&
      existsSync(join(root, directPath, marker))
    ) {
      found.push(directPath);
    }
  }

  return found;
}

// ===== Proto operations =====

export function codegenProto(protoDir: string): boolean {
  console.log(`Entering '${protoDir}' folder...`);

  if (!existsSync(protoDir)) {
    console.error(`'${protoDir}' folder does not exist.`);
    return false;
  }

  console.log('Generating protobuf code...');
  execSync('buf dep update', { cwd: protoDir, stdio: 'inherit' });
  execSync('buf generate', { cwd: protoDir, stdio: 'inherit' });

  console.log('Running tidy and build for bufgen/go...');
  const goDir = join(protoDir, 'go');
  execSync('go mod tidy', { cwd: goDir, stdio: 'inherit' });
  execSync('go build -v ./...', { cwd: goDir, stdio: 'inherit' });

  console.log('Running uv-sync for bufgen/py...');
  const pyDir = join(protoDir, 'py');
  execSync('uv sync --active --all-groups', {
    cwd: pyDir,
    stdio: 'inherit',
  });

  console.log('Running install, build for bufgen/ts...');
  const tsDir = join(protoDir, 'ts');
  execSync('pnpm install', {
    cwd: tsDir,
    stdio: 'inherit',
  });
  execSync('pnpm build', {
    cwd: tsDir,
    stdio: 'inherit',
  });

  return true;
}

export function codepurgeProto(protoDir: string): boolean {
  console.log(`Entering '${protoDir}' folder...`);
  if (!existsSync(protoDir)) {
    console.error(`'${protoDir}' folder does not exist.`);
    return false;
  }

  const prefixes = new Set(
    readdirSync(protoDir)
      .filter((f) => f.endsWith('.proto'))
      .map((f) => f.replace(/\.proto$/, '')),
  );

  for (const output of GENERATED_OUTPUTS) {
    purgeFilesInDir(
      join(protoDir, output),
      GENERATED_SUFFIXES,
      (name) => ![...prefixes].some((p) => name.startsWith(p)),
    );
  }

  for (const output of SCHEMA_OUTPUTS) {
    purgeFilesInDir(join(protoDir, output), SCHEMA_SUFFIXES);
  }

  return true;
}

// ===== Generator tree-based operations =====

export function updateGoWork(tree: Tree, projectRoot: string) {
  const goWorkPath = 'go.work';
  const newEntry = `./${projectRoot}`;

  if (!tree.exists(goWorkPath)) {
    tree.write(goWorkPath, `go 1.27.0\n\nuse (\n\t${newEntry}\n)\n`);
    return;
  }

  const content = tree.read(goWorkPath, 'utf-8');
  if (!content) return;

  const entries = parseGoWorkEntries(content);
  if (entries.includes(newEntry)) return;

  tree.write(goWorkPath, serializeGoWork(content, [...entries, newEntry]));
}

export function updateRootPyProjectToml(
  tree: Tree,
  projectRoot: string,
  projectName: string,
) {
  const tomlPath = 'pyproject.toml';

  if (!tree.exists(tomlPath)) {
    const skelPath = join(_scriptDir, 'skel', 'pyproject.toml');

    if (existsSync(skelPath)) {
      tree.write(tomlPath, readFileSync(skelPath, 'utf-8'));
    } else {
      throw new Error(`Skeleton pyproject.toml not found at ${skelPath}`);
    }
  }

  const content = tree.read(tomlPath, 'utf-8');
  if (!content) return;

  const parsed = load(content) as Record<string, unknown>;

  if (tree.exists('package.json')) {
    const pkgContent = tree.read('package.json', 'utf-8');

    if (pkgContent) {
      const pkgName = (JSON.parse(pkgContent)['name'] as string | undefined)
        ?.replace('@', '')
        .replace('/', '-');
      const pkgDescription = JSON.parse(pkgContent)['description'] as
        string | undefined;
      const project = parsed['project'] as Record<string, unknown> | undefined;

      if (project) {
        if (pkgName) project['name'] = pkgName;
        if (pkgDescription) project['description'] = pkgDescription;
      }
    }
  }

  const data = getPyUvWorkspaceData(parsed);
  if (!data) {
    tree.write(tomlPath, dump(parsed));
    console.warn(
      `'[tool.uv.workspace]' not found in ${tomlPath}. You need to manage workspace manually.`,
    );
    return;
  }

  const { members, sources } = data;
  if (!members.includes(projectRoot)) members.push(projectRoot);
  if (!(projectName in sources)) sources[projectName] = { workspace: true };

  tree.write(tomlPath, dump(parsed));
}

export function updatePnpmWorkspace(tree: Tree, projectRoot: string) {
  const workspacePath = 'pnpm-workspace.yaml';
  if (!tree.exists(workspacePath)) return;

  const content = tree.read(workspacePath, 'utf-8');
  if (!content) return;

  const doc = parseDocument(content);
  const packages = doc.get('packages');
  if (!(packages instanceof YAMLSeq)) return;

  if (packages.items.some((item) => item.value === projectRoot)) return;
  addPnpmPackageEntry(doc, packages, projectRoot);

  tree.write(workspacePath, doc.toString());
}

// ===== Workspace purge operations =====

export function purgeGoWork(root: string): boolean {
  const goWorkPath = join(root, 'go.work');
  if (!existsSync(goWorkPath)) {
    console.log('go.work not found, skipping.');
    return true;
  }

  const content = readFileSync(goWorkPath, 'utf-8');
  const entries = parseGoWorkEntries(content);
  const presentEntries = entries.filter((e) =>
    existsSync(join(root, e.replace(/^\.\//, ''))),
  );

  const normalized = serializeGoWork(content, presentEntries);
  if (normalized === content) {
    console.log('All go.work entries are valid, no cleanup needed.');
    return true;
  }

  writeFileSync(goWorkPath, normalized);
  const removedCount = entries.length - presentEntries.length;
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} stale entries from go.work.`);
  } else {
    console.log('Normalised go.work use directives.');
  }
  return true;
}

export function purgePyProjectToml(root: string): boolean {
  if (!existsSync(join(root, 'pyproject.toml'))) {
    console.log('pyproject.toml not found, skipping.');
    return true;
  }

  const data = readPyUvWorkspace(root);
  if (!data) return true;

  const { parsed, members, sources } = data;
  const presentMembers = members.filter((m) => existsSync(join(root, m)));
  const removedCount = members.length - presentMembers.length;

  if (removedCount === 0) {
    console.log(
      'All pyproject.toml workspace members are valid, no cleanup needed.',
    );
    return true;
  }

  members.splice(0, members.length, ...presentMembers);

  const presentNames = new Set(
    presentMembers
      .map((m) => readPyProjectName(join(root, m)))
      .filter((n): n is string => n !== null),
  );

  for (const [key, value] of Object.entries(sources)) {
    if (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string, unknown>)['workspace'] === true &&
      !presentNames.has(key)
    ) {
      delete sources[key];
    }
  }

  writePyProjectToml(root, parsed);
  console.log(`Removed ${removedCount} stale entries from pyproject.toml.`);
  return true;
}

export function purgePnpmWorkspace(root: string): boolean {
  if (!existsSync(join(root, 'pnpm-workspace.yaml'))) {
    console.log('pnpm-workspace.yaml not found, skipping.');
    return true;
  }

  const data = readPnpmWorkspaceData(root);
  if (!data) return true;

  const { doc, packages } = data;
  const originalCount = packages.items.length;

  packages.items = packages.items.filter((item) => {
    const pkgPath = (item as { value: string }).value;
    if (/[*?{[]/.test(pkgPath)) return true;
    return existsSync(join(root, pkgPath));
  });

  const removedCount = originalCount - packages.items.length;
  if (removedCount === 0) {
    console.log(
      'All pnpm-workspace.yaml packages are valid, no cleanup needed.',
    );
    return true;
  }

  writeFileSync(join(root, 'pnpm-workspace.yaml'), doc.toString());
  console.log(
    `Removed ${removedCount} stale entries from pnpm-workspace.yaml.`,
  );
  return true;
}

// ===== Workspace sync operations =====

export function syncGoWork(root: string): boolean {
  const goWorkPath = join(root, 'go.work');
  if (!existsSync(goWorkPath)) {
    console.log('go.work not found, skipping.');
    return true;
  }

  const content = readFileSync(goWorkPath, 'utf-8');
  const currentEntries = parseGoWorkEntries(content);
  const currentPaths = new Set(
    currentEntries.map((e) => e.replace(/^\.\//, '')),
  );

  const discovered = discoverProjects(
    root,
    GO_SCAN_DIRS,
    GO_DIRECT_PROJECTS,
    'go.mod',
  );
  const missing = discovered.filter((p) => !currentPaths.has(p));

  const allEntries = [...currentEntries, ...missing.map((p) => `./${p}`)];
  const normalized = serializeGoWork(content, allEntries);

  if (normalized === content) {
    console.log('go.work is up to date, no sync needed.');
    return true;
  }

  writeFileSync(goWorkPath, normalized);
  if (missing.length > 0) {
    console.log(`Added ${missing.length} new entries to go.work.`);
  } else {
    console.log('Normalised go.work use directives.');
  }
  return true;
}

export function syncPyProjectToml(root: string): boolean {
  if (!existsSync(join(root, 'pyproject.toml'))) {
    console.log('pyproject.toml not found, skipping.');
    return true;
  }

  const data = readPyUvWorkspace(root);
  if (!data) return true;

  const { parsed, members, sources } = data;
  const currentSet = new Set(members);

  const discovered = discoverProjects(
    root,
    PY_SCAN_DIRS,
    PY_DIRECT_PROJECTS,
    'pyproject.toml',
  );
  let addedCount = 0;

  for (const projectPath of discovered) {
    if (currentSet.has(projectPath)) continue;
    members.push(projectPath);
    currentSet.add(projectPath);
    addedCount++;

    const projectName = readPyProjectName(join(root, projectPath));

    if (projectName && !(projectName in sources)) {
      sources[projectName] = { workspace: true };
    }
  }

  if (addedCount === 0) {
    console.log('pyproject.toml workspace is up to date, no sync needed.');
    return true;
  }

  writePyProjectToml(root, parsed);
  console.log(`Added ${addedCount} new entries to pyproject.toml.`);

  return true;
}

export function syncPnpmWorkspace(root: string): boolean {
  if (!existsSync(join(root, 'pnpm-workspace.yaml'))) {
    console.log('pnpm-workspace.yaml not found, skipping.');
    return true;
  }

  const data = readPnpmWorkspaceData(root);
  if (!data) return true;

  const { doc, packages } = data;
  const currentSet = new Set(
    packages.items.map((item) => (item as { value: string }).value),
  );

  const discovered = discoverProjects(
    root,
    TS_SCAN_DIRS,
    TS_DIRECT_PROJECTS,
    'package.json',
  );
  let addedCount = 0;

  for (const projectPath of discovered) {
    if (currentSet.has(projectPath)) continue;
    addPnpmPackageEntry(doc, packages, projectPath);
    addedCount++;
  }

  if (addedCount === 0) {
    console.log('pnpm-workspace.yaml is up to date, no sync needed.');
    return true;
  }

  writeFileSync(join(root, 'pnpm-workspace.yaml'), doc.toString());
  console.log(`Added ${addedCount} new entries to pnpm-workspace.yaml.`);

  return true;
}

export function syncRoot(root: string): boolean {
  try {
    execSync('go work sync', { cwd: root, stdio: 'inherit' });
    execSync('pnpm clean && pnpm install', { cwd: root, stdio: 'inherit' });
    execSync('uv sync --refresh --all-groups --all-packages', {
      cwd: root,
      stdio: 'inherit',
    });

    return true;
  } catch {
    return false;
  }
}

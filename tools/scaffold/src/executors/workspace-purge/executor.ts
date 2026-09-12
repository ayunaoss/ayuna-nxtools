import type { ExecutorContext } from '@nx/devkit';
import {
  purgeGoWork,
  purgePyProjectToml,
  purgePnpmWorkspace,
  syncRoot,
} from '../../utils.js';

export default async function workspacePurgeExecutor(
  _options: Record<string, never>,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const root = context.root;
  const goOk = purgeGoWork(root);
  const pyOk = purgePyProjectToml(root);
  const tsOk = purgePnpmWorkspace(root);
  const rootOk = syncRoot(root);

  return { success: goOk && pyOk && tsOk && rootOk };
}

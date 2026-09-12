import type { ExecutorContext } from '@nx/devkit';
import {
  syncGoWork,
  syncPyProjectToml,
  syncPnpmWorkspace,
  syncRoot,
} from '../../utils.js';

export default async function workspaceSyncExecutor(
  _options: Record<string, never>,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const root = context.root;
  const goOk = syncGoWork(root);
  const pyOk = syncPyProjectToml(root);
  const tsOk = syncPnpmWorkspace(root);
  const rootOk = syncRoot(root);

  return { success: goOk && pyOk && tsOk && rootOk };
}

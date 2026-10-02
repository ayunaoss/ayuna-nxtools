import { join } from 'node:path';
import type { ExecutorContext } from '@nx/devkit';
import { codegenProto } from '../../utils.js';

export default async function codegenProtoExecutor(
  _options: Record<string, never>,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const protoDir = join(context.root, 'bufgen');
  return { success: codegenProto(protoDir) };
}

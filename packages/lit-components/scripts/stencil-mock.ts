/**
 * Mock Stencil CompilerCtx and Config for running angular-generator
 * This allows us to use Stencil's angular output target without running Stencil
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

/**
 * Mock CompilerCtx with minimal file system operations
 */
export class MockCompilerCtx {
  fs = {
    writeFile: async (filePath: string, content: string): Promise<void> => {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`  Generated: ${filePath}`);
    },
  };
}

/**
 * Mock Config with required fields for angular-generator
 */
export class MockConfig {
  rootDir: string;
  sys: any;

  constructor(rootDir: string) {
    this.rootDir = rootDir;

    // Mock sys with copy, glob, and readFile utilities
    this.sys = {
      readFile: async (filePath: string, encoding?: string): Promise<string> => {
        return fs.readFile(filePath, encoding || 'utf-8');
      },

      copy: async (
        copyTasks: Array<{
          src: string;
          dest: string;
          keepDirStructure?: boolean;
          warn?: boolean;
        }>,
        srcDir: string
      ): Promise<void> => {
        for (const task of copyTasks) {
          const files = await glob('**/*', {
            cwd: task.src,
            nodir: true,
            absolute: false,
          });

          for (const file of files) {
            const srcPath = path.join(task.src, file);
            const destPath = task.keepDirStructure
              ? path.join(task.dest, file)
              : path.join(task.dest, path.basename(file));

            const destDir = path.dirname(destPath);
            await fs.mkdir(destDir, { recursive: true });

            const content = await fs.readFile(srcPath);
            await fs.writeFile(destPath, content);
          }
        }
      },

      glob: async (pattern: string, opts: any): Promise<string[]> => {
        return glob(pattern, opts);
      },
    };
  }
}

/**
 * Mock BuildCtx for timespan tracking
 */
export class MockBuildCtx {
  createTimeSpan(msg: string, debug?: boolean) {
    const start = Date.now();
    if (debug) {
      console.log(`  ${msg}`);
    }

    return {
      finish: (finishMsg: string) => {
        const duration = Date.now() - start;
        console.log(`  ${finishMsg} (${duration}ms)`);
      },
    };
  }
}

import type { Plugin } from 'vite';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { generateComponentsDts } from '../scripts/generate-components-dts.js';
import { generateAngularWrappers } from '../scripts/generate-angular-wrappers.js';

/**
 * Vite plugin for Lit components that:
 * 1. Generates components.d.ts with component metadata
 * 2. Generates Angular wrappers using Stencil's angular-generator
 */
export function litComponentsPlugin(): Plugin {
  let projectRoot: string;
  let srcDir: string;
  let componentsFilePath: string;

  return {
    name: 'vite-plugin-lit-components',

    configResolved(config) {
      projectRoot = config.root;
      srcDir = path.join(projectRoot, 'src');
      componentsFilePath = path.join(projectRoot, 'dist', 'components.d.ts');
    },

    async closeBundle() {
      try {
        console.log('\n[lit-components-plugin] Generating component metadata...');

        // Step 1: Generate components.d.ts
        await generateComponentsDts(srcDir, componentsFilePath);

        // Step 2: Add Components export to index.d.ts
        const indexDtsPath = path.join(projectRoot, 'dist', 'index.d.ts');
        if (fs.existsSync(indexDtsPath)) {
          let indexContent = fs.readFileSync(indexDtsPath, 'utf-8');

          // Only add if not already present
          if (!indexContent.includes("export type * from './components.d.ts'")) {
            // Remove source map reference temporarily
            const sourceMapMatch = indexContent.match(/\/\/# sourceMappingURL=.*/);
            indexContent = indexContent.replace(/\/\/# sourceMappingURL=.*\n?/, '');

            // Add Components export
            indexContent += `export type * from './components.d.ts';\n`;

            // Add source map reference back
            if (sourceMapMatch) {
              indexContent += sourceMapMatch[0] + '\n';
            }

            fs.writeFileSync(indexDtsPath, indexContent);
            console.log('[lit-components-plugin] Added Components types export to index.d.ts');
          }
        }

        // Step 3: Generate Angular wrappers using Stencil's angular-generator
        const configPath = path.join(projectRoot, 'lit.config.js');

        try {
          // Dynamic import of the config
          const configModule = await import(pathToFileURL(configPath).href);
          const config = configModule.config || configModule.default;

          if (config && config.outputTargets && config.outputTargets.length > 0) {
            await generateAngularWrappers(componentsFilePath, config.outputTargets);
          } else {
            console.log('[lit-components-plugin] No Angular output targets configured in lit.config.js');
          }
        } catch (configError: any) {
          if (configError.code === 'ERR_MODULE_NOT_FOUND' || configError.code === 'ENOENT') {
            console.log('[lit-components-plugin] No lit.config.js found, skipping Angular wrapper generation');
          } else {
            console.warn('[lit-components-plugin] Warning: Failed to load lit.config.js:', configError.message);
            if (process.env.DEBUG) {
              console.warn('Full error:', configError);
            }
          }
        }

        console.log('[lit-components-plugin] Component metadata generation completed!');
      } catch (error) {
        console.error('[lit-components-plugin] Failed to generate component metadata:', error);
        throw error;
      }
    },
  };
}

/**
 * Helper to convert path to file URL
 */
function pathToFileURL(filepath: string): URL {
  return new URL(`file://${filepath}`);
}

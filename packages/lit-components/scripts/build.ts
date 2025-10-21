#!/usr/bin/env node

import { generateComponentsDts } from './generate-components-dts';
import { generateAngularWrappers } from './generate-angular-wrappers';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const componentsFilePath = path.join(projectRoot, 'dist', 'components.d.ts');

async function main() {
  try {
    // Step 1: Generate components.d.ts
    await generateComponentsDts(srcDir, componentsFilePath);

    // Step 1.5: Add Components export to index.d.ts
    const indexDtsPath = path.join(projectRoot, 'dist', 'index.d.ts');
    if (fs.existsSync(indexDtsPath)) {
      let indexContent = fs.readFileSync(indexDtsPath, 'utf-8');
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
      console.log('Added Components types export to index.d.ts');
    }

    // Step 2: Generate Angular wrappers using Stencil's angular-generator
    const configPath = path.join(projectRoot, 'lit.config.js');

    try {
      // Dynamic import of the config
      const configModule = await import(pathToFileURL(configPath).href);
      const config = configModule.config || configModule.default;

      if (config && config.outputTargets && config.outputTargets.length > 0) {
        await generateAngularWrappers(componentsFilePath, config.outputTargets);
      } else {
        console.log('\nNo Angular output targets configured in lit.config.js');
      }
    } catch (configError: any) {
      if (configError.code === 'ERR_MODULE_NOT_FOUND' || configError.code === 'ENOENT') {
        console.log('\nNo lit.config.js found, skipping Angular wrapper generation');
      } else {
        console.warn('\nWarning: Failed to load lit.config.js:', configError.message);
        if (process.env.DEBUG) {
          console.warn('Full error:', configError);
        }
      }
    }

    console.log('\nBuild completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Helper to convert path to file URL
function pathToFileURL(filepath: string): URL {
  return new URL(`file://${filepath}`);
}

main();

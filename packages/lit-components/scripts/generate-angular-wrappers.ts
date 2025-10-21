/**
 * Generate Angular wrappers for Lit components using Stencil's angular-generator
 */

import { loadComponentsFromDts } from './stencil-adapter.js';
import { MockCompilerCtx, MockConfig, MockBuildCtx } from './stencil-mock.js';
import { angularDirectiveProxyOutput, type OutputTargetAngular } from '@stencil/angular-output-target';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

export async function generateAngularWrappers(
  componentsFilePath: string,
  outputTargets: OutputTargetAngular[]
): Promise<void> {
  console.log('\nGenerating Angular wrappers for Lit components...');

  // Load component metadata from components.d.ts
  console.log(`Loading components from: ${componentsFilePath}`);
  const components = await loadComponentsFromDts(componentsFilePath);

  console.log(`Found ${components.length} component(s):`);
  components.forEach((comp) => {
    console.log(`  - ${comp.tagName} (${comp.componentClassName})`);
    console.log(`    Properties: ${comp.properties.length}`);
    console.log(`    Events: ${comp.events.length}`);
  });

  // Create mock Stencil environment
  const compilerCtx = new MockCompilerCtx() as any;
  const config = new MockConfig(projectRoot) as any;
  const buildCtx = new MockBuildCtx() as any;

  // Add components to buildCtx
  buildCtx.components = components;

  // Process each output target
  for (const outputTarget of outputTargets) {
    console.log(`\nProcessing output target:`);
    console.log(`  Component package: ${outputTarget.componentCorePackage}`);
    console.log(`  Output file: ${outputTarget.directivesProxyFile}`);
    console.log(`  Output type: ${outputTarget.outputType || 'standalone'}`);

    const timespan = buildCtx.createTimeSpan('Generate Angular proxies started', true);

    try {
      await angularDirectiveProxyOutput(
        compilerCtx,
        outputTarget,
        components,
        config
      );

      timespan.finish('Generate Angular proxies finished');
    } catch (error) {
      console.error('Error generating Angular wrappers:', error);
      throw error;
    }
  }

  console.log('\nAngular wrapper generation complete!');
}

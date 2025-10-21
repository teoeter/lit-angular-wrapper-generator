/**
 * Lit Components Configuration
 * This config uses Stencil's angular-generator to create Angular wrappers for Lit components
 */

export const config = {
  outputTargets: [
    {
      // Use Stencil's angular-generator to create Angular wrappers
      componentCorePackage: 'lit-components',
      directivesProxyFile: '../lit-angular-wrappers/src/directives/proxies.ts',
      outputType: 'standalone',
      excludeComponents: [],
      customElementsDir: '', // Lit doesn't use Stencil's dist-custom-elements pattern
      inlineProperties: true, // Enable typed property declarations for Angular template type checking
    },
  ],
};

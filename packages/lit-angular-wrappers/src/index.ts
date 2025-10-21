// Re-export the types from lit-components
export type * from 'lit-components/dist/components.d.ts';

// Export the Angular component wrappers
export { LitCard, LitCounter, LitButton } from './directives/proxies.js';

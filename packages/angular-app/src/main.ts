// Import JIT compiler for dev mode
import '@angular/compiler';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Import Stencil components loader
import { defineCustomElements } from 'stencil-components/loader';

// Import Lit components to register them
import 'lit-components';

// Initialize Stencil components
defineCustomElements();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

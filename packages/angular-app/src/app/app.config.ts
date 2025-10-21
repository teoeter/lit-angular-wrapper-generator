import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
  ]
};

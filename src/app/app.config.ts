import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

import { routes } from './app.routes';
import { MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { COMMA, SPACE } from '@angular/cdk/keycodes';
import { ErrorStateMatcher } from '@angular/material/core';
import { CustomErrorStateMatcher } from './core/validators/custom-error-state-matcher';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    {
      provide:MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {appearance: 'outline'}
    },
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [COMMA, SPACE]
      }
    },
    {provide: ErrorStateMatcher, useClass: CustomErrorStateMatcher}
  ]
};

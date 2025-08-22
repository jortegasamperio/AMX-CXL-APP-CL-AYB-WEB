import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { environment } from './environments/environment';

// Inyectar preconnect dinámicamente
const link = document.createElement('link');
link.rel = 'preconnect';
link.href = environment.preconnect;
document.head.appendChild(link);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

/*bootstrapApplication(App, {
  providers: [provideAnimations(), provideHttpClient(), provideNativeDateAdapter()],
}).catch(err => console.error(err));*/

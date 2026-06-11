import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { isLiveSite } from './app/api-url';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production || isLiveSite()) {
  enableProdMode();
}

// Drop stale service workers that may cache an old dev bundle (localhost API).
if (isLiveSite() && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));

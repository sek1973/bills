import { EnvironmentProviders } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './views.routing';

export function provideViews(): EnvironmentProviders {
  return provideRouter(appRoutes);
}

export * from './components';

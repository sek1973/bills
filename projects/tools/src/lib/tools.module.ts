import { provideHttpClient } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BILLS_DATE_FORMATS, BillsDateAdapter } from './helpers/date.adapter';

export function provideToolsDeps(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideAnimationsAsync(),
        provideHttpClient(),
        { provide: MAT_DATE_FORMATS, useValue: BILLS_DATE_FORMATS },
        { provide: DateAdapter, useClass: BillsDateAdapter },
    ]);
}

export * from './components';
export * from './helpers';
export * from './services';


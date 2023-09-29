// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Environment } from './model';

export const environment: Environment = {
  production: false,
  disableRegistration: false,
  backend: 'http://localhost:3030/',
  edulint: {
    url: 'https://edulint.com',
    version: 'latest',
    config: 'https://ksi.fi.muni.cz/assets/edulint/ksi.toml'
  },
  urlPrefix: '',
  logger: {
    log: console.log,
    error: console.error,
    debug: console.debug,
    warn: console.warn
  },
  allowTestingAccountRegistration: true,
  mergeSimilarWaves: true,
  oldFrontendUrl: 'https://kyzikos.fi.muni.cz/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

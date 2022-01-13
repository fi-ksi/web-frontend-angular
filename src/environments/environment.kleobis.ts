// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  backend: 'https://rest.ksi.fi.muni.cz/',
  urlPrefix: '/novy-web/',
  logger: {
    log: console.log,
    error: console.error,
    debug: console.debug,
    warn: console.warn
  }
};

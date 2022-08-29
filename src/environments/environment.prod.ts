import { Environment } from './model';

const doNothing = (..._: never[]) => {};

export const environment: Environment = {
  production: true,
  backend: 'https://rest.naskoc.fi.muni.cz/',
  urlPrefix: '/',
  logger: {
    log: doNothing,
    error: console.error,
    debug: doNothing,
    warn: doNothing
  },
  mergeSimilarWaves: true,
  oldFrontendUrl: 'https://naskoc_admin.iamroot.eu/'
};

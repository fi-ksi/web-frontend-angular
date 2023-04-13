import { Environment } from './model';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const doNothing = (): void => {};

export const environment: Environment = {
  production: true,
  backend: 'https://rest.naskoc.fi.muni.cz/',
  edulint: 'https://edulint.rechtackova.cz/',
  urlPrefix: '',
  logger: {
    log: doNothing,
    error: console.error,
    debug: doNothing,
    warn: doNothing
  },
  mergeSimilarWaves: true,
  oldFrontendUrl: 'https://naskoc_admin.iamroot.eu/'
};

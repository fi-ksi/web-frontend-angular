import { Environment } from './model';

const doNothing = (..._: any[]) => {};

export const environment: Environment = {
  production: true,
  backend: 'http://localhost:3030/',
  edulint: 'https://edulint.rechtackova.cz/',
  urlPrefix: '',
  logger: {
    log: doNothing,
    error: doNothing,
    debug: doNothing,
    warn: doNothing
  }
};

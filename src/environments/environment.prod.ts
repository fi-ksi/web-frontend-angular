import { Environment } from './model';

const doNothing = (..._: any[]) => {};

export const environment: Environment = {
  production: true,
  backend: 'http://localhost:3030/',
  edulint: {
    url: 'https://edulint.com',
    version: '2.10.2',
    config: 'default'
  },
  urlPrefix: '',
  logger: {
    log: doNothing,
    error: doNothing,
    debug: doNothing,
    warn: doNothing
  }
};

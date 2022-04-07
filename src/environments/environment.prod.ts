import { Environment } from "./model";

const doNothing = (..._: any[]) => {};

export const environment: Environment = {
  production: true,
  backend: 'https://rest.naskoc.fi.muni.cz/',
  urlPrefix: '/',
  logger: {
    log: console.log,
    error: console.error,
    debug: console.debug,
    warn: console.warn
  }
};

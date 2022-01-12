const doNothing = (..._: any[]) => {};

export const environment = {
  production: true,
  backend: 'http://localhost:3030/',
  urlPrefix: '',
  logger: {
    log: doNothing,
    error: doNothing,
    debug: doNothing,
    warn: doNothing
  }
};

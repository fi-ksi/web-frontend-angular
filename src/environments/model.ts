export interface Environment {
  production: boolean,
  backend: string,
  urlPrefix: string,
  logger: {
    log: (...data: unknown[]) => void,
    error: (...data: unknown[]) => void,
    debug: (...data: unknown[]) => void,
    warn: (...data: unknown[]) => void
  },
  disableRegistration?: boolean,
  allowTestingAccountRegistration?: boolean,
  mergeSimilarWaves?: boolean,
  oldFrontendUrl?: string;
}

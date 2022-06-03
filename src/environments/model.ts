export interface Environment {
  production: boolean,
  backend: string,
  urlPrefix: string,
  logger: {
    log: (...data: any[]) => void,
    error: (...data: any[]) => void,
    debug: (...data: any[]) => void,
    warn: (...data: any[]) => void
  },
  disableRegistration?: boolean,
  allowTestingAccountRegistration?: boolean,
}

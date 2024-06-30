export * from './aPI.service';
import { APIService } from './aPI.service';
export * from './default.service';
import { DefaultService } from './default.service';
export * from './web.service';
import { WebService } from './web.service';
export const APIS = [APIService, DefaultService, WebService];

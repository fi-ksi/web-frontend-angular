import { KSIModule, ModuleSubmitResponse } from "../../api";
import { Observable } from "rxjs";

export interface ModuleSubmitChange {
  module: KSIModule,
  result: ModuleSubmitResponse | null
}

export interface FileUpload {
  progress$: Observable<number>;
  response$: Observable<ModuleSubmitResponse>;
}

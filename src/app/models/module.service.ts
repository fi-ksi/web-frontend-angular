import { KSIModule, ModuleSubmitResponse } from "../../api";

export interface ModuleSubmitChange {
  module: KSIModule,
  result: ModuleSubmitResponse
}

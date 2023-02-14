import { KSIModule, ModuleSubmitResponse, SortableItem } from "../../api/backend";
import { Observable } from "rxjs";

export interface ModuleSubmitChange {
  module: KSIModule,
  result: ModuleSubmitResponse | null
}

export interface FileUpload {
  progress$: Observable<number>;
  response$: Observable<ModuleSubmitResponse>;
}

export interface ISortableItem extends SortableItem {
  $fixed: boolean;
  $absOffset?: number;
  $itemAfter?: ISortableItem;
  $placement?: 'left' | 'right';
  $id: string;
}

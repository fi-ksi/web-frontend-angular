import type { components } from '../../api/schema';

type S = components['schemas'];

/**
 * Sortable list item with layout metadata computed by TaskModuleSortable.
 * Port of the Angular ISortableItem model.
 */
export type SortableItemEx = S['SortableItem'] & {
  $fixed: boolean;
  $id: string;
  $absOffset?: number;
  $placement?: 'left' | 'right';
  $itemAfter?: SortableItemEx;
};

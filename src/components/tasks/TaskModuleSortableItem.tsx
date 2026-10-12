import React from 'react';
import type { SortableItemEx } from './sortableItem';
import './TaskModuleSortableItem.scss';

/**
 * One item of the sortable module. Port of the Angular
 * TaskModuleSortableItemComponent.
 */
export function TaskModuleSortableItem({
  item,
  selected = false
}: {
  item: SortableItemEx;
  selected?: boolean;
}): React.ReactElement {
  const className = `task-module-sortable-item${item.$fixed ? ' fixed' : ''}${selected ? ' selected' : ''}`;
  return (
    <div className={className}>
      {!!item.$absOffset && <div className="offset" style={{ width: `${2 * item.$absOffset}ex` }} />}
      <div className="content" dangerouslySetInnerHTML={{ __html: item.content }} />
    </div>
  );
}

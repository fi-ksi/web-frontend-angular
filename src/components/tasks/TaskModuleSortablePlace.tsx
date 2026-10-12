import React, { useState } from 'react';
import type { SortableItemEx } from './sortableItem';
import { TaskModuleSortableItem } from './TaskModuleSortableItem';
import './TaskModuleSortablePlace.scss';

/**
 * A drop placeholder shown between sortable items while an item is selected.
 * Hovering previews the selected item at that position.
 * Port of the Angular TaskModuleSortablePlaceComponent.
 */
export function TaskModuleSortablePlace({
  selected,
  onPlace
}: {
  selected: SortableItemEx | null;
  onPlace: () => void;
}): React.ReactElement | null {
  const [hover, setHover] = useState(false);

  if (!selected) {
    return null;
  }

  return (
    <div
      className="task-module-sortable-place"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onPlace}
    >
      {hover ? (
        <TaskModuleSortableItem item={selected} selected />
      ) : (
        <div className="container">+</div>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { components } from '../../api/schema';
import { useIsMobileSmall } from '../../hooks/useWindowSize';
import type { SortableItemEx } from './sortableItem';
import { TaskModuleSortableItem } from './TaskModuleSortableItem';
import { TaskModuleSortablePlace } from './TaskModuleSortablePlace';
import { useModuleSubmit } from './moduleSubmit';
import './TaskModuleSortable.scss';

type S = components['schemas'];

function initialLists(module: S['ModuleSortable']): { left: SortableItemEx[]; right: SortableItemEx[] } {
  const left = module.sortable_list.fixed.map(
    (item, index): SortableItemEx => ({ ...item, $fixed: true, $id: `a${index}` })
  );
  const right = module.sortable_list.movable.map(
    (item, index): SortableItemEx => ({ ...item, $fixed: false, $id: `b${index}` })
  );
  return { left, right };
}

/**
 * Recomputes the layout metadata ($absOffset, $placement, $itemAfter)
 * of all items. Port of TaskModuleSortableComponent.redraw.
 */
function redrawLists(left: SortableItemEx[], right: SortableItemEx[]): void {
  let offset = 0;
  left.forEach((item, index, array) => {
    item.$absOffset = offset;
    item.$placement = 'left';
    item.$itemAfter = array[index + 1];
    offset = Math.max(0, offset + item.offset);
  });
  for (const item of right) {
    item.$absOffset = 0;
    item.$placement = 'right';
    item.$itemAfter = undefined;
  }
}

/**
 * Sortable module: arrange movable items into the result list by
 * click-to-pick and click-to-place. Port of the Angular
 * TaskModuleSortableComponent.
 */
export function TaskModuleSortable({ module }: { module: S['ModuleSortable'] }): React.ReactElement {
  const { t } = useTranslation();
  const { submit, submitting } = useModuleSubmit(module.id);
  const isMobileSmall = useIsMobileSmall();

  const [lists, setLists] = useState(() => {
    const { left, right } = initialLists(module);
    redrawLists(left, right);
    return { left, right };
  });
  const [selectedItem, setSelectedItem] = useState<SortableItemEx | null>(null);

  const draggedItemRef = useRef<HTMLDivElement>(null);
  const lastClickPosRef = useRef<{ x: number; y: number } | undefined>(undefined);
  const mouseMoveTimerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(mouseMoveTimerRef.current);
    },
    []
  );

  // lets the selected item follow the cursor (throttled to 60 FPS)
  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (mouseMoveTimerRef.current !== undefined) {
        return;
      }
      mouseMoveTimerRef.current = window.setTimeout(() => {
        const draggedEl = draggedItemRef.current;
        const lastClickPos = lastClickPosRef.current;
        if (
          draggedEl &&
          // if the last click was on the same place as the move, ignore it;
          // this is a typical situation on touchscreen devices
          (!lastClickPos || lastClickPos.x !== event.clientX || lastClickPos.y !== event.clientY)
        ) {
          const { style } = draggedEl;
          const rect = draggedEl.getBoundingClientRect();
          style.visibility = 'visible';
          style.position = 'fixed';
          style.top = `${event.clientY + rect.height / 2}px`;
          style.left = `${event.clientX - rect.width / 2}px`;
        }
        mouseMoveTimerRef.current = undefined;
      }, 1000 / 60);
    },
    []
  );

  const updateLists = useCallback((left: SortableItemEx[], right: SortableItemEx[]) => {
    redrawLists(left, right);
    setLists({ left: [...left], right: [...right] });
  }, []);

  const pickItem = useCallback((item: SortableItemEx) => {
    if (item.$fixed) {
      return;
    }
    setSelectedItem(item);
  }, []);

  const placeItemLeftAfterIndex = useCallback(
    (index: number) => {
      if (!selectedItem) {
        return;
      }
      const left = lists.left.filter((x) => x !== selectedItem);
      const right = lists.right.filter((x) => x !== selectedItem);
      left.splice(index + 1, 0, selectedItem);
      setSelectedItem(null);
      updateLists(left, right);
    },
    [selectedItem, lists, updateLists]
  );

  const placeItemRight = useCallback(() => {
    if (!selectedItem) {
      return;
    }
    const left = lists.left.filter((x) => x !== selectedItem);
    const right = [selectedItem, ...lists.right.filter((x) => x !== selectedItem)];
    setSelectedItem(null);
    updateLists(left, right);
  }, [selectedItem, lists, updateLists]);

  return (
    <div
      className="task-module-sortable"
      onMouseMove={onMouseMove}
      onClick={(event) => {
        lastClickPosRef.current = { x: event.clientX, y: event.clientY };
      }}
    >
      {selectedItem && (
        <div className="selected-container">
          <TaskModuleSortableItem item={selectedItem} selected />
        </div>
      )}

      <div className={`lists${isMobileSmall ? ' mobile' : ''}`}>
        <div className="sortable-list">
          <h4>{t('tasks.module.sortable.result')}</h4>
          {selectedItem && selectedItem !== lists.left[0] && (
            <TaskModuleSortablePlace selected={selectedItem} onPlace={() => placeItemLeftAfterIndex(-1)} />
          )}
          {lists.left.map((item, index) => (
            <React.Fragment key={item.$id}>
              <div onClick={() => pickItem(item)}>
                <TaskModuleSortableItem item={item} selected={selectedItem === item} />
              </div>
              {selectedItem && item !== selectedItem && item.$itemAfter !== selectedItem && (
                <TaskModuleSortablePlace selected={selectedItem} onPlace={() => placeItemLeftAfterIndex(index)} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="sortable-list">
          <h4>{t('tasks.module.sortable.items')}</h4>
          {selectedItem && <TaskModuleSortablePlace selected={selectedItem} onPlace={placeItemRight} />}
          {lists.right.map((item) => (
            <div key={item.$id} onClick={() => pickItem(item)}>
              <TaskModuleSortableItem item={item} selected={selectedItem === item} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-ksi submit"
        disabled={submitting}
        onClick={() => void submit(lists.left.map((item) => item.$id))}
      >
        {t('tasks.module.submit')}
      </button>

      {selectedItem && (
        <div ref={draggedItemRef} style={{ visibility: 'hidden' }}>
          <TaskModuleSortableItem item={selectedItem} selected />
        </div>
      )}
    </div>
  );
}

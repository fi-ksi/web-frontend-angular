import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  flatArray,
  minimizeEdgeCrossings,
  splitToLevels,
  type TaskWithIcon,
  type TasksMap
} from '../../utils/graphLayout';
import { TaskIcon } from './TaskIcon';
import './TasksGraph.scss';

interface Arrow {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  key: string;
}

/**
 * SVG-based graph of tasks: nodes are task icons laid out in levels,
 * edges are prerequisite arrows. Port of the Angular TasksGraphComponent,
 * including the barycenter edge-crossing minimization (#131).
 */
export function TasksGraph({ tasks }: { tasks: TaskWithIcon[] }): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const arrowsRef = useRef<SVGSVGElement>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [animated, setAnimated] = useState(false);

  // split tasks into levels and order them inside levels so that
  // dependency arrows cross as little as possible
  const tasksGraphed = useMemo(() => {
    const taskMap: TasksMap = {};
    const levels = splitToLevels([...tasks], taskMap);
    minimizeEdgeCrossings(levels, taskMap);
    return levels;
  }, [tasks]);

  const drawArrows = useCallback(
    (withAnimation: boolean) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const { top, left, width, height } = container.getBoundingClientRect();
      // The SVG has no intrinsic size — size it to the graph like the
      // original does, otherwise longer edges get clipped.
      const svg = arrowsRef.current;
      if (svg) {
        svg.style.width = `${width}px`;
        svg.style.height = `${height}px`;
      }
      const drawn: Arrow[] = [];
      flatArray(tasksGraphed).forEach((task) => {
        const elTask = container.querySelector(`#ksi-task-${task.id}`);
        if (!elTask) {
          return;
        }
        const taskPos = elTask.getBoundingClientRect();
        const x2 = Math.round(taskPos.left - left + taskPos.width / 2);
        const y2 = Math.round(taskPos.top - top + taskPos.height / 2);
        flatArray(task.prerequisities).forEach((requirementId) => {
          const elRequirement = container.querySelector(`#ksi-task-${requirementId}`);
          if (!elRequirement) {
            return;
          }
          const requirementPos = elRequirement.getBoundingClientRect();
          drawn.push({
            x1: Math.round(requirementPos.left - left + requirementPos.width / 2),
            y1: Math.round(requirementPos.top - top + requirementPos.height / 2),
            x2,
            y2,
            key: `${requirementId}-${task.id}`
          });
        });
      });
      setArrows(drawn);
      setAnimated(withAnimation);
    },
    [tasksGraphed]
  );

  // Draws arrows and keeps watching: if task positions change (images loading,
  // fonts, layout shifts), redraws with exponential backoff up to 2 seconds.
  useEffect(() => {
    let cancelled = false;

    const getPositions = (): { left: number; top: number }[] => {
      const container = containerRef.current;
      if (!container) {
        return [];
      }
      return [...container.querySelectorAll('[id^="ksi-task-"]')]
        .sort((a, b) => (a.id === b.id ? 0 : a.id > b.id ? 1 : -1))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { left: rect.left, top: rect.top };
        });
    };

    const watchDraw = (): void => {
      if (cancelled) {
        return;
      }
      const positions = getPositions();
      if (!positions.find((pos) => pos.left !== 0 || pos.top !== 0)) {
        window.setTimeout(watchDraw, 100);
        return;
      }
      drawArrows(true);

      const checkAndDraw = (timeout = 0, maxTimeout = 2000): void => {
        if (cancelled || timeout > maxTimeout) {
          return;
        }
        window.setTimeout(() => {
          if (cancelled) {
            return;
          }
          const current = getPositions();
          const changed =
            positions.length !== current.length ||
            current.some((pos, index) => pos.left !== positions[index].left);
          if (changed) {
            drawArrows(true);
          } else {
            checkAndDraw((timeout + 1) * 2, maxTimeout);
          }
        }, timeout);
      };
      checkAndDraw();
    };

    watchDraw();

    // redraw arrows on window size change (debounced)
    let resizeTimer: number | undefined;
    const onResize = (): void => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!cancelled) {
          drawArrows(false);
        }
      }, 333);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [drawArrows]);

  return (
    <div className="tasks-graph" ref={containerRef}>
      <div className="arrows-container">
        <svg className="arrows" ref={arrowsRef}>
          {arrows.map((arrow) => (
            <line
              key={arrow.key}
              x1={arrow.x1}
              y1={arrow.y1}
              x2={arrow.x2}
              y2={arrow.y2}
              className={animated ? 'animated' : ''}
            />
          ))}
        </svg>
      </div>
      {tasksGraphed.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((task) => (
            <TaskIcon key={task.id} task={task} />
          ))}
        </div>
      ))}
    </div>
  );
}

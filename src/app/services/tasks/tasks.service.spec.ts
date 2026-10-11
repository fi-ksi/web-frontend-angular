import { TestBed } from '@angular/core/testing';

import { TasksService } from './tasks.service';
import { TaskWithIcon } from '../../models';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('minimizeEdgeCrossings', () => {
    const task = (id: number, prerequisities: number[] = []): TaskWithIcon =>
      ({ id, prerequisities } as TaskWithIcon);

    const taskMapOf = (levels: TaskWithIcon[][]): { [taskId: number]: TaskWithIcon } => {
      const map: { [taskId: number]: TaskWithIcon } = {};
      levels.forEach((level) => level.forEach((t) => { map[t.id] = t; }));
      return map;
    };

    it('reorders a level so that dependency arrows do not cross', () => {
      // A -> Y, B -> X ; input order [X, Y] draws two crossing arrows
      const a = task(1);
      const b = task(2);
      const x = task(3, [2]);
      const y = task(4, [1]);
      const levels = [[a, b], [x, y]];

      TasksService.minimizeEdgeCrossings(levels, taskMapOf(levels));

      expect(levels[1].map((t) => t.id)).toEqual([4, 3]);
    });

    it('propagates ordering through multiple levels', () => {
      // A -> X -> P, B -> Y -> Q ; crossed in both level 1 and level 2
      const a = task(1);
      const b = task(2);
      const x = task(3, [1]);
      const y = task(4, [2]);
      const p = task(5, [3]);
      const q = task(6, [4]);
      const levels = [[a, b], [y, x], [q, p]];

      TasksService.minimizeEdgeCrossings(levels, taskMapOf(levels));

      expect(levels[1].map((t) => t.id)).toEqual([3, 4]);
      expect(levels[2].map((t) => t.id)).toEqual([5, 6]);
    });

    it('keeps the relative order of tasks without known neighbours', () => {
      const a = task(1);
      const b = task(2);
      const x = task(3, [99]); // prerequisity not in the task map
      const y = task(4, [98]); // prerequisity not in the task map
      const levels = [[a, b], [x, y]];

      TasksService.minimizeEdgeCrossings(levels, taskMapOf(levels));

      expect(levels[0].map((t) => t.id)).toEqual([1, 2]);
      expect(levels[1].map((t) => t.id)).toEqual([3, 4]);
    });

    it('handles empty input', () => {
      expect(TasksService.minimizeEdgeCrossings([], {})).toEqual([]);
    });
  });
});

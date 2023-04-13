import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { BackendService, TasksService } from '../../../services';
import { BehaviorSubject, Observable } from 'rxjs';
import { Feedback } from '../../../../api/backend';
import { map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'ksi-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackComponent implements OnInit {
  @Input()
  feedbackId: number;

  @Input()
  taskId: number;

  feedback$: Observable<Feedback | null>;

  showFeedback$: Observable<boolean>;

  readonly filledNowSubject = new BehaviorSubject<boolean>(false);
  readonly filledNow$ = this.filledNowSubject.asObservable();

  readonly incompleteSubject = new BehaviorSubject<boolean>(false);
  readonly incomplete$ = this.incompleteSubject.asObservable();

  constructor(private backend: BackendService, private tasks: TasksService) { }

  ngOnInit(): void {
    this.feedback$ = this.tasks.cacheFeedbacks.get(this.feedbackId).pipe(
      map((feedback) => {
        if (feedback.filled) {
          return null;
        }

        if (!feedback.taskId) {
          feedback.taskId = this.taskId;
        }
        feedback.categories.forEach((c) => c.answer = c.answer !== undefined ? c.answer : (c.ftype === 'text_large' ? '' : -1));
        return feedback;
      }),
    );

    this.showFeedback$ = this.tasks.getTask(this.taskId).pipe(
      map((task) => task.state !== 'base' && task.state !== 'locked')
    );
  }

  sendFeedback(feedback: Feedback): void {
    if (feedback.categories.find((x) => x.answer === -1) !== undefined) {
      this.incompleteSubject.next(true);
      return;
    }

    this.tasks.cacheFeedbacks.set(this.feedbackId, { ...feedback, filled: true });
    const req$: Observable<unknown> = feedback.filled
      ? this.backend.http.feedbackEditSingle({feedback}, this.feedbackId)
      : this.backend.http.feedbackCreateNew({feedback});

    this.filledNowSubject.next(true);
    req$.pipe(mergeMap(() => this.tasks.cacheFeedbacks.refresh(this.feedbackId))).subscribe();
  }
}

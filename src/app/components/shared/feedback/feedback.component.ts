import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { BackendService } from '../../../services';
import { BehaviorSubject, Observable } from 'rxjs';
import { Feedback } from '../../../../api';
import { map, tap } from 'rxjs/operators';

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

  feedback$: Observable<Feedback>;

  readonly fillStatusSubject = new BehaviorSubject<'filled' | 'unfilled' | 'filledNow' | null>(null);
  readonly fillStatus$ = this.fillStatusSubject.asObservable();

  readonly incompleteSubject = new BehaviorSubject<boolean>(false);
  readonly incomplete$ = this.incompleteSubject.asObservable();

  constructor(private backend: BackendService) { }

  ngOnInit(): void {
    this.feedback$ = this.backend.http.feedbackGetSingle(this.feedbackId).pipe(
      map((x) => x.feedback),
      map((feedback) => {
        if (!feedback.taskId) {
          feedback.taskId = this.taskId;
        }
        feedback.categories.forEach((c) => c.answer = c.answer !== undefined ? c.answer : (c.ftype === 'text_large' ? '' : -1));
        return feedback;
      }),
      tap((feedback) => {
        this.fillStatusSubject.next(feedback.filled ? 'filled' : 'unfilled');
      })
    );
  }

  sendFeedback(feedback: Feedback): void {
    if (feedback.categories.find((x) => x.answer === -1) !== undefined) {
      this.incompleteSubject.next(true);
      return;
    }

    const req$: Observable<unknown> = feedback.filled
      ? this.backend.http.feedbackEditSingle({feedback}, this.feedbackId)
      : this.backend.http.feedbackCreateNew({feedback});

    this.fillStatusSubject.next('filledNow');
    req$.subscribe();
  }
}

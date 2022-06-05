import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  TemplateRef,
  Input,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subject } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ksi-modal-generic',
  templateUrl: './modal-generic.component.html',
  styleUrls: ['./modal-generic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalGenericComponent implements OnInit {
  @Input()
  modalTemplate: TemplateRef<unknown>;

  @Input()
  title: string;

  @Input()
  options?: ModalOptions;

  modalRef?: BsModalRef<unknown>;

  private visible = false;
  private visibleSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);

  readonly visible$ = this.visibleSubject.asObservable().pipe(shareReplay())

  @ViewChild('template', {static: true})
  template: TemplateRef<unknown>;

  constructor(
    private modalService: BsModalService,
    public cd: ChangeDetectorRef,
  ) { }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnInit(): void {
  }

  show(): void {
    if (this.visible) {
      return;
    }
    this.modalRef = this.modalService.show(this.template, this.options);
    environment.logger.debug('[MODAL] Setting modal as visible');
    this.visible = true;
    this.visibleSubject.next(true);
    this.modalRef.onHidden?.pipe(take(1)).subscribe(() => {
      this.visible = false;
      this.visibleSubject.next(false);
    });
  }

  close(): void {
    if (!this.visible) {
      return;
    }
    this.modalRef?.hide();
  }
}

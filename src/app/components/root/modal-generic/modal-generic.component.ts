import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  TemplateRef,
  Input,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { take } from "rxjs/operators";

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

  modalRef?: BsModalRef;

  private visible = false;
  private visibleSubject: Subject<boolean> = new Subject<boolean>();

  readonly visible$ = this.visibleSubject.asObservable();

  @ViewChild('template', {static: true})
  template: TemplateRef<unknown>;

  constructor(
    private modalService: BsModalService,
    public cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
  }

  show(): void {
    if (this.visible) {
      return;
    }
    this.visible = true;
    this.visibleSubject.next(true);
    this.modalRef = this.modalService.show(this.template);
    this.modalRef.onHidden!.pipe(take(1)).subscribe(() => {
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

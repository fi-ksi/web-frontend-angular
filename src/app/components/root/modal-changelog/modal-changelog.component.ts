import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { VersionService } from "../../../services";
import { combineLatest, Subscription } from "rxjs";
import { DateInputFormControl } from "../../../util";

@Component({
  selector: 'ksi-modal-changelog',
  templateUrl: './modal-changelog.component.html',
  styleUrls: ['./modal-changelog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalChangelogComponent implements OnInit, OnDestroy {

  modalRef?: BsModalRef;

  @ViewChild('template', {static: true})
  template: TemplateRef<unknown>;

  changes: { [category: string]: { date: Date, caption: string, type: 'feat' | 'fix' }[] } = {};
  changeCategories: string[];

  controlSince = new DateInputFormControl();

  private visible = false;

  private _subs: Subscription[] = [];

  private static readonly KEY_LAST_SHOWN_COMMIT_TIME = 'changelog/last-commit';

  constructor(
    private modalService: BsModalService,
    private version: VersionService,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this._subs.push(combineLatest([this.version.changelog$, this.controlSince.valueOuterChanges]).subscribe(([changelog, since]) => {
      if (!changelog) {
        return;
      }
      if (since === null) {
        since = new Date(0);
      }

      const reCommitMessage = /^(feat|fix)(?:\((.*?)\))?:\s+(.*)$/;

      this.changes = {};
      this.changeCategories = [];

      changelog
        .forEach((change) => {
            const {subject} = change;
            // filter out non fix/feat changes
            const reResult = reCommitMessage.exec(subject);
            if (!reResult) {
              return;
            }

            // filter out too old changes
            const date = new Date(change.commiter.date);
            if (date < since!) {
              return;
            }

            // sort changes by category
            const type = reResult[1] as 'fix' | 'feat';
            const category = reResult[2] || '';
            const caption = reResult[3];

            if (!(category in this.changes)) {
              this.changes[category] = [];
            }

            this.changes[category].push({
              date, type, caption
            })
          }
        );

      this.changeCategories = Object.keys(this.changes).sort();
      this.cd.markForCheck();
      if (this.changeCategories.length) {
        this.openModal();
      }
    }));

    // show last week worth of changes
    this.controlSince.setOuterValue(new Date(
      Number(localStorage.getItem(ModalChangelogComponent.KEY_LAST_SHOWN_COMMIT_TIME)) ||
      Date.now() - (7 * 24 * 3600 * 1000)
    ));
  }

  openModal() {
    if (this.visible) {
      return;
    }
    this.visible = true;
    const ref = this.modalRef = this.modalService.show(this.template);
    this._subs.push(ref!.onHide!.subscribe(() => {
      localStorage.setItem(ModalChangelogComponent.KEY_LAST_SHOWN_COMMIT_TIME, `${Date.now()}`);
      this.visible = false;
    }));
  }

  close(): void {
    this.modalRef?.hide();
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }
}

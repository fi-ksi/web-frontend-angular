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
import { VersionService, StorageService, UserService } from "../../../services";
import { combineLatest, concat, of, Subscription } from "rxjs";
import { DateInputFormControl } from "../../../util";
import { filter, skip, take } from "rxjs/operators";

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

  changes: { [category: string]: { date: Date, caption: string, type: 'feat' | 'fix' | 'patch' }[] } = {};
  changeCategories: string[];

  controlSince = new DateInputFormControl();

  private visible = false;

  private _subs: Subscription[] = [];

  private readonly storage = this.storageRoot.open('changelog');

  constructor(
    private modalService: BsModalService,
    private version: VersionService,
    private cd: ChangeDetectorRef,
    private storageRoot: StorageService,
    private user: UserService,
  ) {
  }

  ngOnInit(): void {
    const dateInitialSince = new Date(
      this.storage.get<number>('last-commit') ||
      Date.now() - (7 * 24 * 3600 * 1000)
    );

    this._subs.push(combineLatest([
      this.version.changelog$,
      concat(
        of(dateInitialSince),
        this.controlSince.valueOuterChanges.pipe(skip(1))
      )
    ]).subscribe(([changelog, since]) => {
      if (!changelog) {
        return;
      }
      if (since === null) {
        return;
      }

      const reCommitMessage = /^(feat|fix|patch)(?:\((.*?)\))?:\s+(.*)$/;

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
            const type = reResult[1] as 'fix' | 'feat' | 'patch';
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
        this.user.isTester$.pipe(filter((x) => x), take(1)).subscribe(() => this.openModal());
      }
    }));

    // show last week worth of changes
    this.controlSince.setOuterValue(dateInitialSince);
  }

  openModal() {
    if (this.visible) {
      return;
    }
    this.visible = true;
    const ref = this.modalRef = this.modalService.show(this.template);
    this._subs.push(ref!.onHide!.subscribe(() => {
      this.storage.set('last-commit', Date.now());
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

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService, ModalService, UserService, YearsService } from "../../../services";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'ksi-page-discussions',
  templateUrl: './page-discussions.component.html',
  styleUrls: ['./page-discussions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageDiscussionsComponent implements OnInit {
  constructor(
    public years: YearsService,
    private title: KsiTitleService,
    public user: UserService,
    private modal: ModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.title.subtitle = 'discussion.title';
  }

  newThread() {
    this.user.afterLogin$.subscribe(() => {
      const modal = this.modal.showPostReplyModal(null);
      modal.afterClose$.subscribe(() => {
        const {instance} = modal.component;
        if (instance.replied) {
          this.router.navigate([instance.threadId], {relativeTo: this.activatedRoute}).then();
        }
      });
    });
  }
}

import {Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef} from '@angular/core';
import {BackendService, KsiTitleService, ModalService} from '../../../services';
import {BehaviorSubject, Subject} from 'rxjs';
import {AdminInstanceConfig} from '../../../../api/backend';
import {OpenedTemplate} from '../../../models';

@Component({
  selector: 'ksi-page-admin-instance-config',
  templateUrl: './page-admin-instance-config.component.html',
  styleUrls: ['./page-admin-instance-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminInstanceConfigComponent implements OnInit {
  private configSubject: Subject<AdminInstanceConfig[]> = new BehaviorSubject(([] as AdminInstanceConfig[]));
  config$ = this.configSubject.asObservable();

  editedConfig: AdminInstanceConfig | null = null;
  @ViewChild('modalEditConfig', {static: true})
  modalEditConfig: TemplateRef<unknown>;
  modalEditConfigInstance: OpenedTemplate | null = null;

  constructor(
    private title: KsiTitleService,
    private backend: BackendService,
    private modal: ModalService
  ) { }

  ngOnInit(): void {
    this.title.subtitle = 'admin.root.instance-config.title';
    this.refreshConfig();
  }

  private refreshConfig(): void {
    this.backend.http.instanceConfigGetAll().subscribe((response) => {
      this.configSubject.next(response.config);
    });
  }

  editConfig(config: AdminInstanceConfig): void {
    this.editedConfig = config;
    this.modalEditConfigInstance = this.modal.showModalTemplate(this.modalEditConfig, 'admin.root.instance-config.edit-config');
  }

  saveConfig(editedConfig: AdminInstanceConfig | null): void {
    if (editedConfig) {
      this.editedConfig = null;
      this.backend.http.instanceConfigSetSingle(editedConfig).subscribe(() => {
        this.refreshConfig();
        this.modalEditConfigInstance?.template.instance.close();
        this.modalEditConfigInstance = null;
      });
    }
  }
}

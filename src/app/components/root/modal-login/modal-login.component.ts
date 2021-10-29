import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { ModalComponent } from "../../../models";
import { FormControl, Validators } from "@angular/forms";
import { BackendService } from "../../../services";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: 'ksi-modal-login',
  templateUrl: './modal-login.component.html',
  styleUrls: ['./modal-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalLoginComponent implements OnInit, ModalComponent {
  @ViewChild('template', {static: true})
  templateBody: TemplateRef<unknown>;

  title = 'modal.login.title';

  email = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);

  showErr$: Observable<boolean>;

  constructor(private backend: BackendService) { }

  ngOnInit(): void {
  }

  login(): false {
    if (!this.email.valid || !this.password.valid) {
      return false;
    }
    this.showErr$ = this.backend.login(this.email.value, this.password.value)
      .pipe(map((loginOk) => !loginOk));
    return false;
  }
}

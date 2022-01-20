import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { ModalComponent } from "../../../models";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { AddressService, ModalService } from "../../../services";

@Component({
  selector: 'ksi-modal-register',
  templateUrl: './modal-register.component.html',
  styleUrls: ['./modal-register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalRegisterComponent implements OnInit, OnDestroy, ModalComponent {
  @ViewChild('template', { static: true })
  templateBody: TemplateRef<unknown>;

  form = this.fb.group(({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordRepeat: [''],

    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    nick: [''],
    sex: ['', Validators.required],

    address: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: [null, Validators.required],

    schoolName: ['', Validators.required],
    schoolAddress: ['', Validators.required],
    schoolCity: ['', Validators.required],
    schoolPostalCode: ['', Validators.required],
    schoolCountry: [null, Validators.required],
    schoolEnd: [null, Validators.required],

    aboutMe: [''],  // not asked to be filled in
    shirtSize: ['NA'],

    tos: [false, Validators.requiredTrue],
  }));

  title = 'modal.register.title';

  optional$: Observable<string>;

  countries = AddressService.COUNTRIES;

  private _subs: Subscription[] = [];

  constructor(private fb: FormBuilder, private translate: TranslateService, private modal: ModalService) { }

  ngOnInit(): void {
    this.optional$ = this.translate.stream('modal.register.optional').pipe(map(() => this.translate.instant('modal.register.optional')));

    // add passwords same validator
    this.form.controls.passwordRepeat.addValidators((control) => {
      return control.value === this.form.controls.password.value ? null : {'not-same': 'not-same'};
    });
    this.form.controls.password.addValidators((_) => {
      this.form.controls.passwordRepeat.updateValueAndValidity();
      return null;
    });

    // sync countries when first selected
    const countryControls: AbstractControl[] = ['country', 'schoolCountry']
      .map((controlName) => this.form.controls[controlName]);
    countryControls
      .forEach((control) => {
        this._subs.push(control.valueChanges
          .subscribe((value) => {
            countryControls
              .filter((control2) => control2 !== control)
              .forEach((control2) => {
                if (control2.value !== value && control2.untouched) {
                  control2.setValue(value);
                }
              });
          }))
      });
  }

  onModalOpened(_: BsModalRef<unknown>): void {
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }

  openTOS(e: MouseEvent): false {
    e.preventDefault();
    this.modal.showTOSModal();
    return false;
  }

  register() {
    if (!this.form.valid) {
      return;
    }
  }
}

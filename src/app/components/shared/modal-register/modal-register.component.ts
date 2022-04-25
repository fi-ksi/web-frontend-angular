import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { ModalComponent } from "../../../models";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subscription } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { AddressService, BackendService, ModalService } from "../../../services";
import { RegistrationRequest } from "../../../../api";
import { environment } from "../../../../environments/environment";

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
    passwordRepeat: ['', Validators.required],

    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    nick: [undefined],
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

  errorMsg$: Observable<string>;

  countries = AddressService.COUNTRIES;

  registrationSuccessful = false;

  private _subs: Subscription[] = [];

  private modalRef: BsModalRef<unknown>;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private modal: ModalService,
    private backend: BackendService
  ) { }

  ngOnInit(): void {
    this.optional$ = this.translate.get('modal.register.optional');

    if (environment.disableRegistration) {
      this.errorMsg$ = this.translate.get('modal.register.disabled');
      this.form.disable();
    }

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

  onModalOpened(ref: BsModalRef<unknown>): void {
    this.modalRef = ref;
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
    if (!this.form.valid || this.form.disabled) {
      return;
    }
    this.form.disable();

    const req: RegistrationRequest = {
      email: this.form.controls.email.value,
      nick_name: this.form.controls.nick.value,
      first_name: this.form.controls.firstName.value,
      last_name: this.form.controls.lastName.value,
      gender: this.form.controls.sex.value,
      short_info: this.form.controls.aboutMe.value,
      addr_street: this.form.controls.address.value,
      addr_city: this.form.controls.city.value,
      addr_zip: this.form.controls.postalCode.value,
      addr_country: this.form.controls.country.value,
      school_name: this.form.controls.schoolName.value,
      school_street: this.form.controls.schoolAddress.value,
      school_city: this.form.controls.schoolCity.value,
      school_zip: this.form.controls.schoolPostalCode.value,
      school_country: this.form.controls.schoolCountry.value,
      school_finish: this.form.controls.schoolEnd.value,
      tshirt_size: this.form.controls.shirtSize.value,
      password: this.form.controls.password.value,
      referral: ''
    };

    const registration$ = this.backend.http.registerNewUser(req).pipe(shareReplay(1));

    this.errorMsg$ = registration$.pipe(map((response) => response?.error || ''));

    registration$.subscribe((response) => {
      if (response.error === undefined) {
        this.registrationSuccessful = true;
        this.modalRef.hide();
      } else {
        this.form.enable();
      }
    });
  }
}

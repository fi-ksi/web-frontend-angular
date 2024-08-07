import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { ModalComponent } from '../../../models';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AddressService, BackendService, ModalService } from '../../../services';
import { RegistrationRequest } from '../../../../api/backend';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ksi-modal-register',
  templateUrl: './modal-register.component.html',
  styleUrls: ['./modal-register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalRegisterComponent implements OnInit, ModalComponent {
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

    address: ['N/A', Validators.required],
    city: ['N/A', Validators.required],
    postalCode: ['N/A', Validators.required],
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

  readonly countries = AddressService.COUNTRIES;

  readonly countries_keys = AddressService.COUNTRIES_KEYS;

  readonly allowTestingAccountRegistration = environment.allowTestingAccountRegistration;

  registrationSuccessful = false;

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
  }

  onModalOpened(ref: BsModalRef<unknown>): void {
    this.modalRef = ref;
  }

  registerTestingAccount(): void {
    if (!this.allowTestingAccountRegistration) {
      return;
    }
    const number = Math.floor(Date.now() / 1000);

    this.form.patchValue({
      email: `quick-test-${number}@localhost`,
      nick: '[DEV]',
      firstName: 'Test',
      lastName: `${number}`,
      sex: Math.random() < 0.5 ? 'male' : 'female',
      aboutMe: '',
      address: 'Testing',
      city: 'City',
      postalCode: '4242',
      country: 'cz',
      schoolName: 'FI MU',
      schoolAddress: 'Botanicka 68a',
      schoolCity: 'Brno',
      schoolPostalCode: '602 00',
      schoolCountry: 'cz',
      schoolEnd: '2012',
      shirtSize: 'S',
      password: '123456',
      passwordRepeat: '123456',
      tos: true
    });

    this.register();
  }

  openTOS(e: MouseEvent): false {
    e.preventDefault();
    this.modal.showTOSModal();
    return false;
  }

  register(): void {
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
      referral: '',
      github: null,
      discord: null
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

  fillFIMU(): void {
    this.form.patchValue({
      schoolName: 'Fakulta informatiky Masarykovy univerzity',
      schoolAddress: 'Botanická 68a',
      schoolCity: 'Brno',
      schoolPostalCode: '602 00',
      schoolCountry: 'cz',
    });
  }
}

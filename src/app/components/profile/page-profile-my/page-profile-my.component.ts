import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AddressService, BackendService, IconService, RoutesService, UserService } from '../../../services';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, mapTo, mergeMap, shareReplay } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';
import { ProfileEdit } from '../../../../api/backend';
import { environment } from '../../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'ksi-page-profile-my',
  templateUrl: './page-profile-my.component.html',
  styleUrls: ['./page-profile-my.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageProfileMyComponent implements OnInit, OnDestroy {
  formProfile = this.fb.group(({
    email: ['', [Validators.required, Validators.email]],

    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    nick: [undefined],
    sex: ['', Validators.required],
    github: [''],
    discord: [''],

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
  }));

  formPassword = this.fb.group(({
    current: ['', [Validators.required]],
    new: ['', [Validators.required, Validators.minLength(6)]],
    repeat: ['', [Validators.required]],
  }));

  profileEditRequest$: Observable<unknown>;
  passwordEditSuccess$: Observable<boolean | null> | null = null;
  loadRequest$: Observable<unknown>;
  pictureUploadRequest$: Observable<unknown> | null = null;

  countries = AddressService.COUNTRIES;

  profilePicture$: Observable<string | null>;

  private _subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    public backend: BackendService,
    private user: UserService,
    private router: Router,
    private cd: ChangeDetectorRef,
    public icon: IconService,
    public routes: RoutesService,
    public route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.profilePicture$ = this.user.isLoggedIn$.pipe(
      mergeMap(() => this.backend.user$),
      // add timestamp to the image URL so that every time upon new image upload a fresh profile picture is loaded
      map((user) => user ? `${user.profile_picture}?${Date.now()}` : user)
    );

    // add passwords same validator
    this.formPassword.controls.repeat.addValidators((control) => {
      return control.value === this.formPassword.controls.new.value ? null : {'not-same': 'not-same'};
    });
    this.formPassword.controls.new.addValidators(() => {
      this.formPassword.controls.repeat.updateValueAndValidity();
      return null;
    });

    this._subs.push(this.user.isLoggedIn$.subscribe(() => this.loadProfile()));
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }

  private loadProfile(): void {
    this.formProfile.disable();
    (this.loadRequest$ = this.user.forceLogin$.pipe(
      mergeMap(() => this.backend.http.profileGetMy()),
      map((response) => response.profile)
    )).subscribe((profile) => {
      this.formProfile.patchValue({
        email: profile.email,
        nick: profile.nick_name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        sex: profile.gender,
        aboutMe: profile.short_info,
        address: profile.addr_street,
        city: profile.addr_city,
        postalCode: profile.addr_zip,
        country: profile.addr_country,
        schoolName: profile.school_name,
        schoolAddress: profile.school_street,
        schoolCity: profile.school_city,
        schoolPostalCode: profile.school_zip,
        schoolCountry: profile.school_country,
        schoolEnd: profile.school_finish,
        shirtSize: profile.tshirt_size,
        github: profile.github,
        discord: profile.discord
      });
      this.formProfile.enable();
      this.cd.markForCheck();
    });
    this.cd.markForCheck();
  }

  updateUserInfo(): void {
    if (!this.formProfile.valid || this.formProfile.disabled) {
      return;
    }
    this.formProfile.disable();

    const edit: ProfileEdit = {
      email: this.formProfile.controls.email.value,
      nick_name: this.formProfile.controls.nick.value,
      first_name: this.formProfile.controls.firstName.value,
      last_name: this.formProfile.controls.lastName.value,
      gender: this.formProfile.controls.sex.value,
      short_info: this.formProfile.controls.aboutMe.value,
      addr_street: this.formProfile.controls.address.value,
      addr_city: this.formProfile.controls.city.value,
      addr_zip: this.formProfile.controls.postalCode.value,
      addr_country: this.formProfile.controls.country.value,
      school_name: this.formProfile.controls.schoolName.value,
      school_street: this.formProfile.controls.schoolAddress.value,
      school_city: this.formProfile.controls.schoolCity.value,
      school_zip: this.formProfile.controls.schoolPostalCode.value,
      school_country: this.formProfile.controls.schoolCountry.value,
      school_finish: this.formProfile.controls.schoolEnd.value,
      tshirt_size: this.formProfile.controls.shirtSize.value,
      github: this.formProfile.controls.github.value,
      discord: this.formProfile.controls.discord.value
    };

    (this.profileEditRequest$ = this.backend.http.profileEditMy(edit).pipe(mapTo(undefined))).subscribe(() => {
      this.formProfile.enable();
      this.backend.refreshUser();
    });
  }

  uploadProfilePicture(event: Event): void {
    const el: HTMLInputElement = event.target as HTMLInputElement;
    const file = el.files?.item(0);
    if (file === null || file === undefined) {
      return;
    }

    el.value = '';

    (this.pictureUploadRequest$ = this.backend.http.profileUploadPictureForm(file))
      .subscribe(() => {
        this.backend.refreshUser();
        this.pictureUploadRequest$ = null;
        this.cd.markForCheck();
      });
    this.cd.markForCheck();
  }

  changePassword(): void {
    if (!this.formPassword.valid || this.formPassword.disabled) {
      return;
    }
    this.formPassword.disable();

    (this.passwordEditSuccess$ = this.backend.http.changePassword({
      old_password: this.formPassword.controls.current.value,
      new_password: this.formPassword.controls.new.value,
      new_password2: this.formPassword.controls.repeat.value,
    }).pipe(
      map((result) => result.result === 'ok'),
      catchError((resp) => {
        if (resp.status === 400 || resp.status === 401) {
          // Wrong current password
          environment.logger.debug('auth failed for changing password', resp);
          return of(false);
        }
        // Some other error
        throw new HttpErrorResponse({error: resp});
      }),
      shareReplay(1)
    )).subscribe((ok) => {
      if (ok) {
        this.formPassword.setValue({
          current: '',
          new: '',
          repeat: ''
        });
        this.formPassword.markAsPristine();
      }
      this.formPassword.enable();
    });
  }
}

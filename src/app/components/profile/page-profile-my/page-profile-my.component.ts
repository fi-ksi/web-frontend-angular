import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AddressService, BackendService, IconService, UserService } from "../../../services";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { map, mapTo, mergeMap } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { ProfileEdit } from "../../../../api";

@Component({
  selector: 'ksi-page-profile-my',
  templateUrl: './page-profile-my.component.html',
  styleUrls: ['./page-profile-my.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageProfileMyComponent implements OnInit, OnDestroy {
  form = this.fb.group(({
    email: ['', [Validators.required, Validators.email]],

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
  }));

  editRequest$: Observable<void>;
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
    public icon: IconService
  ) {
  }

  ngOnInit(): void {
    this.profilePicture$ = this.user.isLoggedIn$.pipe(
      mergeMap(() => this.backend.user$),
      // add timestamp to the image URL so that every time upon new image upload a fresh profile picture is loaded
      map((user) => user ? `${user.profile_picture}?${Date.now()}` : user)
    );
    this._subs.push(this.user.isLoggedIn$.subscribe(() => this.loadProfile()));
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }

  private loadProfile(): void {
    this.form.disable();
    (this.loadRequest$ = this.user.forceLogin$.pipe(
      mergeMap(() => this.backend.http.profileGetMy()),
      map((response) => response.profile)
    )).subscribe((profile) => {
      this.form.patchValue({
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
      });
      this.form.enable();
      this.cd.markForCheck();
    });
    this.cd.markForCheck();
  }

  updateUserInfo(): void {
    if (!this.form.valid || this.form.disabled) {
      return;
    }
    this.form.disable();

    const edit: ProfileEdit = {
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
    };

    (this.editRequest$ = this.backend.http.profileEditMy(edit).pipe(mapTo(undefined))).subscribe(() => {
      this.form.enable();
      this.backend.refreshUser();
    });
  }

  uploadProfilePicture(event: Event) {
    const el: HTMLInputElement = event.target as HTMLInputElement;
    if (!(el.files?.length)) {
      return;
    }

    const file = el.files.item(0);
    el.value = '';

    (this.pictureUploadRequest$ = this.backend.http.profileUploadPictureForm(file!))
      .subscribe(() => {
        this.backend.refreshUser();
        this.pictureUploadRequest$ = null;
        this.cd.markForCheck();
      });
    this.cd.markForCheck();
  }
}

import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { User, Wave, WaveCreationRequest } from 'src/api/backend';
import { IconService, ModalService, RoutesService, YearsService } from 'src/app/services';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';
import { AdminBaseEditComponent } from '../../base/admin-edit-base.component';

@Component({
  selector: 'ksi-page-admin-waves-edit',
  templateUrl: './page-admin-waves-edit.component.html',
  styleUrls: ['./page-admin-waves-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PageAdminWavesEditComponent extends AdminBaseEditComponent<Wave> implements OnInit {
  form = this.fb.group({
    index: [0, [Validators.required]],
    caption: ["", [Validators.required]],
    time_published: [null, [Validators.required]],
    garant: [null, [Validators.required]],
    year: [this.years.selected?.id]
  });
  date_fields_to_fix: string[] = ['time_published'];

  @ViewChild('timePublishedInput') timePublishedInput: ElementRef<HTMLInputElement>;
  adminUsers$: Observable<User[]>;

  createFunction = () => this.adminWavesService.createWave({ wave: this.form.value as WaveCreationRequest['wave'] });
  updateFunction = () => this.adminWavesService.updateWave({ wave: this.form.value as WaveCreationRequest['wave'] }, this.itemId);
  loadItemFunction = (itemId: number) => this.adminWavesService.getWaveById(itemId).pipe(map(response => response?.wave!));

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    public router: Router,
    public fb: FormBuilder,
    public cdRef: ChangeDetectorRef,
    public modal: ModalService,
    public adminWavesService: AdminWavesService
  ) {
    super(router, routes, modal, cdRef);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.adminUsers$ = this.years.organisators$.pipe(
      shareReplay(1)
    );

    let sub = this.adminWavesService.getWaves().pipe(
      map(res => res.waves.length + 1)
    ).subscribe(idx => {
      this.form.patchValue({ index: idx });
    });

    this.subscriptions.push(sub);
  }

  onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const isoDate = input.value ? new Date(input.value).toISOString() : null;
    this.form.patchValue({ time_published: isoDate });
  }
}
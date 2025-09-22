import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { User, WaveCreationRequest } from 'src/api/backend';
import { EditMode } from 'src/app/models/EditMode';
import { IconService, RoutesService, YearsService } from 'src/app/services';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ksi-page-admin-waves-edit',
  templateUrl: './page-admin-waves-edit.component.html',
  styleUrls: ['./page-admin-waves-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageAdminWavesEditComponent implements OnInit {
  editMode: EditMode;
  EditMode = {
    New: 'New',
    Edit: 'Edit'
  };

  @ViewChild('timePublishedInput') timePublishedInput: ElementRef<HTMLInputElement>;

  form = this.fb.group({
    index: [7, [Validators.required]],
    caption: ["", [Validators.required]],
    time_published: [null, [Validators.required]], // Store as ISO string
    garant: [null, [Validators.required]],
    year: [this.years.selected?.id] // User won't set this - it's for better DevEx when submitting
  });

  adminUsers$: Observable<User[]>;
  waveId: number;

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    public router: Router,
    public fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private adminWavesService: AdminWavesService
  ) { }

  ngOnInit(): void {
    this.waveId = Number.parseInt(this.router.url.split('/').pop() || '0', 10);

    this.editMode = this.waveId == 0 ? EditMode.New : EditMode.Update;
    this.adminUsers$ = this.years.organisators$.pipe(
      shareReplay(1)
    );

    if (this.editMode === EditMode.Update) {
      const waveId = Number.parseInt(this.router.url.split('/').pop() || '', 10);
      this.adminWavesService.getWaveById(waveId).subscribe(waveResponse => {
        if (waveResponse) {
          this.form.patchValue(waveResponse.wave);
          (this.timePublishedInput.nativeElement as HTMLInputElement).value = new Date(waveResponse.wave.time_published as string).toISOString().split('T')[0];
        } else {
          alert('Wave not found. Redirecting to the waves list.');
          this.router.navigate(['/', this.routes.routes.admin._, this.routes.routes.admin.waves._]);
          return;
        }

      }, error => {
        console.error('Error fetching wave data:', error);
        alert('Failed to load wave data. Please try again.');
      });
    }

  }

  onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const isoDate = input.value ? new Date(input.value).toISOString() : null;
    this.form.patchValue({ time_published: isoDate });
  }

  save() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const waveData: WaveCreationRequest = { wave: this.form.value as WaveCreationRequest['wave'] };

    if (this.editMode === EditMode.New) {
      this.adminWavesService.createWave(waveData).subscribe(() => {
        this.router.navigate(['/', this.routes.routes.admin._, this.routes.routes.admin.waves._]);
      }, error => {
        console.error('Error creating wave:', error);
        alert('Failed to create wave. Please try again.');
      });
    } else {
      this.adminWavesService.updateWave(waveData, this.waveId).subscribe(() => {
        this.router.navigate(['/', this.routes.routes.admin._, this.routes.routes.admin.waves._]);
      }, error => {
        console.error('Error updating wave:', error);
        alert('Failed to update wave. Please try again.');
      });
    }
  }

}

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AdminBaseEditComponent } from '../../base/admin-edit-base.component';
import { IconService } from 'src/app/services/shared/icon.service';
import { RoutesService } from 'src/app/services/shared/routes.service';
import { ModalService } from 'src/app/services';
import { Router } from '@angular/router';
import { Achievement } from 'src/api/backend';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminAchievementsService } from 'src/app/services/admin/admin-achievements.service';

@Component({
  selector: 'ksi-page-admin-achievements-edit',
  templateUrl: './page-admin-achievements-edit.component.html',
  styleUrls: ['./page-admin-achievements-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageAdminAchievementsEditComponent extends AdminBaseEditComponent<Achievement> {
    form = this.fb.group({
    active: [false], // Idk what this means, but ill keep it here 
    description: ["", [Validators.required]],
    persistent: [false],
    picture: [""],
    title: ["", [Validators.required]],
    year: [null],
  });

  createFunction = () => this.achievementsService.createAchievement({ achievement: this.form.value as Achievement });
  updateFunction = () => this.achievementsService.updateAchievement({ achievement: this.form.value as Achievement }, this.itemId);
  loadItemFunction = (itemId: number) => this.achievementsService.getAchievementById(itemId).pipe();

  images: any;

  constructor(
    public icon: IconService,
    public router: Router,
    public routes: RoutesService,
    protected cdr: ChangeDetectorRef,
    public fb: FormBuilder,
    protected modal: ModalService,
    public cdRef: ChangeDetectorRef,
    public achievementsService: AdminAchievementsService
  ) {
    super(router, routes, modal, cdRef);
    this.loadFiles();
  }


  loadFiles(): void {
    this.achievementsService.getAllAchievementImages().subscribe(files => {
      this.images = files || [];
      this.cdRef.markForCheck();
    });
  }

  deleteFile(file: any) {
    this.modal.yesNo('Delete file? If other achievements are using this image, it will be removed from them too!', false).subscribe(confirmed => {
      if (confirmed) {
        this.achievementsService.deleteAchievementImage(file.name).subscribe(() => {
          this.loadFiles();
        });
      }
    });
  }

  makeThumbnail(filename: string) {
    this.form.patchValue({ picture: this.getImageUrl(filename) });
  }

  getImageUrl(filename: string): string {
    return `http://localhost:3030/content/achievements/${filename}`;
  }

  uploadFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (event: any) => {
      let files = event.target.files;
      files = Array.from(files);
      files.forEach((element: any) => {
        console.log(element)
      });
      this.achievementsService.uploadAchievementImage(files).subscribe(() => {
        console.log("Files uploaded successfully");
        this.loadFiles();
      });
    };
    fileInput.click();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}

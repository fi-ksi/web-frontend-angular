import { ChangeDetectorRef, ElementRef } from '@angular/core';

export interface TaskPanel {
  title: string;
  content: string;
  cd: ChangeDetectorRef;
  el: ElementRef;
}

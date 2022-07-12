import { ChangeDetectorRef, ElementRef } from '@angular/core';

export interface TaskPanel<T> {
  title: string;
  content: string;
  cd: ChangeDetectorRef;
  el: ElementRef;
  data?: T;
}

export interface TaskTipData {
  author: number | null;
}

export interface TaskCollapsibleData {
  trustedContent: boolean;
}

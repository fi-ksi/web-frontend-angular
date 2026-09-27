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
  /**
   * Explicit image to show instead of the author's profile picture.
   * Can be a task-relative `data/...` path (rewritten to a real URL on
   * deploy, same as any other task asset) or a full URL.
   */
  image?: string | null;
}

export interface TaskCollapsibleData {
  trustedContent: boolean;
  initialOpen: boolean;
  collapsible: boolean;
}

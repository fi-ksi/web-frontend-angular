import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ThemeService, ModalService } from './services';

@Component({
  selector: 'ksi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private theme: ThemeService, private modal: ModalService, private container: ViewContainerRef) {
  }

  ngOnInit(): void {
    this.modal.container = this.container;

    /*
    Initialize PDF-JS config before first usage, according to
    https://github.com/VadimDez/ng2-pdf-viewer/blob/HEAD/README.md#set-custom-path-to-the-worker
     */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).pdfWorkerSrc = '/assets/scripts/pdf.worker.min.js';

    /*
    Initialize MathJax config before first usage, according to
    https://docs.mathjax.org/en/latest/web/configuration.html#using-a-local-file-for-configuration
     */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).MathJax = {
      svg: {
        fontCache: 'global'
      }
    };
  }
}

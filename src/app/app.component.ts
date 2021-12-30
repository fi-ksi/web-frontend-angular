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
    this.theme.setLightTheme();
    this.modal.container = this.container;

    /*
    Initialize MathJax config before first usage, according to
    https://docs.mathjax.org/en/latest/web/configuration.html#using-a-local-file-for-configuration
     */
    // @ts-ignore
    window.MathJax = {
      svg: {
        fontCache: 'global'
      }
    };
  }
}

import { Component, OnInit } from '@angular/core';
import { ThemeService } from "./services/theme.service";

@Component({
  selector: 'ksi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private theme: ThemeService) {
  }

  ngOnInit(): void {
    this.theme.setLightTheme();
  }

  title = 'web-frontend-angular';
}

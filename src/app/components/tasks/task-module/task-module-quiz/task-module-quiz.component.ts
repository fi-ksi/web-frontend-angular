import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ModuleQuiz } from "../../../../../api";
import { ModuleService } from "../../../../services";

@Component({
  selector: 'ksi-task-module-quiz',
  templateUrl: './task-module-quiz.component.html',
  styleUrls: ['./task-module-quiz.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleQuizComponent implements OnInit {
  @Input()
  module: ModuleQuiz;

  inputs: boolean[][];

  constructor(private moduleService: ModuleService) { }

  ngOnInit(): void {
    this.inputs = this.module.questions
      .map((question) => question.options
        .map(
          () => false
        )
      );
  }

  submit(): void {
    this.moduleService.submit(this.module, this.inputs
      .map((row) => row
        .map((checked, index) => {console.log(checked, index); return checked;})
        .map((checked, index) => checked ? `${index}` : '')
        .filter((x) => !!x))
    );
  }

  setChecked(event: Event, y: number, x: number) {
    this.inputs[y][x] = (event.target as HTMLInputElement).checked;
  }
}

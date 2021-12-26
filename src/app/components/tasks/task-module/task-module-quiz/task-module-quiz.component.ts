import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ModuleQuiz, ModuleQuizQuestions } from "../../../../../api";
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
        .map((checked, index) => checked ? `${index}` : '')
        .filter((x) => !!x))
    );
  }

  setChecked(event: Event, type: ModuleQuizQuestions.TypeEnum, questionGroup: number, optionIndex: number) {
    if (type === "radio") {
      // if the question is radio button, uncheck everything within given group
      this.inputs[questionGroup] = this.inputs[questionGroup].map(() => false);
    }
    this.inputs[questionGroup][optionIndex] = (event.target as HTMLInputElement).checked;
  }
}

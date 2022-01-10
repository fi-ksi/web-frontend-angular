import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { User } from "../../../api";

@Pipe({
  name: 'translateSkillLevel'
})
export class TranslateSkillLevelPipe implements PipeTransform {
  constructor(private translate: TranslateService) {
  }

  transform(user: User): string {
    let skill = 'none';
    const ksiSeasons = user.seasons?.length || 0;
    if (ksiSeasons <= 1) {
      skill = 'novice';
    } else if (ksiSeasons <= 2) {
      skill = 'skilled';
    } else if (ksiSeasons <= 3) {
      skill = 'master';
    } else if (ksiSeasons <= 5) {
      skill = 'veteran';
    }

    return `${this.translate.instant(`user.skill.${skill}.${user.gender}`)}`;
  }

}

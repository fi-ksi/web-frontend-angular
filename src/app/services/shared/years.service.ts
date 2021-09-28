import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { YearSelect } from "../../models";
import { Year } from "../../../api";
import { map, tap } from "rxjs/operators";
import { BackendService } from "./backend.service";

@Injectable({
  providedIn: 'root'
})
export class YearsService {
  get selected(): YearSelect | null {
    return this._selected;
  }

  set selected(value: YearSelect | null) {
    this._selected = value;
    this.selectedSubject.next(value);

    if (value) {
      localStorage.setItem(YearsService.STORAGE_SELECTED_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(YearsService.STORAGE_SELECTED_KEY);
    }
  }

  selected$: Observable<YearSelect | null>;

  all$: Observable<Year[]>;

  private selectedSubject: Subject<YearSelect | null>;
  private _selected: YearSelect | null;
  private static readonly STORAGE_SELECTED_KEY = 'years/selected';

  constructor(private backend: BackendService) {
    const savedYearString = localStorage.getItem(YearsService.STORAGE_SELECTED_KEY);
    const savedYearValue: YearSelect | null = savedYearString ? JSON.parse(savedYearString) : null;
    this.selectedSubject = new BehaviorSubject(savedYearValue);
    this._selected = savedYearValue;

    this.selected$ = this.selectedSubject.asObservable();

    this.all$ = this.backend.http.yearsGetAll().pipe(
      // sort years by index DESC
      map((resp) => resp.years.sort((a, b) => b.id - a.id)),
      tap((years) => {
        // if no year is selected, select the one with the highest index
        if (years && !this.selected) {
          this.selected = years[0];
        }
      })
    );
  }
}

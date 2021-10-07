import { MappedFormControl } from "./mapped-form-control";
import { ValidatorFn } from "@angular/forms";

export class DateInputFormControl extends MappedFormControl<Date | null, string | null> {
  constructor(value?: Date, validators?: ValidatorFn[]) {
    super(DateInputFormControl.__date_to_string, DateInputFormControl.__string_to_date, value, validators);
  }

  private static __zero_pad(n: number): string {
    return `${n < 10 ? '0' : ''}${n}`;
  }

  private static __date_to_string(date: Date | null): string {
    return date ? `${date.getFullYear()}-${DateInputFormControl.__zero_pad(date.getMonth() + 1)}-${DateInputFormControl.__zero_pad(date.getDate())}`: '';
  }

  private static __string_to_date(value: string | null): Date | null {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
}

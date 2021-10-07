import { FormControl, ValidatorFn } from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

type MappingFunction<A, B> = (value: A) => B;
type WriteValueOptions = { onlySelf?: boolean | undefined; emitEvent?: boolean | undefined; emitModelToViewChange?: boolean | undefined; emitViewToModelChange?: boolean | undefined; } | undefined;

export class MappedFormControl<Outer, Inner> extends FormControl {
  private readonly _mappingFunctionForward: MappingFunction<Outer, Inner>;
  private readonly _mappingFunctionBackward: MappingFunction<Inner, Outer>;
  private _valueOuterChanges: Observable<Outer>;

  public valueChanges: Observable<Inner>;
  public value: Inner;

  get valueOuterChanges(): Observable<Outer> {
    if (!this._valueOuterChanges) {
      this._valueOuterChanges = this.valueChanges.pipe(map((val) => this._mappingFunctionBackward(val)));
    }
    return this._valueOuterChanges;
  }

  public get valueOuter(): Outer {
    return this._mappingFunctionBackward(super.value);
  }

  constructor(
    mappingFunctionForward: MappingFunction<Outer, Inner>,
    mappingFunctionBackward: MappingFunction<Inner, Outer>,
    initialValue?: unknown,
    validators?: ValidatorFn[],
  ) {
    super(initialValue, validators);
    this._mappingFunctionForward = mappingFunctionForward;
    this._mappingFunctionBackward = mappingFunctionBackward;
  }

  public setValue(value: Inner, options?: WriteValueOptions): void {
    super.setValue(value, options);
  }

  public patchValue(value: Inner, options?: WriteValueOptions): void {
    super.patchValue(value, options);
  }

  public setOuterValue(value: Outer, options?: WriteValueOptions): void {
    this.setValue(this._mappingFunctionForward(value), options);
  }

  public patchOuterValue(value: Outer, options?: WriteValueOptions): void {
    super.patchValue(this._mappingFunctionForward(value), options);
  }
}

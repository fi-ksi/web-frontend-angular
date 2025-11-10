import { ChangeDetectorRef, Directive, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { EditMode } from "src/app/models/EditMode";
import { ModalService, RoutesService } from "src/app/services";


@Directive()
export abstract class AdminBaseEditComponent<TItem> implements OnInit, OnDestroy {
    // Needed to be set in descendant components
    form: FormGroup;
    loadItemFunction: (itemId: number) => Observable<TItem>;
    createFunction: () => Observable<any>;
    updateFunction: () => Observable<any>;

    // Can be used in descendant components
    itemId: number;
    editMode: EditMode;
    baseRoute: string[];
    date_fields_to_fix: string[] = []; // Names of date fields to fix on load (default ISO format doesnt display correctly in date input)
    subscriptions: Subscription[] = []; // With automatic unsubscription in ngOnDestroy

    EditMode = {
        New: 'New',
        Edit: 'Edit'
    };

    constructor(
        protected router: Router,
        protected routes: RoutesService,
        protected modal: ModalService,
        protected cdr: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.baseRoute = ['/', this.routes.routes.admin._, this.router.url.split('/')[2]];

        this.itemId = Number.parseInt(this.router.url.split('/').pop() || '0', 10);
        this.editMode = this.itemId == 0 ? EditMode.New : EditMode.Update;

        if (this.editMode === EditMode.Update) {
            const sub = this.loadItemFunction(this.itemId).subscribe({
                next: (item) => {
                    this.form.patchValue(item!);
                    this.fixDateInput();
                    this.cdr.markForCheck();
                    sub.unsubscribe();
                },
                error: () => {
                    this.modal.yesNo("admin.shared.not-found-redirection").pipe().subscribe(yes => {
                        if (!!yes) {
                            this.router.navigate(this.baseRoute);
                        }
                    });
                    sub.unsubscribe();
                }
            });
        }
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const saveOperation = this.editMode === EditMode.New
            ? this.createFunction()
            : this.updateFunction();


        let sub = saveOperation.subscribe({
            next: () => {
                this.router.navigate(this.baseRoute);
            },
            error: (err) => {
                console.error('Error while saving:', err);
                this.modal.yesNo(`Failed to save year. Do you want to try again?`).pipe()
                    .subscribe(yes => {
                        if (!yes) {
                            this.router.navigate(['/', this.routes.routes.admin._, this.routes.routes.admin.years._]);
                        } else {
                            this.save();
                        }
                    });
            }
        });

        this.subscriptions.push(sub);
    }

    fixDateInput(): void {
        this.date_fields_to_fix.forEach(prop => {
            const dateValue = this.form.get(prop)?.value;
            if (dateValue) {
                // From ISO string to YYYY-MM-DD
                const fixedDate = dateValue.split('T')[0];
                this.form.patchValue({ [prop]: fixedDate });
            }
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}


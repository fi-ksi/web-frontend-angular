import { ChangeDetectorRef, Directive, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { ModalService } from "src/app/services";

@Directive()
export abstract class AdminBaseComponent<TItem> implements OnInit, OnDestroy {
    // Needed to be set in descendant components
    loadItemsFunction: () => Observable<TItem[]>;
    deleteFunction: (itemId: number) => Observable<any>;
    
    // Can be used in descendant components
    items: Observable<TItem[]>;
    subscriptions: Subscription[] = []; // With automatic unsubscription in ngOnDestroy

    constructor(
        protected modal: ModalService,
        protected cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.reloadItems();
    }

    reloadItems(): void {
        this.items = this.loadItemsFunction();
        this.cdr.markForCheck();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    deleteItem(itemId: number): void {
        const sub = this.modal.yesNo('admin.shared.delete-confirmation').subscribe(yes => {
            if (yes) {
                const deleteSub = this.deleteFunction(itemId).subscribe({
                    next: () => {
                        this.reloadItems();
                        deleteSub.unsubscribe();
                    }
                });
            }
            sub.unsubscribe();
        });
    }

    notImplemented(): void {
        alert(`Feature is not implemented yet.`);
    }
}
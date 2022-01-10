import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ModalService } from "../shared/modal.service";

@Injectable({
  providedIn: 'root'
})
export class HTTPErrorHandlerService implements HttpInterceptor {
  private modal: ModalService;

  constructor(private router: Router, private injector: Injector) {
    setTimeout(() => this.modal = this.injector.get(ModalService));
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 403) {
            const position = {
              path: location.pathname,
            }

            setTimeout(() => {
              this.router.navigate(['/', '403'], {
                fragment: position.path
              }).then();
            })
          } else if (Math.floor(error.status / 100) === 5) {
            this.modal.showServerErrorModal();
          }
        }

        return throwError(error);
      })
    );
  }
}

import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ModalService } from '../shared';
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HTTPErrorHandlerService implements HttpInterceptor {
  private modal: ModalService;

  constructor(private router: Router, private injector: Injector) {
    window.setTimeout(() => this.modal = this.injector.get(ModalService));
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error) => {
        // ignore EduLint-related errors
        if (error instanceof HttpErrorResponse && !req.url.startsWith(environment.edulint.url)) {
          const position = {
            path: location.pathname,
          };
          if (error.status === 404) {
            window.setTimeout(() => {
              this.router.navigate(['/', `${error.status}`], {
                fragment: position.path
              }).then();
            });
          } else if (error.status === 0 || Math.floor(error.status / 100) === 5) {
            this.modal.showServerErrorModal();
          }
        }
        return throwError(error);
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, pipe, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(req.url);
    if (!req.url.includes('oauth/token')) {
      const modifiedReq = req.clone({ headers: req.headers.append('Authorization', 'Bearer ' + this.authService.getAccessToken()) })
      return next.handle(modifiedReq);
    }
    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if (event instanceof HttpResponse) {
        }
      }
    },
      (error: any) => {
        if (error instanceof HttpErrorResponse) {
          switch ((<HttpErrorResponse>error).status) {
            case 400:
              return this.handle400Error(error);
            case 401:
              return this.handle401Error(error, req, next);
          }
        } else {
          return throwError(error);
        }
      }));
  }

  handle400Error(error) {
    if (error && error.status === 400 && error.error && error.error.error === 'invalid_grant') {
      // If we get a 400 and the error message is 'invalid_grant', the token is no longer valid so logout.
      return this.authService.logout();
    }
  }

  handle401Error(error: HttpErrorResponse, req: HttpRequest<any>, next: HttpHandler) {
    this.authService.logout();
    this.router.navigateByUrl('/login');
    return throwError(error);
  }

}

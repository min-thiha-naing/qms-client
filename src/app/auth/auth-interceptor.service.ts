import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(req.url);
    if (!req.url.includes('oauth/token')) {
      const modifiedReq = req.clone({ headers: req.headers.append('Authorization', 'Bearer ' + this.authService.getAccessToken()) })
      return next.handle(modifiedReq);
    }
    return next.handle(req);
  }

}

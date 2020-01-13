import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements Resolve<any> {

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  authenticate(user: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(environment.oauth2ClientID + ':' + environment.oauth2ClientPassword)
      })
    };
    const body = new HttpParams()
      .set('username', user.username)
      .set('password', user.password)
      .set('grant_type', 'password');

    return this.http.post<any>(environment.rootUrl + '/oauth/token', body.toString(), httpOptions)
      .pipe(tap(res => {
        console.log(user.name);
        sessionStorage.setItem('USER', user.name);
        sessionStorage.setItem('ACCESS_TOKEN', res.access_token);
        sessionStorage.setItem('REFRESH_TOKEN', res.refresh_token);
      }
      ))
  }

  getAccessToken(){
    return sessionStorage.getItem('ACCESS_TOKEN');
  }

  logout(){
    sessionStorage.clear();
    this.router.navigateByUrl('/login');
  }

  resolve(route: import("@angular/router").ActivatedRouteSnapshot, state: import("@angular/router").RouterStateSnapshot) {
    return this.getTerminal();
  }

  getTerminal() {
    return this.http.get('api/terminal')
      .pipe(tap((terminal: any) => {
        sessionStorage.setItem('terminalId', terminal.terminalId);
      }));
  }

}

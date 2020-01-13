import { Injectable, OnDestroy } from '@angular/core';
import { Client, over, Message, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable, from } from 'rxjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { filter, first, switchMap } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketClientService implements OnDestroy{
  
  private client: Client;
  private state: BehaviorSubject<SocketClientState>;

  constructor(
    private authService: AuthService,
  ) {
    this.client = over(new SockJS(environment.rootUrl + '/qms' + '?access_token=' + this.authService.getAccessToken()));
    this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);
    this.client.connect({}, () => {
      this.state.next(SocketClientState.CONNECTED);
    });
  }

  private connect(): Observable<Client> {
    return new Observable<Client>(observer => {
      this.state.pipe(filter(state => state === SocketClientState.CONNECTED)).subscribe(() => {
        observer.next(this.client);
      });
    });
  }

  static jsonHandler(message: Message): any {
    return JSON.parse(message.body);
  }
  
  static textHandler(message: Message): string {
    return message.body;
  }

  onMessage(topic: string, handler = SocketClientService.jsonHandler): Observable<any> {
    return this.connect().pipe(first(), switchMap(client => {
      return new Observable<any>(observer => {
        const subscription: StompSubscription = client.subscribe(topic, message => {
          observer.next(handler(message));
        });
        return () => client.unsubscribe(subscription .id);
      });
    }));
  }

  onPlainMessage(topic: string): Observable<string> {
    return this.onMessage(topic, SocketClientService.textHandler);
  }

  send(topic: string, payload: any): void {
    this.connect()
      .pipe(first())
      .subscribe(client => client.send(topic, {}, JSON.stringify(payload)));
  }
  

  ngOnDestroy(): void {
    this.connect().pipe(first()).subscribe(client => client.disconnect(null));
  }
}

export enum SocketClientState {
  ATTEMPTING, CONNECTED
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';


@Injectable({
  providedIn: 'root'
})
export class Websocket {
  private websocket!:WebSocketSubject<any>;

  private _notifications = new BehaviorSubject<any | null>(null);
  notifications$ = this._notifications.asObservable();
  
  constructor(){
    this.websocket = webSocket('ws://localhost:4000/')
    this.initSocket();
  }
  initSocket(){
    this.websocket.subscribe({
      next: msg => {
        console.log(msg)
        if (msg.type === 'file_status' || msg.type === 'transfer_status')  {
          this._notifications.next(msg); // just forward the notification
        }
      }, // Called whenever there is a message from the server.
      error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
    });
  }

  sendMSG(data:any){
    this.websocket.next(data);
  }
}

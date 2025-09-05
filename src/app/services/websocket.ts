import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';


@Injectable({
  providedIn: 'root'
})
export class Websocket {
  private websocket!:WebSocketSubject<any>;
  constructor(){
    this.websocket = webSocket('ws://192.168.11.218:4200')
    this.initSocket();
  }
  initSocket(){
    this.websocket.subscribe({
      next: msg => console.log('message received: ' + msg), // Called whenever there is a message from the server.
      error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
    });
  }

  sendMSG(data:any){
    this.websocket.next(data);
  }
}

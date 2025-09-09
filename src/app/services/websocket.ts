import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';


@Injectable({
  providedIn: 'root'
})
export class Websocket {
  private websocket!:WebSocketSubject<any>;
  constructor(){
    this.websocket = webSocket('ws://localhost:4000/')
    this.initSocket();
  }
  initSocket(){
    this.websocket.subscribe({
      next: msg => console.log('message received: ' + JSON.stringify(msg)), // Called whenever there is a message from the server.
      error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
    });
    this.sendMSG({data:'asdsadasd'})
  }

  sendMSG(data:any){
    this.websocket.next(data);
  }
}

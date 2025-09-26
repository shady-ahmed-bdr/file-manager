import { WebSocketServer } from 'ws';
import WebSocket from 'ws';


export const WSS = new WebSocketServer({ noServer: true })

let clientSocket: WebSocket [] = [];

WSS.on('connection', (ws, request) => {
    console.log('Client connected');
    clientSocket.push(ws)
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        const msg = JSON.parse(message.toString());
        ws.send(JSON.stringify({ echo: msg }));
    });

    ws.on('close', () => {
      clientSocket = clientSocket.filter(s => s !== ws);
      console.log('Client disconnected');
    });
});



export function sendToClient(data: any) {
  clientSocket.forEach((ws)=>{
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      console.warn('No active WebSocket connection to send data');
    }
  })
  
}




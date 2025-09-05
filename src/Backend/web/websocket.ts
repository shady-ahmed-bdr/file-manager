import { WebSocketServer } from 'ws';
import WebSocket from 'ws';


export const WSS = new WebSocketServer({ noServer: true })

let clientSocket: WebSocket | null = null;

WSS.on('connection', (ws, request) => {
    console.log('Client connected');
    clientSocket = ws
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});



export function sendToClient(data: any) {
  if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
    clientSocket.send(JSON.stringify(data));
  } else {
    console.warn('No active WebSocket connection to send data');
  }
}




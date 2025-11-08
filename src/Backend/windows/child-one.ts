import { exec, execFile, spawn, fork } from 'child_process';
import path from 'path';


export const open_in_paint = (imagePath: string) => {
  spawn("cmd", ["/c", "start", "", "mspaint", imagePath], {
    detached: true,
    stdio: "ignore"
  }).unref();
};

export const open_explorer = (folderPath: string) => {
  spawn("cmd", ["/c", "start", "explorer", folderPath], {
    detached: true,
    stdio: "ignore"
  }).unref();
};




export const open_file = (path:string)=>{
  spawn('cmd', ['/c', 'start', '', path]);
}



export const copy_to_clipboard = (text:string)=> {
  const proc = spawn('clip');
  proc.stdin.write(text);
  proc.stdin.end();
}



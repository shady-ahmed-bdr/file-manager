import { exec, execFile, spawn, fork } from 'child_process';





export const open_in_paint = (imagePath:string)=> {
  spawn('mspaint', [imagePath], {
    detached: true, // lets Paint run independently
    stdio: 'ignore'
  }).unref();
}



export const  open_explorer = (path:string) => {
  // explorer.exe is Windows' File Explorer
  exec(`explorer "${path}"`, (err) => {
    if (err) {
      console.error("Failed to open explorer:", err);
    }
  });
};



export const open_file = (path:string)=>{
  spawn('cmd', ['/c', 'start', '', path]);
}



export const copy_to_clipboard = (text:string)=> {
  const proc = spawn('clip');
  proc.stdin.write(text);
  proc.stdin.end();
}
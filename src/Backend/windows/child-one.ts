import { exec, execFile, spawn, fork } from 'child_process';





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

export function unzipWithPassword(src: string, dest: string, password: string): void {
  exec(`unzip -P ${password} "${src}" -d "${dest}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to unzip file:", error);
      return;
    }
    if (stderr) console.warn(stderr);
    console.log(stdout);
  });
}


export const open_file = (path:string)=>{
  spawn('cmd', ['/c', 'start', '', path]);
}



export const copy_to_clipboard = (text:string)=> {
  const proc = spawn('clip');
  proc.stdin.write(text);
  proc.stdin.end();
}
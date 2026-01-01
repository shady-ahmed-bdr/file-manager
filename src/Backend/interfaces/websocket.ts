export interface WsClient extends WebSocket {
    email: string;
}




export interface FileState {
  name: string;
  zipping: 'not_found' | 'pending' | 'finished';
}

export interface Extra extends FileState {
  target: 'stl' | 'dicom';
}

export interface Patient {
  ID: string;
  name: string;
  date: {
    day: string;
    month: string;
  };
  STL_File_LIST: FileState[];
  DICOM_FILE_LIST: FileState[];
  extra?: Extra[];
}


export interface SettingsTS {
  downFolderPath: string;
  rrFolderPath: string;
  deleteAfterExtract: boolean;
  createStlAndDicomWhenTpDone: boolean;
  checkStlInDicom: boolean;
  createNewPatientFolder: boolean; 
  deletePatientFolderInRR:boolean;
  archivePath?:string;
  imagesWatchPath:string;
  cafWatchPath:string;
  pathology:{
    srcDir:string,
    destDir:string
  }
  activePtList: string[]
}


export interface DirectoryInfo {
  name: string;
  path: string;
}

export interface DirectoryWatcher {
  dirs: DirectoryInfo[];
  workingDir: DirectoryInfo | null;
  add(dir: DirectoryInfo): void;
  remove(path: string): void;
}

export interface HandleOptions {
  patientFolder: string;   // full source folder path
  serverListDir: string;   // full dest path (list folder)
  checkbox: boolean;       // whether checkbox is selected
  select?: string | null;  // selected scan name
}

export interface HandleResult {
  status: 'ok' | 'error';
  action?: string;
  message?: string;
}

export interface updateSocket {
  type:'transfer_status' | 'transfer_status_case' | 'transfer_log'
  id:string;
  state:'red'| 'yellow'| 'green'
}
export interface updateSocketCase extends updateSocket {
  src:string;
  dest:string, 
}

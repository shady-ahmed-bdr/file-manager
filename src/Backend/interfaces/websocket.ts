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
  out?: string;
}


export interface SettingsTS {
  downFolderPath: string;
  rrFolderPath: string;
  deleteAfterExtract: boolean;
  createStlAndDicomWhenTpDone: boolean;
  checkStlInDicom: boolean;
  createNewPatientFolder: boolean; // lowercase `boolean` here, not `Boolean`
  deletePatientFolderInRR:boolean;
}

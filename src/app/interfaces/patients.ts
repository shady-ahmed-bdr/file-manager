export interface Patient{
    ID:string
    name:string;
    date:{
        day:string;
        month:string;
    }
    STL_File_LIST:FileState[];
    DICOM_FILE_LIST:FileState[];
    extra?:extra[],
    assets:string[];
}

export interface SettingsTS {
    downFolderPath:string;
    rrFolderPath:string;
    archivePath:string;
    deleteAfterExtract:boolean;
    createStlAndDicomWhenTpDone:boolean;
    checkStlInDicom:boolean;
    createNewPatientFolder:Boolean;
    deletePatientFolderInRR:boolean;
    imagesWatchPath:string
    cafWatchPath:string,
    pathology:{
        srcDir:string,
        destDir:string
    }
    activePtList: Set<string>
}

export interface FileState {
    name:string
    zipping: 'not_found' | 'pending' | 'finished'
}

export interface extra extends FileState {
    target: 'stl'| 'dicom'
}

export interface TransferSocket {
    path:string,
    status:boolean,
    type:'transfer_status'
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

export interface MC {
    id:string; 
    src:string;
    dest:string, 
    state:'red'| 'yellow'| 'green'
}
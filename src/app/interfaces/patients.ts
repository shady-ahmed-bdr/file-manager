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
    out?:string;
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
    cafWatchPath:string
}

export interface FileState {
    name:string
    zipping: 'not_found' | 'pending' | 'finished'
}

export interface extra extends FileState {
    target: 'stl'| 'dicom'
}

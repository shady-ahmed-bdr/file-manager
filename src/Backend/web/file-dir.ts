import fs from 'fs';
import  { mkdir } from 'fs/promises';
import path from 'path';

import {SETTINGS_CONFIG} from '../models/settings';
import { FileState } from '../interfaces/websocket';


export const initNewDir=  (patientName:string):Promise<[STL:string,DICOM:string]>=>{
    return new Promise((res,rej)=>{
        const patientDir = path.join(SETTINGS_CONFIG.rrFolderPath, patientName);
        const OLD = path.join(patientDir, 'OLD');
        const STL = path.join(OLD, 'STL');
        const DICOM = path.join(OLD, 'DICOM');
        if (!fs.existsSync(patientDir)) {
            try {
                mkdir(STL, { recursive: true });
                mkdir(DICOM, { recursive: true });
                res([STL,DICOM])
                console.log(`Folder created at: ${patientDir}`);
            } catch (err) {
                console.error("Error creating folder:", err);
                rej(err)
            }
        }
    })
}

export const directSearch = (STLs:FileState[], DICOM:FileState[])=>{
    const downFolderPath = SETTINGS_CONFIG.downFolderPath;
    const dir = fs.readdirSync(downFolderPath, { withFileTypes: true });
    const files = dir.filter(entry => entry.isFile()).map(file => file.name);
    const foundSTLs: string[] = [];
    const foundDICOMs: string[] = [];

    for (const filename of STLs) {
        if (files.includes(filename.name)) {
            foundSTLs.push(path.join(downFolderPath, filename.name));
        }
    }
    
    for (const filename of DICOM) {
        if (files.includes(filename.name)) {
        foundDICOMs.push(path.join(downFolderPath, filename.name));
        }
    }
    return { foundSTLs, foundDICOMs };
}
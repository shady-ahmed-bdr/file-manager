import fs from 'fs';
import  { mkdir } from 'fs/promises';
import path from 'path';
import unzipper from "unzipper";
import {SETTINGS_CONFIG} from '../models/settings';
import { FileState } from '../interfaces/websocket';


export const initNewDir= async  (patientName:string):Promise<[STL: string, DICOM: string]>=>{
        const patientDir = path.join(SETTINGS_CONFIG.rrFolderPath, patientName.trim());
        const OLD = path.join(patientDir, 'OLD');
        const STL = path.join(OLD, 'STL');
        const DICOM = path.join(OLD, 'DICOM');
        if (!fs.existsSync(patientDir)) {
            await mkdir(patientDir, { recursive: true })
            await mkdir(OLD, { recursive: true })
            await mkdir(STL, { recursive: true });
            await mkdir(DICOM, { recursive: true });
            console.log(`Folder created at: ${patientDir}`);
            return [STL,DICOM]
        }
    return [STL,DICOM]

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


export async function unzipWithPassword(src: string, dest: string, password: string) {
  const directory = await unzipper.Open.file(src);

  for (const file of directory.files) {
    console.log(`Extracting: ${file.path}`);

    // decrypt and extract
    const content = await file.buffer(password);

    const outputPath = `${dest}/${file.path}`;
    const dir = outputPath.substring(0, outputPath.lastIndexOf("/"));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, content);
  }

  console.log("Extraction complete!");
}



export const moveToOldScan = async (targetDir:string) => {
    const dirList =  fs.readdirSync(targetDir);
    fs.mkdirSync(path.join(targetDir,'OLD SCAN'));
    if(dirList.length > 10) return;
    dirList.forEach((d)=>{
        fs.renameSync(path.join(targetDir, d), path.join(targetDir, 'OLD SCAN', d))
    })
};
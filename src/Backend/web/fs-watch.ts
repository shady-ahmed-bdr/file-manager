import fs, {constants,mkdir, mkdirSync } from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import { sendToClient } from '../web/websocket';
import { SETTINGS_CONFIG } from '../models/settings';
import { PATIENT_LIST, updateStateOfPatientFiles } from '../models/patients';
type Status = 'pending' | 'finished' | 'not_found';



export async function extractZip(
  filePath: string,
  destDir: string,
  fileType: 'STL_File_LIST'|'DICOM_FILE_LIST'|'extra',
  fileName: string,
  id:string
) {
  if (!fs.existsSync(filePath)) {
    notify(fileType, fileName, 'not_found',id);
    return;
  }

  notify(fileType, fileName, 'pending',id);
  updateStateOfPatientFiles(id,fileType,fileName,'pending')
  try {
    await fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: destDir }))
      .promise();

    notify(fileType, fileName, 'finished',id);
    updateStateOfPatientFiles(id,fileType,fileName,'finished')

  } catch (error) {
    console.error(`Unzip error:`, error);
    notify(fileType, fileName, 'not_found',id);
    updateStateOfPatientFiles(id,fileType,fileName,'not_found')
  }
}

function notify(fileType: 'STL_File_LIST'|'DICOM_FILE_LIST'|'extra', fileName: string, status: Status,id:string) {
  sendToClient({
    type: 'file_status',
    id:id,
    payload: { fileType, fileName, status },
  });
}
export const deleteFolder = (id:string)=>{
  const P = PATIENT_LIST.find((p)=>p.ID == id)
  try {
    fs.rmSync(path.join(SETTINGS_CONFIG.rrFolderPath,P?.name!), { recursive: true, force: true });
    console.log("Folder deleted!");
  } catch (err) {
    console.error("Error removing folder:", err);
  }
}

export const copyFile = (src:string, dest:string,fileName:string,fileType: 'STL_File_LIST'|'DICOM_FILE_LIST'|'extra',id:string) =>{
  const srcPath = src; // no need to join
  const destPath = path.join(dest, fileName);
  console.log("src:", fs.existsSync(srcPath));
  const dir = path.dirname(destPath);
  console.log("dest:", fs.existsSync(dir));

  try{
    if (!fs.existsSync(dir)) {
      mkdirSync(dir,{recursive:true})
      throw new Error("Source file does not exist: " + dir);
    }
    notify(fileType, fileName, 'pending',id);
    updateStateOfPatientFiles(id,fileType,srcPath,'pending')
    fs.copyFileSync(srcPath, destPath, constants.COPYFILE_EXCL)
    notify(fileType, fileName, 'finished',id);
    updateStateOfPatientFiles(id,fileType,srcPath,'finished')
  }catch(err){
    console.log(err)
  }
}

export const startWatching = () => {
  if (SETTINGS_CONFIG && SETTINGS_CONFIG.downFolderPath) {
    console.log(SETTINGS_CONFIG.downFolderPath);

    fs.watch(
      SETTINGS_CONFIG.downFolderPath,
      { recursive: false },
      (eventType, filename) => {
        if (!filename) return;

        console.log(`[${eventType}]`, filename);

        PATIENT_LIST.forEach((P) => {
          // ---- DICOM ----
          const D_index = P.DICOM_FILE_LIST.findIndex(f => f.name === filename);
          if (D_index !== -1) {
            const fileObj = P.DICOM_FILE_LIST[D_index];
            if (fileObj.zipping === 'not_found') {
              const fileP = path.join(SETTINGS_CONFIG.downFolderPath, fileObj.name);
              const destFileDicom = path.join(SETTINGS_CONFIG.rrFolderPath, P.name, 'OLD', 'DICOM');
              if (fileObj.name.endsWith('.zip')) {
                extractZip(fileP, destFileDicom, 'DICOM_FILE_LIST', fileObj.name, P.ID);
              } else {
                copyFile(fileP, destFileDicom, fileObj.name, 'DICOM_FILE_LIST', P.ID);
              }
            }
          }

          // ---- STL ----
          const S_index = P.STL_File_LIST.findIndex(f => f.name === filename);
          if (S_index !== -1) {
            const fileObj = P.STL_File_LIST[S_index];
            if (fileObj.zipping === 'not_found') {
              const fileP = path.join(SETTINGS_CONFIG.downFolderPath, fileObj.name);
              const destFileStl = path.join(SETTINGS_CONFIG.rrFolderPath, P.name, 'OLD', 'STL');
              if (fileObj.name.endsWith('.zip')) {
                extractZip(fileP, destFileStl, 'STL_File_LIST', fileObj.name, P.ID);
              } else {
                copyFile(fileP, destFileStl, fileObj.name, 'STL_File_LIST', P.ID);
              }
            }
          }
        });
      }
    );
  }
};
startWatching()
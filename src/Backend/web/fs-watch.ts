import fs, {constants } from 'fs';
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


export const copyFile = (src:string, dest:string,fileName:string,fileType: 'STL_File_LIST'|'DICOM_FILE_LIST'|'extra',id:string) =>{
  const destDir = path.join(dest,fileName)
  try{
    notify(fileType, fileName, 'pending',id);
    updateStateOfPatientFiles(id,fileType,fileName,'pending')
    fs.copyFileSync(src, destDir, constants.COPYFILE_EXCL)
    notify(fileType, fileName, 'finished',id);
    updateStateOfPatientFiles(id,fileType,fileName,'finished')
  }catch(err){
    console.log(err)
  }
}




export const startWatching = () => {
  if(SETTINGS_CONFIG && SETTINGS_CONFIG.downFolderPath){
    console.log(SETTINGS_CONFIG.downFolderPath)
    fs.watch(SETTINGS_CONFIG.downFolderPath, { recursive: false }, (eventType, filename) => {
      if (filename) {
        console.log(`[${eventType}]`, filename);
        PATIENT_LIST.forEach(P=>{
          const D_index = P.DICOM_FILE_LIST.findIndex(f=>f.name == filename)
          if(D_index!= -1){
            const file = P.DICOM_FILE_LIST[D_index].name
            const fileP = path.join(SETTINGS_CONFIG.downFolderPath,file)
            const destFileDicom = path.join(SETTINGS_CONFIG.rrFolderPath,P.name,'OLD','DICOM')
            if(file.endsWith('.zip')){
              extractZip(fileP,destFileDicom,'DICOM_FILE_LIST',file,P.ID)
            }else{
              copyFile(fileP,destFileDicom,file,'DICOM_FILE_LIST',P.ID)
            }
          }
          const S_index = P.STL_File_LIST.findIndex(f=>f.name == filename)
          if(S_index!= -1){
            const file = P.STL_File_LIST[D_index].name
            const fileP = path.join(SETTINGS_CONFIG.downFolderPath,file)
            const destFileDicom = path.join(SETTINGS_CONFIG.rrFolderPath,P.name,'OLD','STL')
            if(file.endsWith('.zip')){
              extractZip(fileP,destFileDicom,'STL_File_LIST',file,P.ID)
            }else{
              copyFile(fileP,destFileDicom,file,'STL_File_LIST',P.ID)
            }
          }
          const E_index = P.extra?.findIndex(f=>f.name == filename)
          if(S_index!= -1){
            const file = P.extra![E_index!].name
            const destFileDicom = path.join(SETTINGS_CONFIG.rrFolderPath,P.name,'OLD', P.extra![E_index!].target)
            copyFile(file,destFileDicom,file,'extra',P.ID)
          }
        })
      }
    });
  }
}
import fs, { promises as fss, constants, mkdir, mkdirSync, FSWatcher } from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import { sendToClient } from '../web/websocket';
import { SETTINGS_CONFIG } from '../models/settings';
import { PATIENT_LIST, updateP, updateStateOfPatientFiles } from '../models/patients';
import { unzipWithPassword } from './file-dir';
type Status = 'pending' | 'finished' | 'not_found';



export async function extractZip(
  filePath: string,
  destDir: string,
  fileType: 'STL_File_LIST' | 'DICOM_FILE_LIST' | 'extra',
  fileName: string,
  id: string
) {
  if (!fs.existsSync(filePath)) {
    notify(fileType, fileName, 'not_found', id);
    return;
  }

  notify(fileType, fileName, 'pending', id);
  updateStateOfPatientFiles(id, fileType, fileName, 'pending')
  try {
    await fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: destDir }))
      .promise();

    notify(fileType, fileName, 'finished', id);
    updateStateOfPatientFiles(id, fileType, fileName, 'finished')

  } catch (error) {
    console.error(`Unzip error:`, error);
    try{
      unzipWithPassword(filePath,destDir,'ewoo3ddx')
      notify(fileType, fileName, 'finished', id);
      updateStateOfPatientFiles(id, fileType, fileName, 'finished')
    }catch(e){
      notify(fileType, fileName, 'not_found', id);
      updateStateOfPatientFiles(id, fileType, fileName, 'not_found')
    }
  }
}

function notify(fileType: 'STL_File_LIST' | 'DICOM_FILE_LIST' | 'extra', fileName: string, status: Status, id: string) {
  sendToClient({
    type: 'file_status',
    id: id,
    payload: { fileType, fileName, status },
  });
}
export const deleteFolder = (id: string) => {
  const P = PATIENT_LIST.find((p) => p.ID == id)
  try {
    fs.rmSync(path.join(SETTINGS_CONFIG.rrFolderPath, P?.name!), { recursive: true, force: true });
    console.log("Folder deleted!");
  } catch (err) {
    console.error("Error removing folder:", err);
  }
}

export const copyFile = (src: string, dest: string, fileName: string, fileType: 'STL_File_LIST' | 'DICOM_FILE_LIST' | 'extra', id: string) => {
  const srcPath = src; // no need to join
  const destPath = path.join(dest, fileName);
  console.log("src:", fs.existsSync(srcPath));
  const dir = path.dirname(destPath);
  console.log("dest:", fs.existsSync(dir));

  try {
    if (!fs.existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      throw new Error("Source file does not exist: " + dir);
    }
    notify(fileType, fileName, 'pending', id);
    updateStateOfPatientFiles(id, fileType, srcPath, 'pending')
    fs.copyFileSync(srcPath, destPath, constants.COPYFILE_EXCL)
    notify(fileType, fileName, 'finished', id);
    updateStateOfPatientFiles(id, fileType, srcPath, 'finished')
  } catch (err) {
    console.log(err)
  }
}
let watchers: FSWatcher[] = []
export const terminateWatchers = () => {
  watchers.forEach((W, i) => {
    console.log('closing: ' + i)
    W.close()
  })
}
export const startWatching = () => {

  if (SETTINGS_CONFIG && SETTINGS_CONFIG.downFolderPath) {
    console.log('watching: ' + SETTINGS_CONFIG.downFolderPath);

    watchers[0] = fs.watch(
      SETTINGS_CONFIG.downFolderPath,
      { recursive: false },
      (eventType, filename) => {
        if (!filename) return;

        console.log(`[${eventType}]`, filename);

        PATIENT_LIST.forEach((P) => {
          const D_index = P.DICOM_FILE_LIST.findIndex(f => f.name === filename);
          if (D_index !== -1) {
            const fileObj = P.DICOM_FILE_LIST[D_index];
            if (fileObj.zipping === 'not_found') {
              const fileP = path.join(SETTINGS_CONFIG.downFolderPath, fileObj.name);
              const destFileDicom = path.join(SETTINGS_CONFIG.rrFolderPath, P.name, 'OLD', 'DICOM');
              if (fileObj.name.endsWith('.zip')) {
                extractZip(fileP, destFileDicom, 'DICOM_FILE_LIST', fileObj.name, P.ID);
                copyFile(fileP, destFileDicom, fileObj.name, 'DICOM_FILE_LIST', P.ID);
              } else {
                copyFile(fileP, destFileDicom, fileObj.name, 'DICOM_FILE_LIST', P.ID);
              }
            }
          }
          const S_index = P.STL_File_LIST.findIndex(f => f.name === filename);
          if (S_index !== -1) {
            const fileObj = P.STL_File_LIST[S_index];
            if (fileObj.zipping === 'not_found') {
              const fileP = path.join(SETTINGS_CONFIG.downFolderPath, fileObj.name);
              const destFileStl = path.join(SETTINGS_CONFIG.rrFolderPath, P.name, 'OLD', 'STL');
              if (fileObj.name.endsWith('.zip')) {
                extractZip(fileP, destFileStl, 'STL_File_LIST', fileObj.name, P.ID);
                copyFile(fileP, destFileStl, fileObj.name, 'STL_File_LIST', P.ID);
              } else {
                copyFile(fileP, destFileStl, fileObj.name, 'STL_File_LIST', P.ID);
              }
            }
          }
        });
      }
    );
  }
  if (SETTINGS_CONFIG && SETTINGS_CONFIG.cafWatchPath) {
    console.log('watching: ' + SETTINGS_CONFIG.cafWatchPath);
    watchers[1] = fs.watch(SETTINGS_CONFIG.cafWatchPath, { recursive: true }, (eventType: fs.WatchEventType, filename: string | null) => {
      console.log(filename, 'assets manager')
      if (!filename) return;
      PATIENT_LIST.map((P) => {
        const pName = P.name.split(',')[0]
        const keywords = pName.split(/[ \^]+/);
        const regex = new RegExp(keywords.join('|'), "i")
        const base = filename.split('.')[0]
        console.log(pName, keywords, regex, base, 'baseeeeeeee')
        if (filename.endsWith('.caf') || filename.endsWith('.zip')) {
          if (regex.test(base)) {
            const src = path.join(SETTINGS_CONFIG.cafWatchPath, filename);
            const dest = path.join(SETTINGS_CONFIG.rrFolderPath, P.name);
            console.log('src: ', src, ' dest: ', dest)
            exportAssets(src, dest).then((path) => {
              if(path)fs.unlinkSync(src)
            })
          }
        }
      })
    })
  }
  if (SETTINGS_CONFIG && SETTINGS_CONFIG.imagesWatchPath) {
    console.log('watching: ' + SETTINGS_CONFIG.imagesWatchPath);
    watchers[2] = fs.watch(SETTINGS_CONFIG.imagesWatchPath, { recursive: true }, (eventType: fs.WatchEventType, filename: string | null) => {
      if (!filename) return;
      PATIENT_LIST.forEach((P) => {
        const pName = P.name.split(',')[0]
        const keywords = pName.split(/[ \^]+/);
        const regex = new RegExp(keywords.join('|'), "i")
        const base = filename.split('.')[0]
        console.log(pName, keywords, regex, base, 'baseeeeeeee')
        if (filename.endsWith('.png') || filename.endsWith('.jpeg') || filename.endsWith('.jpg')) {
          if (regex.test(base)) {
            const src = path.join(SETTINGS_CONFIG.imagesWatchPath, filename);
            const dest = path.join(SETTINGS_CONFIG.rrFolderPath, P.name);
            console.log('src: ',fs.existsSync(src),'dest: ',fs.existsSync(dest))
            console.log('src: ',src,'dest: ',dest)
            try{
              setTimeout(()=>{
                exportAssets(src, dest).then((path) => {
                fs.unlinkSync(src)
                }).catch((ee)=>{
                  console.log(ee)
                })
              },1000)
            }catch(e){
              console.log(e)
            }
            
          }
        }
      })
    })
  }
};
startWatching()


const exportAssets = async (src: string, destDir: string): Promise<string> => {
  const base = path.basename(src);
  const ext = path.extname(base);
  const name = path.basename(base, ext);
  if(!fs.existsSync(src)) return '';
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  let targetPath = path.join(destDir, base);
  let counter = 1;

  while (true) {
    try {
      await fss.access(targetPath);
      targetPath = path.join(destDir, `${name} (${counter++})${ext}`);
    } catch {
      break;
    }
  }

  await fss.cp(src, targetPath);
  return targetPath;
};
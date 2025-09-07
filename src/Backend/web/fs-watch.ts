import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import { sendToClient } from '../web/websocket';
import { SETTINGS_CONFIG } from '../models/settings';


type Status = 'pending' | 'finished' | 'not_found';

export async function extractZip(
  filePath: string,
  destDir: string,
  fileType: 'stl' | 'dicom',
  fileName: string
) {
  if (!fs.existsSync(filePath)) {
    notify(fileType, fileName, 'not_found');
    return;
  }

  notify(fileType, fileName, 'pending');

  try {
    await fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: destDir }))
      .promise();

    notify(fileType, fileName, 'finished');
  } catch (error) {
    console.error(`Unzip error:`, error);
    notify(fileType, fileName, 'not_found');
  }
}

function notify(fileType: 'stl' | 'dicom', fileName: string, status: Status) {
  sendToClient({
    type: 'file_status',
    payload: { fileType, fileName, status },
  });
}




export const startWatching = () => {
  console.log('watch mode :...',SETTINGS_CONFIG )
  if(SETTINGS_CONFIG && SETTINGS_CONFIG.downFolderPath){
    console.log(SETTINGS_CONFIG.downFolderPath)
    fs.watch(SETTINGS_CONFIG.downFolderPath, { recursive: false }, (eventType, filename) => {
      if (filename) {
        console.log(`[${eventType}]`, filename);
      }
    });
  }
}

import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import { sendToClient } from '../web/websocket';

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

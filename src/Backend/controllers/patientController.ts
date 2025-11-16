import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import * as fss from  'fs'
import { Patient, SettingsTS } from '../interfaces/websocket';
import {
  addP,
  removeP,
  updateP,
  PATIENT_LIST,
  getP,
  handlePatientFolder
} from '../models/patients';
import { SETTINGS_CONFIG, saveSettings } from '../models/settings';
import { initNewDir, directSearch, moveToOldScan } from '../web/file-dir';
import { copyFile, copyFileSender, extractZip, extractZipSender, startWatching, terminateWatchers } from '../web/fs-watch';
import { getDir, } from '../models/dir-map';
import { open_explorer, open_file, open_in_paint } from '../windows/child-one';
import { runTransfer } from '../web/transfer';

export const removePatient = (req: Request, res: Response) => {
  const id = req.params['id'];
  removeP(id);
  res.end()
};

export const addPatient = (req: Request, res: Response) => {
  const { patient, settings: newSettings }: { patient: Patient; settings: SettingsTS } = req.body;
  patient.name = patient.name.trim()
  patient.extra = patient.extra?.map((ePath) => {
    ePath.name = ePath.name.replace(/^"(.*)"$/, "$1")
    return ePath
  })
  addP(patient)
  saveSettings(newSettings);
  initNewDir(patient.name)
    .then((data) => {
      const res = directSearch(patient.STL_File_LIST, patient.DICOM_FILE_LIST)
      res.foundDICOMs.forEach((filePathToExtract: string) => {
        const fileName = path.basename(filePathToExtract);
        if (fileName.endsWith('.zip')) {
          extractZip(filePathToExtract, data[1], 'DICOM_FILE_LIST', fileName, patient.ID)
          copyFile(filePathToExtract, data[1], fileName, 'DICOM_FILE_LIST', patient.ID)
        } else {
          copyFile(filePathToExtract, data[1], fileName, 'DICOM_FILE_LIST', patient.ID)
        }
      })
      res.foundSTLs.forEach((filePathToExtract: string) => {
        const fileName = path.basename(filePathToExtract);
        if (fileName.endsWith('.zip')) {
          extractZip(filePathToExtract, data[0], 'STL_File_LIST', fileName, patient.ID)
          copyFile(filePathToExtract, data[0], fileName, 'STL_File_LIST', patient.ID)
        } else {
          copyFile(filePathToExtract, data[0], fileName, 'STL_File_LIST', patient.ID)
        }
      })
      patient.extra?.forEach((extraFile) => {
        const baseNameFromPath = path.basename(extraFile.name);
        const destPathExtra = path.join(
          SETTINGS_CONFIG.rrFolderPath,
          patient.name,
          'OLD',
          extraFile.target.toUpperCase() // 'stl' → 'STL', 'dicom' → 'DICOM'
        );
        if (extraFile.name.endsWith('.zip')) {
          extractZip(extraFile.name, destPathExtra, 'extra', baseNameFromPath, patient.ID);
          copyFile(extraFile.name, destPathExtra, baseNameFromPath, 'extra', patient.ID);
        } else {
          copyFile(extraFile.name, destPathExtra, baseNameFromPath, 'extra', patient.ID);
        }
      });
    })
    .catch((err) => { console.log(err) })
  res.status(201).json({ message: 'Patient added' });
};




export const updatePatient = (req: Request, res: Response) => {
  const { patient, settings: newSettings }: { patient: Patient; settings: SettingsTS } = req.body;
  console.log(patient)
  patient.name = patient.name.trim()
  patient.extra = patient.extra?.map((ePath) => {
    ePath.name = ePath.name.replace(/^"(.*)"$/, "$1")
    return ePath
  })
  updateP(patient)
  try {
    const resSearch = directSearch(patient.STL_File_LIST, patient.DICOM_FILE_LIST);
    // --- DICOM files ---
    patient.DICOM_FILE_LIST
      .filter((f) => f.zipping === 'not_found')
      .forEach((f) => {
        const destPathExtra = path.join(
          SETTINGS_CONFIG.rrFolderPath,
          patient.name,
          'OLD',
          'DICOM' // 'stl' → 'STL', 'dicom' → 'DICOM'
        );
        const filePath = resSearch.foundDICOMs.find((p) => path.basename(p) === f.name);
        if (!filePath) return;

        if (filePath.endsWith('.zip')) {
          extractZip(filePath, destPathExtra, 'DICOM_FILE_LIST', f.name, patient.ID);
          copyFile(filePath, destPathExtra, f.name, 'DICOM_FILE_LIST', patient.ID);
        } else {
          copyFile(filePath, destPathExtra, f.name, 'DICOM_FILE_LIST', patient.ID);
        }
      });

    // --- STL files ---
    patient.STL_File_LIST
      .filter((f) => f.zipping === 'not_found')
      .forEach((f) => {
        const destPathExtra = path.join(
          SETTINGS_CONFIG.rrFolderPath,
          patient.name,
          'OLD',
          'STL' // 'stl' → 'STL', 'dicom' → 'DICOM'
        );
        const filePath = resSearch.foundSTLs.find((p) => path.basename(p) === f.name);
        if (!filePath) return;

        if (filePath.endsWith('.zip')) {
          extractZip(filePath, destPathExtra, 'STL_File_LIST', f.name, patient.ID);
          copyFile(filePath, destPathExtra, f.name, 'STL_File_LIST', patient.ID);
        } else {
          copyFile(filePath, destPathExtra, f.name, 'STL_File_LIST', patient.ID);
        }
      });

    // --- Extra files ---
    patient.extra
      ?.filter((f) => f.zipping === 'not_found')
      .forEach((f) => {
        const destPathExtra = path.join(
          SETTINGS_CONFIG.rrFolderPath,
          patient.name,
          'OLD',
          f.target.toUpperCase() // 'stl' → 'STL', 'dicom' → 'DICOM'
        );
        const baseName = path.basename(f.name)
        if (f.name.endsWith('.zip')) {
          extractZip(f.name, destPathExtra, 'STL_File_LIST', f.name, patient.ID);
          copyFile(f.name, destPathExtra, baseName, 'STL_File_LIST', patient.ID);
        } else {
          copyFile(f.name, destPathExtra, baseName, 'STL_File_LIST', patient.ID);
        }
      });

    res.status(200).json({ message: 'Patient updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating patient' });
  }
};

export const getList = (_req: Request, res: Response) => {
  res.json(PATIENT_LIST);
};

export const setSettings = (req: Request, res: Response) => {
  const { newSettings } = req.body;
  console.log(newSettings, 'post')
  saveSettings(newSettings);
  terminateWatchers()
  startWatching()
  res.json({ message: 'Settings updated' });
};

export const directory = (req: Request, res: Response) => {
  console.log(req.body)
  const data = getDir(req.body)
  res.status(200).json(data).end()
}

// export const movePatient = async (req: Request, res: Response) => {
//   const { src, dest, moveExisting, newFolderName } = req.body;
//   if (!src || !dest) {
//     res.status(400).json({ error: 'src and dest are required' });
//     return;
//   }

//   const result = await handlePatientFolder({
//     patientFolder: src.trim(),
//     serverListDir: dest.trim(),
//     checkbox: Boolean(moveExisting),
//     select: newFolderName || null
//   });

//   res.json(result);
// };
export const movePatient = async (req: Request, res: Response) => {
  try {
    const { src, dest, moveExisting, newFolderName } = req.body;
    if (!src || !dest) {
      res.status(400).json({ error: 'src and dest are required' });
      return;
    }
    const dirList = await fs.readdir(dest);

    const baseName = path.basename(src.trim())
    if (moveExisting && !newFolderName) {
      if (dirList.length > 15) {
        res.status(403).json({ error: 'bad folder' })
        return;
      };
      await moveToOldScan(dest)
      await fs.cp(src.trim(), path.join(dest, 'NEW SCAN'), { recursive: true });
    } else if (moveExisting && newFolderName) {
      if (dirList.length > 15) {
        res.status(403).json({ error: 'bad folder' })
        return;
      };
      await moveToOldScan(dest)
      await fs.cp(src.trim(), path.join(dest, newFolderName), { recursive: true });
    } else if (newFolderName) {
      await fs.cp(src.trim(), path.join(dest, newFolderName), { recursive: true });
    } else {
      await fs.cp(src.trim(), path.join(dest, baseName), { recursive: true });
    }
    res.json({ success: true, src, dest });
  } catch (err: any) { console.error('Error copying folder:', err); res.status(500).json({ error: err.message }); }
}


export const editImagesPatient = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    getP(id)
      .then((patient) => {
        const PtFolderPath = path.join(SETTINGS_CONFIG.rrFolderPath, patient.name)
        fs.readdir(PtFolderPath).then((dir) => {
          dir.filter((s) =>
            s.toLowerCase().endsWith('.png')
            ||
            s.toLowerCase().endsWith('.jpeg')
            ||
            s.toLowerCase().endsWith('.jpg')).forEach((p) => {
              open_in_paint(path.join(PtFolderPath, p));
            })
        })

      }).catch((e) => {
        res.status(404).json({ success: false, error: 'not found' });
      })
    res.json({ success: true, message: `Image ${id} opened for editing` });
  } catch (err) {
    console.error('Error opening image:', err);
    res.status(500).json({ success: false, error: 'Failed to open image' });
  }
}

export const editImagesPatientP = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const PtFolderPath = path.join(id);

    const dir = await fs.readdir(PtFolderPath);
    const images = dir.filter(
      (s) => s.toLowerCase().endsWith('.png')
        ||
        s.toLowerCase().endsWith('.jpeg')
        ||
        s.toLowerCase().endsWith('.jpg')
    );

    for (const p of images) {
      open_in_paint(path.join(PtFolderPath, p)); // if it's sync, remove await
    }
    res.json({ success: true, message: `Image(s) from ${id} opened for editing` });
  } catch (err) {
    console.error('Error opening image:', err);
    res.status(500).json({ success: false, error: 'Failed to open image' });
  }
};


export const openExplorerController = async (req: Request, res: Response) => {
  try {
    const { path } = req.body;

    open_explorer(path); // your existing logic
    res.json({ success: true, path });
  } catch (err) {
    console.error("openExplorerController error:", err);
    res.status(500).json({ success: false, error: "Failed to open explorer" });
  }
};

export const runFileController = async (req: Request, res: Response) => {
  try {
    const { path } = req.body;
    console.log(path, 'runFileController')
    open_file(path); // your existing logic
    res.json({ success: true, path });
  } catch (err) {
    console.error("runFileController error:", err);
    res.status(500).json({ success: false, error: "Failed to open file" });
  }
};



export const transferContent = async (req: Request, res: Response) => {
  try {
    const { list } = req.body;
    console.log('transferContent', list)
    if (list.length != 0) runTransfer(list, SETTINGS_CONFIG.pathology.destDir).then(() => {
      res.status(200).end()
    })
      .catch((e) => {
        console.log(e)
        res.status(404)
      })
    else res.status(404).end()
  } catch (err) {
    console.error("transferContent error:", err);
    res.status(500).json({ success: false, error: "Failed to open file" });
  }
};

export const addWorkDir = async (req: Request, res: Response) => {
  const { src }: { src: string } = req.body;
  const stat = await fs.lstat(path.join(src))
  if (!Array.isArray(SETTINGS_CONFIG.activePtList)) {
    SETTINGS_CONFIG.activePtList = [];
  }
  const workSet = new Set(SETTINGS_CONFIG.activePtList)
  console.log(workSet.has(src), stat.isDirectory())
  if (!workSet.has(src) && stat.isDirectory()) {
    workSet.add(src)
    const newStt: SettingsTS = {
      ...SETTINGS_CONFIG,
      activePtList: [...workSet]
    }
    saveSettings(newStt)

    res.status(200).json([...workSet])
  } else (
    res.status(400).json([])
  )

}

export const rmWorkDir = async (req: Request, res: Response) => {
  const { src } = req.body;
  const workSet = new Set(SETTINGS_CONFIG.activePtList)
  if (workSet.has(src)) {
    workSet.delete(src)
    const newStt: SettingsTS = {
      ...SETTINGS_CONFIG,
      activePtList: [...workSet]
    }
    saveSettings(newStt)
    res.status(200).json(true)
  } else (
    res.status(400).json(false)
  )
}


export const sendFileOrFolder = async (req: Request, res: Response) => {
  try {
    let { src, dest, type, extract } = req.body;
    console.log(req.body, 'aaaaaaaa')
    
    if (!src || !dest) {
      return res.status(400).json({ error: 'Missing src or dest' });
    }
    src = path.join(...src.replaceAll("\"","").split("\\")) ;
    dest = path.join(...dest.replaceAll("\"","").split("\\"));
    try {
      const srcExists = fss.existsSync(src);
      if (!srcExists) {
        return res.status(404).json({ error: 'Source path does not exist' });
      }
      const targetDir = path.join(dest, 'OLD', type.toUpperCase());

      // 1️⃣ If type is NONE or ARCHIVE → just copy (no folder creation)
      if (type === 'none') {
        const fileName = path.basename(src);
        copyFileSender(src, dest, fileName);
        console.log(fileName.toLowerCase().endsWith('.zip'))
        if (extract && fileName.toLowerCase().endsWith('.zip')) {
          await extractZipSender(src, dest);
        }
        return res.json({ success: true, message: 'Copied successfully' });
      }

      // 2️⃣ For STL or DICOM → go inside OLD/... and manage extraction

      if (!fss.existsSync(targetDir)) {
        fss.mkdirSync(targetDir, { recursive: true });
      }

      const fileName = path.basename(src);
      const finalDest = path.join(targetDir, fileName);

      // If it's a ZIP and extract is checked → unzip
      if (extract && fileName.toLowerCase().endsWith('.zip')) {
        await extractZipSender(src, targetDir);
      }

      // Otherwise just copy
      copyFileSender(src, targetDir, fileName);
      return res.json({ success: true, message: 'Copied successfully' });

    } catch (err:any) {
      console.error('Send file error:', err);
      return res.status(500).json({ error: err.message });
    }


  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: err });
  }
}
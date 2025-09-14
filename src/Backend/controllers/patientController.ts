import { Request, Response } from 'express';
import path from 'path';
import { Patient, SettingsTS } from '../interfaces/websocket';
import {
  addP,
  removeP,
  updateP,
  PATIENT_LIST
} from '../models/patients';
import { SETTINGS_CONFIG, saveSettings } from '../models/settings';
import { initNewDir, directSearch } from '../web/file-dir';
import { copyFile, extractZip  } from '../web/fs-watch';


export const removePatient = (req: Request, res: Response) => {
  const id = req.params['id'];
  removeP(id);
  
  res.end()
};

export const addPatient = (req: Request, res: Response) => {
  const { patient, settings: newSettings }: { patient: Patient; settings: SettingsTS } = req.body;
  patient.name = patient.name.trim()
  patient.extra = patient.extra?.map((ePath)=> {
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
  patient.extra = patient.extra?.map((ePath)=> {
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
  const {newSettings} = req.body;
  console.log(newSettings, 'post')
  saveSettings(newSettings);
  res.json({ message: 'Settings updated' });
};


import { Request, Response } from 'express';
import path from 'path';
import { Patient, SettingsTS } from '../interfaces/websocket';
import {
  addP,
  removeP,
  updateP,
  PATIENT_LIST
} from '../models/patients';
import { SETTINGS_CONFIG, saveSettings} from '../models/settings';
import { initNewDir, directSearch } from '../web/file-dir';
import {copyFile, extractZip, startWatching} from '../web/fs-watch';


export const removePatient = (req: Request, res: Response) => {
  const id = req.params['id'];
  removeP(id);
};

export const addPatient = (req: Request, res: Response) => {
  const { patient, settings: newSettings }: { patient: Patient; settings: SettingsTS } = req.body;
  addP(patient)
  saveSettings(newSettings);
  initNewDir(patient.name)
  .then((data)=>{
    const res = directSearch(patient.STL_File_LIST,patient.DICOM_FILE_LIST)
    res.foundDICOMs.forEach((filePathToExtract:string)=>{
      const fileName = path.basename(filePathToExtract);
      if(fileName.endsWith('.zip')){
        extractZip(filePathToExtract,data[1], 'DICOM_FILE_LIST',fileName,patient.ID)
      }else{
        copyFile(filePathToExtract,data[1],fileName, 'DICOM_FILE_LIST',patient.ID)
      }
    })
    res.foundDICOMs.forEach((filePathToExtract:string)=>{
      const fileName = path.basename(filePathToExtract);
      if(fileName.endsWith('.zip')){
        extractZip(filePathToExtract,data[0], 'STL_File_LIST',fileName,patient.ID) 
      }else{
        copyFile(filePathToExtract,data[1],fileName, 'STL_File_LIST',patient.ID)
      }
    })
    patient.extra?.forEach((filePath)=>{
      const baseNameFromPath = path.basename(filePath.name)
      copyFile(filePath.name,data[1],baseNameFromPath, 'STL_File_LIST',patient.ID)
    })
  })
  .catch((err)=>{console.log(err)})
  res.status(201).json({ message: 'Patient added' });
};

export const updatePatient = (req: Request, res: Response) => {
  const { patient, settings: newSettings }: { patient: Patient; settings: SettingsTS } = req.body;
  updateP(patient)
};

export const getList = (_req: Request, res: Response) => {
  res.json(PATIENT_LIST);
};

export const setSettings = (req: Request, res: Response) => {
  const newSettings: SettingsTS = req.body;
  saveSettings(newSettings);
  res.json({ message: 'Settings updated' });
};


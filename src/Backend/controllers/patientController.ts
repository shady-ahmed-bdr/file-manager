import { Request, Response } from 'express';
import { Patient, SettingsTS } from '../interfaces/websocket';
import {
  addP,
  removeP,
  updateP,
  PATIENT_LIST
} from '../models/patients';
import { SETTINGS_CONFIG, saveSettings} from '../models/settings';
import { initNewDir, directSearch } from '../web/file-dir';
import { startWatching} from '../web/fs-watch';


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
    directSearch({dir:data[0],data:patient.STL_File_LIST},{dir:data[1],data:patient.DICOM})
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
  console.log(newSettings)
  res.json({ message: 'Settings updated' });
};

import { Request, Response } from 'express';
import { Patient, SettingsTS } from '../interfaces/websocket';

let patients: Patient[] = [];
let settings: SettingsTS | null = null;

export const removePatient = (req: Request, res: Response) => {
  const id = req.params['id'];
  const index = patients.findIndex(p => p.ID === id);
  if (index !== -1) {
    patients.splice(index, 1);
    return res.json(true);
  } else {
    return res.status(404).json(false);
  }
};

export const addPatient = (req: Request, res: Response) => {
  const { patient, settings: newSettings }: { patient: Patient; settings: SettingsTS } = req.body;
  patients.push(patient);
  settings = newSettings;
  res.status(201).json({ message: 'Patient added' });
};

export const updatePatient = (req: Request, res: Response) => {
  const { patient, settings: newSettings }: { patient: Patient; settings: SettingsTS } = req.body;
  const index = patients.findIndex(p => p.ID === patient.ID);
  if (index !== -1) {
    patients[index] = patient;
    settings = newSettings;
    return res.json({ message: 'Patient updated' });
  } else {
    return res.status(404).json({ error: 'Patient not found' });
  }
};

export const getList = (_req: Request, res: Response) => {
  res.json(patients);
};

export const setSettings = (req: Request, res: Response) => {
  const newSettings: SettingsTS = req.body;
  settings = newSettings;
  res.json({ message: 'Settings updated' });
};

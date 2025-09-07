import { Router } from 'express';
import {
  removePatient,
  addPatient,
  updatePatient,
  getList,
  setSettings,
} from '../controllers/patientController';

export const router = Router();

router.delete('/remove/:id', removePatient);
router.post('/add', addPatient);
router.patch('/update', updatePatient);
router.get('/list', getList);
router.post('/settings', setSettings); 


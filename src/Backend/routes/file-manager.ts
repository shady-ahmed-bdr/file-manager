import { Router } from 'express';
import {
  removePatient,
  addPatient,
  updatePatient,
  getList,
  setSettings,
} from '../controllers/patientController';

const router = Router();

router.delete('/remove/:id', removePatient);
router.post('/add', addPatient);
router.patch('/update', updatePatient);
router.get('/list', getList);
router.post('/settigs', setSettings); // NOTE: 'settigs' as per your original typo

export default router;

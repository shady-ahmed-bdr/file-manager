import { Router } from 'express';
import {
  removePatient,
  addPatient,
  updatePatient,
  getList,
  setSettings,
  directory,
  movePatient,
  editImagesPatient,
  openExplorerController,
  runFileController,
  transferContent,
  addWorkDir,
  rmWorkDir,
  editImagesPatientP,
  sendFileOrFolder,
  handleUpdateCases,
  handleUpdateCase
} from '../controllers/patientController';

export const router = Router();

router.delete('/remove/:id', removePatient);
router.post('/add', addPatient);
router.patch('/update', updatePatient);
router.get('/list', getList);
router.post('/settings', setSettings); 
router.post('/path', directory)
router.post('/edit_images_path', editImagesPatientP)
router.patch('/p_folder',movePatient)
router.get('/edit_images/:id', editImagesPatient)
router.post('/open_exp', openExplorerController)
router.post('/open_file', runFileController)
router.post('/transfer', transferContent)
router.post('/active_pt', addWorkDir)
router.post('/rm_pt', rmWorkDir)
router.post('/sender', sendFileOrFolder)
router.post('/update_cases', handleUpdateCases)
router.post('/update_cases_item', handleUpdateCase)


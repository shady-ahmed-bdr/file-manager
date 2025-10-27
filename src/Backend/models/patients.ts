import { FileState, Patient,HandleOptions, HandleResult} from "../interfaces/websocket";
import fs from 'fs'
import { deleteFolder } from "../web/fs-watch";
import { SETTINGS_CONFIG } from "./settings";
export let PATIENT_LIST:Patient[] = [];
import * as fss from 'fs/promises';
import path from 'path';
export const initPatients = ()=>{
    if(!fs.existsSync('./patient.txt')){
        fs.writeFileSync('./patient.txt', '[]')
    }else{
        const data = fs.readFileSync('./patient.txt', 'utf-8').trim();
        PATIENT_LIST = data ? JSON.parse(data) : [];
    }
}
initPatients()
export const savePatients = ()=>{
    try{
        fs.writeFileSync('./patient.txt', JSON.stringify(PATIENT_LIST, null,2))
        console.log('Patients saved')
    }catch(err){
        console.log(err, 'Error saving patients')
    }
}

export const addP  = (P:Patient) =>{
    PATIENT_LIST.push(P)
    savePatients()
}

export const  removeP =(id:string) =>{
    const index = PATIENT_LIST.findIndex((P)=> P.ID = id)
    if(index != -1){
        if(SETTINGS_CONFIG && SETTINGS_CONFIG.deletePatientFolderInRR){
            deleteFolder(id)
        }
        PATIENT_LIST.splice(index,1)
        savePatients()
    } 
}

export const updateP = (patient: Patient) => {
  PATIENT_LIST = PATIENT_LIST.map((p) => {
    if (p.ID === patient.ID) {
      return patient;
    }
    return p;
  });
  savePatients();
};



export const  updateStateOfPatientFiles = (id:string,loc:'STL_File_LIST'|'DICOM_FILE_LIST'|'extra',fileName:string,state:FileState['zipping'])=> {
    if(loc == 'extra'){
        console.log(fileName)
    }
    PATIENT_LIST.map((p)=>{
        if(p.ID == id){
            p[loc]?.map((str)=>{
                if(fileName == str.name){
                    str.zipping = state;
                    return str
                }
                return str
            })
        }
        return p
    })
    if(loc == 'extra'){
        console.log(PATIENT_LIST[0].extra)
    }
    savePatients()
}
export const getP = async (id: string): Promise<Patient> => {
  const patient = PATIENT_LIST.find((p) => p.ID === id);

  if (!patient) {
    throw new Error(`Patient with ID ${id} not found`);
  }

  return patient;
};



export async function handlePatientFolder({
  patientFolder,
  serverListDir,
  checkbox,
  select = null,
}: HandleOptions): Promise<HandleResult> {
  const patientName = path.basename(patientFolder);
  const destPatientPath = path.join(serverListDir, patientName);
  console.log(patientFolder, serverListDir, checkbox, select )
  try {
    const exists = await dirExists(destPatientPath);

    // --- CASE 1: no checkbox + no select → copy full patient folder ---
    if (!checkbox && !select) {
      if (exists) {
        throw new Error(`Patient folder already exists at ${destPatientPath}`);
      }
      await fss.cp(patientFolder, destPatientPath, { recursive: true });
      return { status: 'ok', action: 'copied', message: `Copied new patient folder: ${patientName}` };
    }

    // --- CASE 2: checkbox checked + no select → move existing into OLD SCAN + add NEW SCAN ---
    if (checkbox && !select) {
      const oldScanPath = path.join(destPatientPath, 'OLD SCAN');
      const newScanPath = path.join(destPatientPath, 'NEW SCAN');

      await fss.mkdir(destPatientPath, { recursive: true });

      // Move all existing items (transfer) into OLD SCAN
      await moveExisting(destPatientPath, oldScanPath);

      // Copy new incoming patient folder into NEW SCAN
      await fss.cp(patientFolder, newScanPath, { recursive: true });

      return { status: 'ok', action: 'old+new', message: `Moved old data to OLD SCAN and copied new data to NEW SCAN.` };
    }

    // --- CASE 3: no checkbox + select chosen → copy to a new subfolder beside OLD SCAN ---
    if (!checkbox && select) {
      const newScanPath = path.join(destPatientPath, select);
      await fss.mkdir(destPatientPath, { recursive: true });
      await fss.cp(patientFolder, newScanPath, { recursive: true });

      return { status: 'ok', action: 'new-scan', message: `Copied data into scan folder: ${select}` };
    }

    return { status: 'error', message: 'Unhandled case.' };
  } catch (err: any) {
    console.error('❌ Folder handling error:', err.message);
    return { status: 'error', message: err.message };
  }
}

/* ---------- helpers ---------- */

async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fss.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Moves all existing subfolders/files from `fromDir` → into `oldScanPath`.
 * Skips "OLD SCAN" itself if it already exists.
 */
async function moveExisting(fromDir: string, oldScanPath: string): Promise<void> {
  await fss.mkdir(oldScanPath, { recursive: true });
  const entries = await fss.readdir(fromDir);
  for (const entry of entries) {
    if (entry === 'OLD SCAN') continue;
    const src = path.join(fromDir, entry);
    const dest = path.join(oldScanPath, entry);
    await fss.rename(src, dest);
  }
}
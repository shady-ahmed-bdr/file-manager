import { FileState, Patient } from "../interfaces/websocket";
import fs from 'fs'
import { deleteFolder } from "../web/fs-watch";
import { SETTINGS_CONFIG } from "./settings";
export let PATIENT_LIST:Patient[] = [];

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
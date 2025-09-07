import { Patient } from "../interfaces/websocket";
import fs from 'fs'

export let PATIENT_LIST:Patient[] = [];

export const initPatients = ()=>{
    if(!fs.existsSync('./patient.txt')){
        fs.writeFileSync('./patient.txt', '[]')
    }else{
        const data = fs.readFileSync('./settings.txt', 'utf-8').trim();
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
        PATIENT_LIST.splice(index,1)
        savePatients()
    } 
}

export const updateP = (patient:Patient)=>{
    PATIENT_LIST.map((p)=>{
        if(p.ID = patient.ID){
            return patient
        }
        return p
    })
    savePatients()
}
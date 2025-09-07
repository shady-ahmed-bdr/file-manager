import fs from 'fs'
import { SettingsTS } from '../interfaces/websocket'

export let SETTINGS_CONFIG:SettingsTS;

export const initSettings = ()=>{
    if(!fs.existsSync('./settings.json')){
        fs.writeFileSync('./settings.txt', '')
    }else{
        const data = fs.readFileSync('./settings.txt').toString()
        SETTINGS_CONFIG  = JSON.parse(data)
    }
}
initSettings()

export const saveSettings = (data:object)=>{
    try{
        fs.writeFileSync('./settings.txt', JSON.stringify(data, null, 2))
    }catch(err){
        console.log(err)
    }
}
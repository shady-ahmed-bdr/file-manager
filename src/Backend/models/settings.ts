import fs from 'fs'
import { SettingsTS } from '../interfaces/websocket'

export let SETTINGS_CONFIG:SettingsTS;

export const initSettings = ()=>{
    console.log(!fs.existsSync('./settings.txt'))
    if(!fs.existsSync('./settings.txt')){
        fs.writeFileSync('./settings.txt', '{}')
    }else{
        const data = fs.readFileSync('./settings.txt', 'utf-8').trim();
        SETTINGS_CONFIG = data ? JSON.parse(data) : {};
        console.log(SETTINGS_CONFIG)
    }
}
initSettings()

export const saveSettings = (data:SettingsTS)=>{
    try{
        console.log(data, 'saved')
        SETTINGS_CONFIG = data;
        fs.writeFileSync('./settings.txt', JSON.stringify(data, null, 2))
    }catch(err){
        console.log(err)
    }
}

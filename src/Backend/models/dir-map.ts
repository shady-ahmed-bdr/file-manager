import {readdirSync} from 'fs';
import path from 'path'; 
import { SETTINGS_CONFIG } from './settings';



export const getDir = (keys:string[]):string[]=>{
    if(keys.length != 0){
        if(SETTINGS_CONFIG.archivePath == undefined) return [];
        const dirPath = path.join(...keys)
        const dir = readdirSync(dirPath,{withFileTypes:false}) as string []
        return dir
    }else if(SETTINGS_CONFIG && SETTINGS_CONFIG.archivePath){
        const dir = readdirSync(SETTINGS_CONFIG.archivePath!,{withFileTypes:false}) as string []
        console.log(dir,'emptyyy')
        return dir
    }
    return []
}
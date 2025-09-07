import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Patient, SettingsTS } from '../interfaces/patients';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  settings!:SettingsTS;
  constructor(private http:HttpClient){
    const data = localStorage.getItem('appSettings')
    if(data != undefined){
      this.settings = JSON.parse(data);
    } 
  }
  removePatient(id:string):Observable<boolean>{
    return this.http.delete<boolean>('/remove'+id)
  }
  addPatient(patient:Patient){
    return this.http.post('/add',{patient,settings:this.settings})
  }
  updatePatient(patient:Patient){
    return this.http.patch('/update',{patient,settings:this.settings})
  }
  getList():Observable<Patient[]>{
    return this.http.get<Patient[]>('/list')
  }
  setSettings(){
    return this.http.post('/settings',this.settings)
  }
}

/*
'/remove'
'/add'
'/update'
'/settigs'
*/

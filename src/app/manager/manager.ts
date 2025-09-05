import { Component, signal, inject, OnInit } from '@angular/core';
import { FileState, Patient } from '../interfaces/patients';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../services/api';
@Component({
  selector: 'app-manager',
  imports:
    [MatIconModule,
      NgClass,
      FormsModule
    ],
  templateUrl: './manager.html',
  styleUrl: './manager.scss'
})
export class Manager implements OnInit {
  date:Date = new Date()
  month = String(this.date.getMonth() + 1).padStart(2, '0')
  day = String(this.date.getDate()).padStart(2, '0');
  mode: 'edite'| 'add' = 'add'
  patient=signal<Patient> ({
    name: '',
    date: { day: this.day, month: this.month },
    STL_File_LIST: [],
    DICOM_FILE_LIST: [],
    extra: [],
    ID:crypto.randomUUID()
  });
  PatientList = signal<Patient[]>([{
    name: 'Dana Daniels',
    date: { day: this.day, month: this.month },
    STL_File_LIST: [{ name: 'nameSTL.zip', zipping: 'not_found' }, { name: 'nameSTL.zip', zipping: 'pending' }],
    DICOM_FILE_LIST: [{ name: 'nameSTL.zip', zipping: 'finished' }],
    extra:[{name:'path to file',zipping:'not_found',target:'dicom'}],
    ID:crypto.randomUUID(),
    out:''
  },
{
    name: 'Dana Danielssss',
    date: { day: this.day, month: this.month },
    STL_File_LIST: [{ name: 'nameSTL.zip', zipping: 'not_found' }, { name: 'nameSTL.zip', zipping: 'pending' }],
    DICOM_FILE_LIST: [{ name: 'nameSTL.zip', zipping: 'finished' }],
    extra:[{name:'path to file',zipping:'not_found',target:'stl'}],
    ID:crypto.randomUUID(),
    out:''
  }])

  ngOnInit(): void {
    // this.api.getList()
    // .subscribe((data)=>{
    //   this.PatientList.update((P)=>{
    //     return data
    //   })
    // })
  }
  constructor(private api:Api) {
    // setTimeout(()=>{
    //   alert('finished')
    //   this.PatientList.update((list) => {
    //   const updatedList = [...list]; 
    //   updatedList[0].DICOM_FILE_LIST[0].zipping='not_found'
    //   return updatedList;
    // });
    // },5000)
   
  }
  clear(){
    this.patient.set({
      name: '',
      date: { day: this.day, month: this.month },
      STL_File_LIST: [],
      DICOM_FILE_LIST: [],
      extra: [],
      ID:crypto.randomUUID()
    }) ;
  }

  copy(text: string) {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard:', text);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
  addFile(list: FileState[]) {
    list.push({ name: '', zipping: 'not_found' });
  }

  removeFile(list: FileState[], index: number) {
    list.splice(index, 1);
  }

  addExtra() {
    this.patient.update((P)=>{
      const arr = P.extra!
      arr.push({name:'path to file',zipping:'not_found',target:'dicom'})
      P.extra = arr
      return P
    })
  }

  removeExtra(index: number) {
    this.patient.update((P)=>{
      const arr = P.extra!
      arr.splice(index, 1);
      P.extra = arr
      return P
    })
  }

  loadPatient(p: Patient) {
    alert('loaded')
    this.mode = 'edite';
    this.patient.update((a)=>p)
  }

 

  deletePatient(id:string){
    console.log(id)
    this.PatientList.update((PList)=>{
      return PList.filter((P)=>P.ID != id)
    })
  }

  updateP(p:Patient){
    this.mode = 'add';
    this.PatientList.update((P)=>{
      const patients = P.map((pp)=>{
        if(pp.ID == p.ID){
          return p 
        }else{
          return pp
        }
      })
      return patients
    })
    this.patient.set({
      name: '',
      date: { day: this.day, month: this.month },
      STL_File_LIST: [],
      DICOM_FILE_LIST: [],
      extra: [],
      ID:crypto.randomUUID()
    })
  }

   onSubmit(form: any) {
    this.PatientList.update((arr)=>{
      const newArr = arr;
      newArr.push(form)
      return newArr
    })
 
    console.log('Submitted:', this.patient());
  }
}

import { Component, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Explorer } from '../../services/explorer';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SettingsTS } from '../../interfaces/patients';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PathDialog } from './path-dialog/path-dialog';

interface MC {
  id:string; 
  src:string;dest:string, 
  state:'red'| 'yellow'| 'green'
}

@Component({
  selector: 'app-update',
  imports: [
    MatIconModule,
    FormsModule,
    MatCheckboxModule,
    RouterLink,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './update.html',
  styleUrl: './update.scss'
})
export class Update {
  active:boolean = false;
  readonly dialog = inject(MatDialog);
  openDialog(path:string,c:string) {
    const dialogRef = this.dialog.open(PathDialog, {
      data: {
        path:path,
        case:c
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }


  pathologyPath:{srcDir:string,destDir:string} = {srcDir:'',destDir:''}
  caseList = '';
  messages:string[]=['sasdasd']
  transformTextAreaAndUpdate(){
    this.active = true
    let cases=  this.caseList.split("\n").filter((r)=>r != '')
    console.log(cases)
    this.http.post<MC[]>('/update_cases',{cases}).subscribe({
      next:(res)=>{
        this.missingCasses.set(res)
      },
      error:(err)=>alert(err)
    })
    return cases
  }
  missingCasses = signal<MC[]>([])

  
  constructor(private explorer:Explorer,private http:HttpClient){
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.pathologyPath = (<SettingsTS>JSON.parse(savedSettings)).pathology ;
    }
  }
  updateSingleCase(id:string, src: string, dest:string){
    this.http.post<boolean>('/update_cases_item', {id, src, dest}).subscribe({
      next:(res)=>{
        if(res){
          this.missingCasses.update((arr)=>{
            const newArr = arr.filter((r)=> r.id!=id)
            return newArr
          })
        }else{
          alert('failed ')
        }
      }
    })
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

  openInExplorer(path:string){
    this.explorer.openInExplorer(path)
  }
  reset(){
    this.active = false;
    this.missingCasses.set([])
  }
}

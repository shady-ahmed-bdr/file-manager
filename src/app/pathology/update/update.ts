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
    let init=  this.caseList.split("\n").filter((r)=>r != '')
    console.log(init)
    return init
  }
  missingCasses = signal<{id:string; src:string;dest:string,state:'red'| 'yellow'| 'green'}[]>([
    {id:'12331', src:'12331',dest:'12331',state:'yellow'},
    {id:'12331', src:'12331',dest:'12331',state:'red'},
    {id:'12331', src:'12331',dest:'',state:'red'},
    {id:'12331', src:'12331',dest:'12331',state:'red'},
    {id:'12331', src:'12331',dest:'12331',state:'red'},
    {id:'12331', src:'',dest:'12331',state:'red'},
    {id:'12331', src:'12331',dest:'12331',state:'red'},
    {id:'12331', src:'12331',dest:'12331',state:'red'},
    {id:'12331', src:'12331',dest:'12331',state:'red'},
  ])


  constructor(private explorer:Explorer,private http:HttpClient){
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.pathologyPath = (<SettingsTS>JSON.parse(savedSettings)).pathology ;
    }
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

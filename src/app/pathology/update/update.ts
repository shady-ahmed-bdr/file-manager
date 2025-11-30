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
  transformTextArea(){
    let init=  this.caseList.split("\n").filter((r)=>r != '')
    console.log(init)
    return init
  }
  missingCasses = signal<{id:string; src:string;dest:string}[]>([
    {id:'12331', src:'12331',dest:'12331'},
    {id:'12331', src:'12331',dest:'12331'},
    {id:'12331', src:'12331',dest:'12331'},
    {id:'12331', src:'12331',dest:'12331'},
    {id:'12331', src:'12331',dest:'12331'},
    {id:'12331', src:'12331',dest:'12331'},
    {id:'12331', src:'12331',dest:'12331'},
    {id:'12331', src:'12331',dest:'12331'},
    {id:'12331', src:'12331',dest:'12331'},
  ])


  constructor(private explorer:Explorer,private http:HttpClient){
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.pathologyPath = (<SettingsTS>JSON.parse(savedSettings)).pathology ;
    }
  }

  

  
  

  // searchQuery: string = "";
  // filteredList(): {path:string,selected:boolean}[] {
  //   if (!this.searchQuery) return this.currentDirList();
  //   try {
  //     const regex = new RegExp(this.searchQuery, "i"); // case-insensitive
  //     return this.currentDirList().filter(item => regex.test(item.path));
  //   } catch (e) {
  //     // invalid regex → return full list or empty
  //     return this.currentDirList();
  //   }
  // }
  
  copy(text: string) {
    navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Text copied to clipboard:', text);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  runFile(path:string){
    this.explorer.runFile(path)
  }
  openInExplorer(path:string){
    this.explorer.openInExplorer(path)
  }
}

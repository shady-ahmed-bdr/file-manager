import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Explorer } from '../../services/explorer';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SettingsTS } from '../../interfaces/patients';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-update',
  imports: [
    MatIconModule,
    FormsModule,
    MatCheckboxModule,
    RouterLink,
    MatButtonModule
  ],
  templateUrl: './update.html',
  styleUrl: './update.scss'
})
export class Update {
  caseList = '';
  messages:string[]=['sasdasd']
  transformTextArea(){
    let init=  this.caseList.split("\n").filter((r)=>r != '')
    console.log(init)
    return init
  }
  missingCasses = signal<string[]>(['213654'])


  constructor(private explorer:Explorer,private http:HttpClient){
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      (<SettingsTS>JSON.parse(savedSettings)).pathology.destDir ;
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

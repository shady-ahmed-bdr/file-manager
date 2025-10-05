import { Component, inject, signal } from '@angular/core';
import { SettingsTS } from '../interfaces/patients';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-directory',
  imports: [MatIconModule, FormsModule],
  templateUrl: './directory.html',
  styleUrl: './directory.scss'
})
export class Directory {
currentDirList = signal<string[]>([]);
hotLinks = [
    { name: 'Documents', path: 'C:\\Users\\Documents', icon: 'description' },
    { name: 'Downloads', path: 'C:\\Users\\Downloads', icon: 'file_download' },
    { name: 'Desktop', path: 'C:\\Users\\Desktop', icon: 'desktop_windows' },
    { name: 'Projects', path: 'C:\\Projects', icon: 'folder' }
];
  base!:string;
  constructor(){
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.base = (<SettingsTS>JSON.parse(savedSettings)).archivePath ;
      this.paths[0] = this.base
      this.nav()
    }
  }
  private http = inject(HttpClient)
  paths:string[] = []
  isFolder(name: string): boolean {
    return !name.includes('.');
  }
  goTo(i:number){
    const arr = this.paths.splice(0, i+1)
    this.paths = arr
    console.log(arr)
    this.http.post<string[]>('/path/',arr).subscribe({
      next:(res)=>{
        this.currentDirList.update((arr)=>{
          arr = [...res]
          return arr
        }) 
      },
      error:()=>{
        alert('No sub directory found')
      }
    })
  }
  nav(name?:string){
    this.searchQuery = ''
    this.http.post<string[]>('/path/',name? [...this.paths,name]: this.paths).subscribe({
      next:(res)=>{
        this.currentDirList.update((arr)=>{
          arr = [...res]
          return arr
        }) 
        if(name)this.paths.push(name)
      },
      error:()=>{
        alert('No sub directory found')
      }
    })
  }

  backDir(){
    this.paths.pop()
    this.nav()
  }

  searchQuery: string = "";

  filteredList(): string[] {
    if (!this.searchQuery) return this.currentDirList();

    try {
      const regex = new RegExp(this.searchQuery, "i"); // case-insensitive
      return this.currentDirList().filter(item => regex.test(item));
    } catch (e) {
      // invalid regex → return full list or empty
      return this.currentDirList();
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
  cpWithQ(text: string){
    navigator.clipboard.writeText('"'+text+'"')
    .then(() => {
      console.log('Text copied to clipboard:', text);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
  openInExplorer(path:string){
    this.http.post('/open_exp',{path})
    .subscribe({
      next:()=>{

      },
      error:()=>{
        alert('Something went Wrong')
      }
    })
  }
  runFile(path:string){
    this.http.post('/open_file',{path})
    .subscribe({
      next:()=>{

      },
      error:()=>{
        alert('Something went Wrong')
      }
    })
  }
}

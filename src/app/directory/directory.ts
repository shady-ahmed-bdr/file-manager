import { Component, inject, signal } from '@angular/core';
import { SettingsTS } from '../interfaces/patients';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Explorer } from '../services/explorer';

@Component({
  selector: 'app-directory',
  imports: [MatIconModule, FormsModule],
  templateUrl: './directory.html',
  styleUrl: './directory.scss'
})
export class Directory {
  currentDirList = signal<string[]>([]);
  hotLinks = signal<{name:string,path:string,icon:string}[]>([])
  base!:string;
  constructor(private explorer:Explorer){
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.base = (<SettingsTS>JSON.parse(savedSettings)).archivePath ;
      this.hotLinks.update((r)=>{
        const settings = (<SettingsTS>JSON.parse(savedSettings))
        const keys:any = [];
        if(settings && settings.rrFolderPath)keys.push({ name: 'RR', path: settings.rrFolderPath, icon: 'folder' })
        if(settings && settings.downFolderPath)keys.push({ name: 'Downloads', path: settings.downFolderPath, icon: 'file_download' })
        if(settings && settings.archivePath)keys.push({ name: 'Work Dir', path: settings.archivePath, icon: 'folder' })
        if(settings && settings.imagesWatchPath)keys.push({ name: 'Images', path: settings.imagesWatchPath, icon: 'image' })
        r = [...keys] 
        return r
      })
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
  newDir(str:string){
    this.paths.length = 0;
    this.paths[0] = str
    this.nav()
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
  runFile(path:string){
    this.explorer.runFile(path)
  }
  openInExplorer(path:string){
    this.explorer.openInExplorer(path)
  }
  activeWorkDir(path:string){
    this.explorer.addActivePt(path).subscribe({
      next:(b)=>{
        if(b){
          const set = localStorage.getItem('workSet') ;
          if(!set){
            localStorage.setItem('workSet', JSON.stringify([...new Set([path])]))
          }else{
            const parsedSet = new Set(JSON.parse(set))
            parsedSet.add(path)
            localStorage.setItem('workSet',JSON.stringify([...parsedSet]))
          }
        }
      },
      error:(err)=>{
        alert(err)
      }
    })
  }
}

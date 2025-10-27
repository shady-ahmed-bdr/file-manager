import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Explorer } from '../../services/explorer';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SettingsTS } from '../../interfaces/patients';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-update',
  imports: [
    MatIconModule,
    FormsModule,
    MatCheckboxModule
  ],
  templateUrl: './update.html',
  styleUrl: './update.scss'
})
export class Update {
  constructor(private explorer:Explorer,private http:HttpClient){
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.base = (<SettingsTS>JSON.parse(savedSettings)).pathology.destDir ;
      this.hotLinks.update((r)=>{
        const settings = (<SettingsTS>JSON.parse(savedSettings))
        const keys:any = [];
        if(settings && settings.pathology.srcDir)keys.push({ name: 'src', path: settings.pathology.srcDir, icon: 'computer' })
        if(settings && settings.pathology.destDir)keys.push({ name: 'Drive', path: settings.pathology.destDir, icon: 'cloud' })
        r = [...keys] 
        return r
      })
      this.paths[0] = this.base
      this.nav()
    }
  }

  selectedForupdate:Set<string> = new Set()
  currentDirList = signal<{path:string,selected:boolean}[]>([]);
  hotLinks = signal<{name:string,path:string,icon:string}[]>([])
  base!:string;
  paths:string[] = []
  selectFn(path:string,order:boolean){
    if(order){
      this.selectedForupdate.add(path)
    }else{
      this.selectedForupdate.delete(path)
    }
    localStorage.setItem('updateRecord', JSON.stringify([...this.selectedForupdate]))
    console.log(this.selectedForupdate)
  }
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
          const data = []
          for(let i= 0; i<=res.length-1; i++){
            data.push({path:res[i],selected:false})
          }
          arr = data
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
          const data = []
          for(let i= 0; i<=res.length-1; i++){
            data.push({path:res[i],selected:false})
          }
          arr = data
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

  filteredList(): {path:string,selected:boolean}[] {
    if (!this.searchQuery) return this.currentDirList();

    try {
      const regex = new RegExp(this.searchQuery, "i"); // case-insensitive
      return this.currentDirList().filter(item => regex.test(item.path));
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
}

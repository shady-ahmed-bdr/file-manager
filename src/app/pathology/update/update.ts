import { Component, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Explorer } from '../../services/explorer';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MC, SettingsTS, updateSocket } from '../../interfaces/patients';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PathDialog } from './path-dialog/path-dialog';
import { Websocket } from '../../services/websocket';



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
  
  openDialog(path:string,MC:MC, type:'src'|'dest') {
    const obj ={ ...MC};
    const dialogRef = this.dialog.open(PathDialog, {
      data: {
        path:path,
        case:MC
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if(type == 'src'){
        obj.src = result;
      }else{
        obj.dest = result;
      }
      console.log(obj,'uuu')
      if(result) this.updateSingleCase(obj.id,obj.src,obj.dest)
    });
  }


  pathologyPath:{srcDir:string,destDir:string} = {srcDir:'',destDir:''}
  caseList = '';
  messages:string[]=['sasdasd']
  transformTextAreaAndUpdate(){
    this.active = true
    let cases=  this.caseList.split("\n").filter((r)=>r != '')
    console.log(cases)
    this.http.post('/update_cases',{cases}).subscribe()
    return cases
  }
  missingCasses = signal<MC[]>([
    {dest: '', src:'dasda', id:';54654', state:'yellow'}
  ])

  
  constructor(private explorer:Explorer,private http:HttpClient, private ws:Websocket){
    this.ws.notifications$.subscribe((msg: updateSocket )=>{
      if(msg && msg.type == 'transfer_status'){
        this.missingCasses.update((arr)=>{
          arr = arr.map((C)=>{
            if(C.id == msg.id){
              C.state = msg.state
            }
            return C
          })
          return arr
        })
      }
      if(msg && msg.type == 'transfer_status_case'){
        this.missingCasses.update((arr)=>{
          arr.push(msg as any)
          return arr
        })
      }
    })
    
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

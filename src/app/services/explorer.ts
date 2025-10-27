import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Explorer {
  private http = inject(HttpClient)
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

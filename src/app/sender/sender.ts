import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Patient, SettingsTS } from '../interfaces/patients';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-sender',
  imports: [FormsModule, MatCheckboxModule],
  templateUrl: './sender.html',
  styleUrl: './sender.scss'
})
export class Sender {
  src = '';
  dest = '';
  sendType: 'none' | 'stl' | 'dicom' = 'none';
  extract:boolean = false;
  workingA = signal<string[]>([]) ;
  workingB = signal<Patient[]>([]) ;
  pathRR: any = '';
  constructor(private http: HttpClient) {
    this.workingA.set(JSON.parse(localStorage.getItem('workSet') || '[]'));
    this.pathRR = JSON.parse(localStorage.getItem('appSettings') || '{}');
    this.http.get<Patient[]>('/list')
    .subscribe((data) => {
      this.workingB.set( [...data])
    })
  }


  copyToDest(path: string) {
    this.dest = path;
  }

  sendFile() {
    const body = { src: this.src, dest: this.dest, type: this.sendType, extract:this.extract };
    console.log(body)
    this.http.post('/sender', body).subscribe({
      next: (res) => alert('File sent successfully'),
      error: (err) => alert(err.error?.message || 'Error sending file')
    });
  }
}

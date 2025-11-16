import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Patient, SettingsTS } from '../interfaces/patients';

@Component({
  selector: 'app-sender',
  imports: [FormsModule],
  templateUrl: './sender.html',
  styleUrl: './sender.scss'
})
export class Sender {
  src = '';
  dest = '';
  sendType: 'none' | 'stl' | 'dicom' = 'none';

  workingA: string[] = [];
  workingB: Patient[] = [];
  pathRR: any = '';
  constructor(private http: HttpClient) {
    this.workingA = JSON.parse(localStorage.getItem('workSet') || '[]');
    this.pathRR = JSON.parse(localStorage.getItem('appSettings') || '{}');
    this.http.get<Patient[]>('/list')
    .subscribe((data) => {
      this.workingB = [...data]
    })
  }


  copyToDest(path: string) {
    this.dest = path;
  }

  sendFile() {
    const body = { src: this.src, dest: this.dest, sendType: this.sendType };
    this.http.post('/sender', body).subscribe({
      next: (res) => alert('File sent successfully'),
      error: (err) => alert(err.error?.message || 'Error sending file')
    });
  }
}

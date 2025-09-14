import { Component, signal, inject, OnInit } from '@angular/core';
import { extra, FileState, Patient } from '../interfaces/patients';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Api } from '../services/api';
import { Websocket } from '../services/websocket';
@Component({
  selector: 'app-manager',
  imports:
    [MatIconModule,
      NgClass,
      FormsModule
    ],
  templateUrl: './manager.html',
  styleUrl: './manager.scss'
})
export class Manager implements OnInit {
  date: Date = new Date()
  month = String(this.date.getMonth() + 1).padStart(2, '0')
  day = String(this.date.getDate()).padStart(2, '0');
  mode: 'edite' | 'add' = 'add'
  patient = signal<Patient>({
    name: '',
    date: { day: this.day, month: this.month },
    STL_File_LIST: [],
    DICOM_FILE_LIST: [],
    extra: [],
    ID: ''
  });
  PatientList = signal<Patient[]>([])

  ngOnInit(): void {
    this.api.getList()
      .subscribe((data) => {
        this.PatientList.update((P) => {
          console.log(data)
          return data
        })
      })
    this.socket.notifications$.subscribe((msg) => {
      if (msg && msg.type === 'file_status') {
        this.updateFileStatus(
          msg.id,
          msg.payload.fileType,
          msg.payload.fileName,
          msg.payload.status
        );
      }
    });
  }
  constructor(private api: Api, private socket: Websocket) { }
  clear() {
    this.patient.set({
      name: '',
      date: { day: this.day, month: this.month },
      STL_File_LIST: [],
      DICOM_FILE_LIST: [],
      extra: [],
      ID: crypto.randomUUID()
    });
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
  addFile(list: FileState[]) {
    list.push({ name: '', zipping: 'not_found' });
  }

  removeFile(list: FileState[], index: number) {
    list.splice(index, 1);
  }

  addExtra() {
    this.patient.update((P) => {
      const arr = P.extra!
      arr.push({ name: '', zipping: 'not_found', target: 'dicom' })
      P.extra = arr
      return P
    })
  }

  removeExtra(index: number) {
    this.patient.update((P) => {
      const arr = P.extra!
      arr.splice(index, 1);
      P.extra = arr
      return P
    })
  }

  loadPatient(p: Patient) {
    alert('loaded')
    this.mode = 'edite';
    this.patient.update((a) => p)
  }



  deletePatient(id: string) {
    if (confirm('Patient folder will be gone forever')) {
      this.api.removePatient(id).subscribe({
        next: () => {
          this.PatientList.update((PList) =>
            PList.filter((p) => p.ID !== id) // immutable update
          );
        },
        error: () => {
          alert('error');
        }
      });
    }
  }


  private updateFileStatus(
    id: string,
    fileType: 'STL_File_LIST' | 'DICOM_FILE_LIST' | 'extra',
    fileName: string,
    status: FileState['zipping']
  ) {
    this.PatientList.update((patients) =>
      patients.map((p) => {
        if (p.ID !== id) return p;

        const updateFileList = (list: FileState[]) =>
          list.map((file) =>
            file.name === fileName ? { ...file, zipping: status } : file
          );

        const updateExtraList = (list: extra[]) =>
          list.map((file) =>
            file.name.replace(/^"(.*)"$/, "$1").endsWith(fileName) ? { ...file, zipping: status } : file
          );

        return {
          ...p,
          STL_File_LIST:
            fileType === 'STL_File_LIST'
              ? updateFileList(p.STL_File_LIST)
              : p.STL_File_LIST,
          DICOM_FILE_LIST:
            fileType === 'DICOM_FILE_LIST'
              ? updateFileList(p.DICOM_FILE_LIST)
              : p.DICOM_FILE_LIST,
          extra:
            fileType === 'extra' && p.extra
              ? updateExtraList(p.extra)
              : p.extra,
        };
      })
    );

  }


  updateP(p: Patient) {
    this.api.updatePatient(p)
      .subscribe({
        next: () => {
          this.mode = 'add';
          this.PatientList.update((P) => {
            const patients = P.map((pp) => {
              if (pp.ID == p.ID) {
                return p
              } else {
                return pp
              }
            })
            return patients
          })
          this.patient.set({
            name: '',
            date: { day: this.day, month: this.month },
            STL_File_LIST: [],
            DICOM_FILE_LIST: [],
            extra: [],
            ID: crypto.randomUUID()
          })
        },
        error: (err) => {
          alert('error')
        }
      })
  }

  onSubmit(form: NgForm) {
    console.log(this.patient())
    if (this.patient().name) {
      this.patient().ID = crypto.randomUUID()
      this.api.addPatient(this.patient())
      .subscribe(() => {
        this.PatientList.update((arr: Patient[]) => {
          return [...arr, this.patient()];
        })
      })
    }else{
      alert('no name was provided')
    }

  }
}

import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SettingsTS } from '../../../interfaces/patients';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface DialogData {
  path: string
}

@Component({
  selector: 'app-path-dialog',
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule
  ],
  templateUrl: './path-dialog.html',
  styleUrl: './path-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathDialog {
  moveExisting: boolean = false;
  newFolderName = '';
  currentDirList = signal<string[]>([]);
  base!: string;
  constructor() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.base = (<SettingsTS>JSON.parse(savedSettings)).archivePath;
      this.paths[0] = this.base
      this.nav()
    }
  }
  private http = inject(HttpClient)
  paths: string[] = []
  readonly dialogRef = inject(MatDialogRef<PathDialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  nav(name?: string) {
    this.http.post<string[]>('/path/', name ? [...this.paths, name] : this.paths).subscribe({
      next: (res) => {
        this.currentDirList.update((arr) => {
          arr = [...res]
          return arr
        })
        if (name) this.paths.push(name)
      },
      error: () => {
        alert('No sub directory found')
      }
    })
  }

  sendFolder() {
    const body = {
      src: this.data.path,
      dest: this.paths.toString().replaceAll(',', '\\'),
      moveExisting: this.moveExisting,
      newFolderName: this.newFolderName
    };
    console.log(body)
    this.http.patch('/p_folder', body).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false)
    });
  }
  backDir() {
    this.paths.pop()
    this.nav()
  }
}

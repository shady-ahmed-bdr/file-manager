import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MC } from '../../../interfaces/patients';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface DialogData {
  path: string
  case:MC
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
  searchQuery:string = '';
  currentDirList = signal<string[]>([]);
  base!: string;
  constructor() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.base = this.data.path;
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
    this.clearSearch()
  }
  pathConstructor(){
    let url = '';
    this.paths.forEach((p)=>{
      url+= p +'\\'
    })
    console.log(url.slice(0,url.length -1))
    return url.slice(0, url.length -1)
  }
  sendFolder() {
    this.pathConstructor()
    this.dialogRef.close(this.pathConstructor())
  }
  backDir() {
    this.paths.pop()
    this.nav()
    this.clearSearch()
  }

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
  clearSearch(){
    this.searchQuery = ''
  }
}

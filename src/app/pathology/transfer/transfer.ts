import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Explorer } from '../../services/explorer';
import { SettingsTS, TransferSocket } from '../../interfaces/patients';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Websocket } from '../../services/websocket';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-transfer',
  imports: [
    MatIconModule,
    FormsModule,
    MatCheckboxModule, 
    RouterLink,
    MatButtonModule
  ],
  templateUrl: './transfer.html',
  styleUrl: './transfer.scss'
})
export class Transfer implements OnInit {
  destDirr:string = ''
  constructor(
    private explorer: Explorer,
    private http: HttpClient,
    private socket: Websocket) {
    const savedSettings = localStorage.getItem('appSettings');
    const selectedRecoreds = localStorage.getItem('updateRecord')
    const RecoredsTransfered = localStorage.getItem('transferedRecord')
    if (selectedRecoreds) this.selectedFortransfer = selectedRecoreds ? new Set(JSON.parse(selectedRecoreds)) : new Set();
    if (RecoredsTransfered) this.transferDone = RecoredsTransfered ? new Set(JSON.parse(RecoredsTransfered)) : new Set();
    if (savedSettings) {
      this.base = (<SettingsTS>JSON.parse(savedSettings)).pathology.destDir;
      this.hotLinks.update((r) => {
        const settings = (<SettingsTS>JSON.parse(savedSettings))
        const keys: any = [];
        if (settings && settings.pathology.srcDir) keys.push({ name: 'src', path: settings.pathology.srcDir, icon: 'computer' })
        if (settings && settings.pathology.destDir) {
          keys.push({ name: 'Drive', path: settings.pathology.destDir, icon: 'cloud' })
          this.destDirr = settings.pathology.destDir
        }
        r = [...keys]
        return r
      })
      this.paths[0] = this.base
      this.nav()
    }
  }
  ngOnInit(): void {
    this.socket.notifications$.subscribe((msg: TransferSocket) => {
      if (msg && msg.type === 'transfer_status') {
        if (msg.status) {
          this.transferDone.add(msg.path)
          localStorage.setItem('transferedRecord', JSON.stringify([...this.transferDone]))
          this.selectedFortransfer.delete(msg.path)
          localStorage.setItem('updateRecord', JSON.stringify([...this.selectedFortransfer]))

          this.currentDirList.update((arr) => {
            arr = arr.map((it) => {
              if (this.transferDone.has(this.paths.join('\\') + '\\' + it.path)) {
                it.selected = false;
                return it
              }
              return it
            })
            return arr
          })

        } else {}
      }
    });
  }
  selectedFortransfer: Set<string> = new Set()
  transferDone: Set<string> = new Set()
  currentDirList = signal<{ path: string, selected: boolean }[]>([]);
  hotLinks = signal<{ name: string, path: string, icon: string }[]>([])
  base!: string;
  paths: string[] = []

  isFolder(name: string): boolean {
    return !name.includes('.');
  }
  goTo(i: number) {
    const arr = this.paths.splice(0, i + 1)
    this.paths = arr
    console.log(arr)
    this.http.post<string[]>('/path/', arr).subscribe({
      next: (res) => {
        this.currentDirList.update((arr) => {
          let data = []
          for (let i = 0; i <= res.length - 1; i++) {
            data.push({ path: res[i], selected: false })
          }
          data = data.map((it) => {
            if (this.selectedFortransfer.has(this.paths.join('\\') + '\\' + it.path)) {
              it.selected = true;
              return it
            }
            return it
          })
          console.log(data)
          arr = data
          return arr
        })
      },
      error: () => {
        alert('No sub directory found')
      }
    })
  }
  nav(name?: string) {
    this.lastSelectedIndex = null;
    this.searchQuery = ''
    this.http.post<string[]>('/path/', name ? [...this.paths, name] : this.paths).subscribe({
      next: (res) => {
        if (name) this.paths.push(name)
        this.currentDirList.update((arr) => {
          let data = []
          for (let i = 0; i <= res.length - 1; i++) {
            data.push({ path: res[i], selected: false })
          }
          data = data.map((it) => {
            if (this.selectedFortransfer.has(this.paths.join('\\') + '\\' + it.path)) {
              it.selected = true;
              return it
            }
            return it
          })
          arr = data
          return arr
        })

      },
      error: () => {
        alert('No sub directory found')
      }
    })
  }

  backDir() {
    this.paths.pop()
    this.nav()
  }

  searchQuery: string = "";

  filteredList(): { path: string, selected: boolean }[] {
    if (!this.searchQuery) return this.currentDirList();

    try {
      const regex = new RegExp(this.searchQuery, "i"); // case-insensitive
      return this.currentDirList().filter(item => regex.test(item.path));
    } catch (e) {
      // invalid regex → return full list or empty
      return this.currentDirList();
    }
  }
  newDir(str: string) {
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
  cpWithQ(text: string) {
    navigator.clipboard.writeText('"' + text + '"')
      .then(() => {
        console.log('Text copied to clipboard:', text);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
  runFile(path: string) {
    this.explorer.runFile(path)
  }
  openInExplorer(path: string) {
    this.explorer.openInExplorer(path)
  }


  lastSelectedIndex: number | null = null;

  selectFn(path: string, order: boolean, index: number, event: MouseEvent) {
    const list = this.filteredList();
    const fullPath = this.paths.join('\\') + '\\' + path;

    if (event.shiftKey && this.lastSelectedIndex !== null) {
      const start = Math.min(this.lastSelectedIndex, index);
      const end = Math.max(this.lastSelectedIndex, index);

      for (let i = start; i <= end; i++) {
        const itemPath = this.paths.join('\\') + '\\' + list[i].path;
        list[i].selected = order; 
        if (order) this.selectedFortransfer.add(itemPath);
        else this.selectedFortransfer.delete(itemPath);
      }
      this.lastSelectedIndex = index
    } else {
      if (order) this.selectedFortransfer.add(fullPath);
      else this.selectedFortransfer.delete(fullPath);
      this.lastSelectedIndex = index;
    }

    // Persist in localStorage
    localStorage.setItem('updateRecord', JSON.stringify([...this.selectedFortransfer]));
    console.log(this.selectedFortransfer);
  }

  transferPathology() {
    if (confirm('Send to the cloud?') && [...this.selectedFortransfer].length != 0)
      this.http.post('/transfer', { list: [...this.selectedFortransfer] })
        .subscribe({
          next: (res) => {
            alert('Transfer Started successfully!')
          },
          error: (err) => {
            alert('error happend!')
          }
        })
  }
}

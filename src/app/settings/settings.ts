import { Component,OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SettingsTS } from '../interfaces/patients';
@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {
  settings: SettingsTS = {
    downFolderPath: '',
    rrFolderPath: '',
    deleteAfterExtract: false,
    createStlAndDicomWhenTpDone: false,
    checkStlInDicom:false,
    createNewPatientFolder:false
  };
  private readonly localStorageKey = 'appSettings';

  ngOnInit() {
    const savedSettings = localStorage.getItem(this.localStorageKey);
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    }
  }
  onSubmit(form: NgForm) {
    if (form.valid) {
      localStorage.setItem(this.localStorageKey,JSON.stringify(this.settings))
      console.log('Form Submitted:', this.settings);
      // handle settings saving logic here
    }
  }
}

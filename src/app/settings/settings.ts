import { Component,OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SettingsTS } from '../interfaces/patients';
import { Api } from '../services/api';
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
    createNewPatientFolder:false,
    deletePatientFolderInRR:false,
    archivePath:'',
    cafWatchPath:'',
    imagesWatchPath:''
  };
  private readonly localStorageKey = 'appSettings';
  constructor(private api:Api){}
  ngOnInit() {
    const savedSettings = localStorage.getItem(this.localStorageKey);
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    }
  }
  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Form Submitted:', this.settings);
      localStorage.setItem(this.localStorageKey,JSON.stringify(this.settings))
      // handle settings saving logic here
      this.api.setSettings(this.settings)
      .subscribe({
        next: (response) => {
          alert('Settings saved successfully!');
        },
        error: (error) => { console.error('Error saving settings:', error); }
      }) 
    }else{
      alert('Please fill in all required fields correctly.');
    }
  }
}

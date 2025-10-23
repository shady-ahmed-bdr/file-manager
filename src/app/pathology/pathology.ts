import { Component } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { Update } from './update/update';
import { Transfer } from './transfer/transfer';
@Component({
  selector: 'app-pathology',
  imports: [MatTabsModule, Update, Transfer],
  templateUrl: './pathology.html',
  styleUrl: './pathology.scss'
})
export class Pathology {

}

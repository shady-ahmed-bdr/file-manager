import { Routes } from '@angular/router';
import { Manager }from './manager/manager';
import { Settings } from './settings/settings';
import { Sender } from './sender/sender';
import { Directory } from './directory/directory';

export const routes: Routes = [
    {path:'',component: Manager},
    {path:'settings', component:Settings},
    {path:'directory', component:Directory},
    {path:'sender', component:Sender},
];

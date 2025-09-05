import { Routes } from '@angular/router';
import { Manager }from './manager/manager';
import { Settings } from './settings/settings';

export const routes: Routes = [
    {path:'',component: Manager},
    {path:'settings', component:Settings}
];

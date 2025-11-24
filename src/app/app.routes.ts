import { Routes } from '@angular/router';
import { Manager }from './manager/manager';
import { Settings } from './settings/settings';
import { Sender } from './sender/sender';
import { Directory } from './directory/directory';
import { Pathology } from './pathology/pathology';
import { Tabs } from './pathology/tabs/tabs';
import { Update } from './pathology/update/update';
import { Transfer } from './pathology/transfer/transfer';
import { Logs } from './pathology/logs/logs';

export const routes: Routes = [
    {path:'',component: Manager},
    {path:'settings', component:Settings},
    {path:'directory', component:Directory},
    {path:'sender', component:Sender},
    {path:'pathology',component:Pathology,
        children:[
            {path: '', component: Tabs},
            {path: 'update', component: Update},
            {path: 'transfer', component: Transfer},
            {path: 'logs', component: Logs},
        ]
    }
];

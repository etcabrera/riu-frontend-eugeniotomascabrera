import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        loadChildren: () => import('./features/superheroes/superheroes.routes').then(m => m.routes)
    }
];

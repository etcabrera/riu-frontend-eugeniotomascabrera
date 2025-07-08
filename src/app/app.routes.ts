import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { SuperheroesListComponent } from './features/superheroes/pages/superheroes-list/superheroes-list.component';
import { SuperheroesEditComponent } from './features/superheroes/pages/superheroes-edit/superheroes-edit.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'superheroes',
                pathMatch: 'full'
            },
            {
                path: 'superheroes',
                component: SuperheroesListComponent
            },
            // {
            //     path: 'superheroes/:id',
            //     component: SuperheroesViewComponent
            // },
            {
                path: 'superheroes/:id/edit',
                component: SuperheroesEditComponent
            },
            {
                path: 'superheroes/new',
                component: SuperheroesEditComponent
            }
        ]
    }
];

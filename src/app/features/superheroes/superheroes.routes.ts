import { Routes } from '@angular/router';
import { SuperheroesListComponent } from './pages/superheroes-list/superheroes-list.component';
import { SuperheroEditComponent } from './pages/superhero-edit/superhero-edit.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'superheroes',
        pathMatch: 'full'
    },
    {
        path: 'superheroes',
        component: SuperheroesListComponent
    },
    {
        path: 'superheroes/:superheroId/edit',
        component: SuperheroEditComponent
    },
    {
        path: 'superheroes/new',
        component: SuperheroEditComponent
    }
]
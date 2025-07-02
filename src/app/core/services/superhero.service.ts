import { Injectable, signal } from '@angular/core';

import { Superhero } from '../models/superhero.model';
import { MOCK_SUPERHEROES } from './superhero-mock-data';

@Injectable({ providedIn: 'root' })
export class SuperheroService {
    private _superheroes = signal<Superhero[]>(MOCK_SUPERHEROES);
    readonly superheroes = this._superheroes.asReadonly();

    // Consultar todos los súper héroes.
    get getSuperheroes() {
        return this.superheroes();
    }

    // Consultar un único súper héroe por id.
    getSuperheroById(id: number) {
        return this.superheroes().find(superhero => superhero.id === id);
    }

    // Consultar todos los súper héroes que contienen, en su nombre, el valor de un parámetro enviado en la petición.
    getSuperheroesByName(name: string) {
        return this.superheroes().filter(superhero => superhero.name.toLowerCase().includes(name.toLowerCase()));
    }

    // Registrar un nuevo super heroe.
    addSuperhero(superhero: Superhero) {
        const newSuperhero: Superhero = {
            ...superhero,
            id: this.superheroes().length + 1,
        };
        this._superheroes.update((oldSuperheroes) => [...oldSuperheroes, newSuperhero]);
    }

    // Actualizar un súper héroe.
    updateSuperhero(superhero: Superhero) {
        this._superheroes.update(oldSuperheroes => {
            return oldSuperheroes.map(oldSuperhero => {
                return oldSuperhero.id === superhero.id ? { ...superhero } : oldSuperhero;
            });
        });
    }

    // Eliminar un súper héroe.
    deleteSuperhero(id: number) {
        this._superheroes.update(oldSuperheroes => {
            return oldSuperheroes.filter(oldSuperhero => oldSuperhero.id !== id);
        });
    }
}
import { computed, Injectable, signal } from '@angular/core';

import { Superhero } from '../models/superhero.model';
import { MOCK_SUPERHEROES } from './superhero-mock-data';

@Injectable({ providedIn: 'root' })
export class SuperheroService {
    private _superheroes = signal<Superhero[]>(MOCK_SUPERHEROES);
    readonly superheroes = this._superheroes.asReadonly();
    getSuperheroes = computed(() => this._superheroes());

    getSuperheroById(id: number) {
        return this.superheroes().find(superhero => superhero.id === id);
    }

    getSuperheroesByName(name: string) {
        return this.superheroes().filter(superhero => superhero.name.toLowerCase().includes(name.toLowerCase()));
    }

    addSuperhero(superhero: Superhero) {
        const newSuperhero: Superhero = {
            ...superhero,
            id: this.superheroes().length + 1,
        };
        this._superheroes.update((oldSuperheroes) => [...oldSuperheroes, newSuperhero]);
    }

    updateSuperhero(superhero: Superhero) {
        this._superheroes.update(oldSuperheroes => {
            return oldSuperheroes.map(oldSuperhero => {
                return oldSuperhero.id === superhero.id ? { ...superhero } : oldSuperhero;
            });
        });
    }

    deleteSuperhero(id: number) {
        this._superheroes.update(oldSuperheroes => {
            return oldSuperheroes.filter(oldSuperhero => oldSuperhero.id !== id);
        });
    }

    getPowers() {
        const powers = new Set<string>();
        
        this.superheroes().forEach(superhero => {
            superhero.powers.forEach(power => {
                powers.add(power);
            });
        });
        return Array.from(powers).sort();
    }
}
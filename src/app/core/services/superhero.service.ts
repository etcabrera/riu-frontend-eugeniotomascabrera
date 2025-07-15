import { computed, Injectable, signal } from '@angular/core';

import { Superhero } from '../models/superhero.model';
import { MOCK_SUPERHEROES } from './superhero-mock-data';
import { delay, Observable, of, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SuperheroService {
    private _superheroes = signal<Superhero[]>(MOCK_SUPERHEROES);
    superheroes = computed(() => this._superheroes());

    isNameRepeated(name: string, currentSuperheroId?: number): boolean {
        const lowerCaseName = name.toLowerCase();
        return this.superheroes().some(s =>
            s.name.toLowerCase() === lowerCaseName &&
            (currentSuperheroId === undefined || s.id !== currentSuperheroId)
        );
    }

    getSuperheroById(id: number): Observable<Superhero | undefined> {
        const foundSuperhero = this._superheroes().find(s => s.id === id);
        return of(foundSuperhero).pipe(
            tap(() => {
                if (foundSuperhero) {
                    console.log(`[Simulated Backend] Superhero with ID ${id} found.`);
                } else {
                    console.warn(`[Simulated Backend] Superhero with ID ${id} not found.`);
                }
            }));
    }

    getSuperheroesByName(name: string) {
        return this.superheroes().filter(superhero => superhero.name.toLowerCase().includes(name.toLowerCase()));
    }

    getHighestId(): number {
        const currentSuperheroes = this.superheroes();
        if (currentSuperheroes.length === 0) {
            return 0;
        }
        const maxId = Math.max(...currentSuperheroes.map(s => s.id));
        return maxId;
    }

    addSuperhero(superhero: Superhero) {
        const newSuperhero: Superhero = {
            ...superhero,
            id: this.getHighestId() + 1,
        };
        this._superheroes.update( oldSuperheroes => [...oldSuperheroes, newSuperhero]);
    }

    updateSuperhero(superhero: Superhero) {
        this._superheroes.update(oldSuperheroes => {
            return oldSuperheroes.map(oldSuperhero => {
                return oldSuperhero.id === superhero.id ? { ...superhero } : oldSuperhero;
            });
        });
    }

    deleteSuperhero(id: number): Observable<any> {
        const currentSuperheroes = this._superheroes();
        const superheroToDelete = currentSuperheroes.find(s => s.id === id);

        if (!superheroToDelete) {
            return throwError(() => new Error(`Superhero with id ${id} not found.`)).pipe(
                delay(500)
            );
        }
        return of(undefined).pipe(
            delay(500),
            tap(() => {
                const initialLength = currentSuperheroes.length;
                const updatedSuperheroes = currentSuperheroes.filter(s => s.id !== id);
                
                if (updatedSuperheroes.length < initialLength) {
                    this._superheroes.set(updatedSuperheroes);
                } else {
                    throw new Error(`Failed to delete superhero with id ${id}.`);
                }
            })
        );
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
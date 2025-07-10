import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";

import { SuperheroService } from "./superhero.service"
import { provideHttpClient } from "@angular/common/http";
import { MOCK_SUPERHEROES } from "./superhero-mock-data";

describe('Superhero service', () => {
    let service: SuperheroService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SuperheroService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZonelessChangeDetection()
            ]
        });
        service = TestBed.inject(SuperheroService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    })
    
    it('should return all superheroes as a signal', () => {
        expect(service.superheroes()).toEqual(MOCK_SUPERHEROES);
    })

    it('should correctly identify repeated names', () => {
        const existingHeroName = MOCK_SUPERHEROES[0].name;
        expect(service.isNameRepeated(existingHeroName)).toBeTrue();
    })

    it('should correctly identify non-repeated names', () => {
        const newHeroName = 'New Hero';
        expect(service.isNameRepeated(newHeroName)).toBeFalse();
    })

    it('should identify repeated names excluding the current superhero', () => {
       const existingHero = MOCK_SUPERHEROES[0];
       const anotherHero = MOCK_SUPERHEROES[1];

       expect(service.isNameRepeated(existingHero.name, existingHero.id)).toBeFalse();

       expect(service.isNameRepeated(anotherHero.name, existingHero.id)).toBeTrue();
    });

    it('should return a superhero by ID', done => {
        const superheroId = MOCK_SUPERHEROES[0].id;
        const expectedSuperhero = MOCK_SUPERHEROES[0];

        service.getSuperheroById(superheroId).subscribe( superhero => {
            expect(superhero).toEqual(expectedSuperhero);
            done()
        });
    });

    it('should return undefined for a non-existent superhero', done => {
        const nonExistentId = 50;
        service.getSuperheroById(nonExistentId).subscribe( superhero => {
            expect(superhero).toBeUndefined();
            done();
        });
    });

    it('should filter superheroes by name', () => {
        const searchName = MOCK_SUPERHEROES[0].name.substring(1, 4);
        const filteredSuperheroes = service.getSuperheroesByName(searchName);
        expect(filteredSuperheroes.length).toBeGreaterThan(0);
        expect(filteredSuperheroes[0].name).toContain(searchName);
    });

    it('should get the highest ID', () => {
        const highestId = service.getHighestId();
        expect(highestId).toBeGreaterThan(0);
        expect(highestId).toBe(Math.max(...MOCK_SUPERHEROES.map(s => s.id)));
    });

    it('should add a new superhero', () => {
        const newSuperhero = {
            id: 0,
            name: 'New Hero',
            universe: 'Other',
            powers: ['New Power'],
            biography: 'A new superhero in the city.'
        };

        service.addSuperhero(newSuperhero);
        expect(service.superheroes().length).toBe(MOCK_SUPERHEROES.length + 1);

        const addedHero = service.superheroes()[service.getHighestId() - 1];

        expect(addedHero.name).toEqual('New Hero');
        expect(addedHero.id).toBeGreaterThan(service.getHighestId() - 1);
    });

    it('should update an existing hero', () => {
        const superheroToUpdate = {...MOCK_SUPERHEROES[0], name: 'Updated Hero'};
        service.updateSuperhero(superheroToUpdate);

        const updatedHero = service.superheroes().find(s => s.id === superheroToUpdate.id);
        expect(updatedHero!.name).toEqual('Updated Hero');
    });

    it('should delete an existing hero', done => {
        const superheroToDelete = MOCK_SUPERHEROES[0];
        service.deleteSuperhero(superheroToDelete.id).subscribe(() => {
            expect(service.superheroes().length).toBe(MOCK_SUPERHEROES.length - 1);
            expect(service.superheroes().some(s => s.id === superheroToDelete.id)).toBeFalse();
            done();
        });
    });

    it('should throw an error when deleting a non-existent hero', done => {
        const nonExistentId = 50;
        service.deleteSuperhero(nonExistentId).subscribe({
            next: () => fail('Expected an error'),
            error: (error: Error) => {
                expect(error.message).toContain(`Superhero with id ${nonExistentId} not found.`);
                done();
            }
        });
    })

    it('should get the list of powers', () =>{
        const powers = service.getPowers();
        expect(powers.length).toBeGreaterThan(0);
        expect(powers).toContain('Super strength');
        expect(powers).toContain('Martial arts');
        expect(powers).toEqual(powers.sort());
    });
})
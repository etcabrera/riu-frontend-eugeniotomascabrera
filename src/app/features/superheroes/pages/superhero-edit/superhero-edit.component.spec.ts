import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SuperheroEditComponent } from "./superhero-edit.component"
import { HarnessLoader } from "@angular/cdk/testing";
import { SuperheroService } from "../../../../core/services/superhero.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MOCK_SUPERHEROES } from "../../../../core/services/superhero-mock-data";
import { delay, of, ReplaySubject } from "rxjs";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { provideZonelessChangeDetection } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatChipInputEvent, MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatChipListboxHarness } from "@angular/material/chips/testing";

describe('Superhero edit component', () => {
    let component: SuperheroEditComponent;
    let fixture: ComponentFixture<SuperheroEditComponent>;
    let loader: HarnessLoader;
    let compiled: HTMLElement;

    let mockSuperheroService: jasmine.SpyObj<SuperheroService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockMatSnackBar: jasmine.SpyObj<MatSnackBar>;
    let mockActivatedRoute: { paramMap: ReplaySubject<any>, snapshot: any };

    beforeEach(async () => {
        mockSuperheroService = jasmine.createSpyObj('SuperheroService', [
            'getPowers',
            'isNameRepeated',
            'getSuperheroById',
            'addSuperhero',
            'updateSuperhero',
            'superheroes'
        ]);

        mockSuperheroService.superheroes.and.returnValue(MOCK_SUPERHEROES);
        mockSuperheroService.getPowers.and.returnValue(['Flight', 'Super Strength', 'Telepathy']);

        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
        mockActivatedRoute = {
            paramMap: new ReplaySubject(1),
            snapshot: {
                paramMap: {
                    get: (key: string) => null
                }
            }
        };

        await TestBed.configureTestingModule({
            imports: [
                SuperheroEditComponent,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatAutocompleteModule,
                MatChipsModule,
                MatSelectModule,
                MatIconModule,
                MatButtonModule,
                MatProgressSpinnerModule
            ],
            providers: [
                provideZonelessChangeDetection(),
                { provide: SuperheroService, useValue: mockSuperheroService },
                { provide: Router, useValue: mockRouter },
                { provide: MatSnackBar, useValue: mockMatSnackBar },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SuperheroEditComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
        compiled = fixture.nativeElement;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form for new superhero when no ID is provided', () => {
        mockActivatedRoute.paramMap.next({ get: (key: string) => null });
        fixture.detectChanges();

        expect(component.superheroForm.value).toEqual({
            id: 0,
            name: '',
            universe: 'Other',
            biography: '',
            powers: []
        });
        expect(component.isNew()).toBeTrue();
        expect(compiled.querySelector('h1')!.textContent).toEqual('New superhero');
    });

    it('should load superhero data when an ID is provided', async () => {
        const heroId = 1;
        const heroToEdit = { ...MOCK_SUPERHEROES[0] };
        heroToEdit.id = heroId;

        mockSuperheroService.getSuperheroById.and.returnValue(
            of(heroToEdit).pipe(delay(700))
        );

        fixture.componentRef.setInput('superheroId', heroId.toString());
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.isLoading()).toBeTrue();
        expect(component.isNew()).toBeFalse();
        expect(mockSuperheroService.getSuperheroById).toHaveBeenCalledWith(heroId);

        await new Promise(resolve => setTimeout(resolve, 1500));
        fixture.detectChanges();

        expect(component.isLoading()).toBeFalse();
        expect(compiled.querySelector('h1')!.textContent).toContain('Edit superhero');
        expect(component.superheroForm.value.name).toEqual(heroToEdit.name);
        expect(component.superheroForm.value.id).toEqual(heroToEdit.id);
        expect(mockSuperheroService.getSuperheroById).toHaveBeenCalledWith(heroId);

        expect(component.currentSuperheroPowers()).toEqual(heroToEdit.powers);

        const nameInput = await loader.getHarness(MatInputHarness.with({ selector: '[formControlName="name"]' }));
        expect(await nameInput.getValue()).toEqual(heroToEdit.name);
    });

    it('should mark form as touched and not submit if invalid', async () => {
        expect(component.superheroForm.invalid).toBeTrue();

        const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
        await saveButton.click();

        fixture.detectChanges();

        expect(component.superheroForm.touched).toBeTrue();
        expect(component.superheroForm.controls.name.touched).toBeTrue();
        expect(component.superheroForm.controls.powers.touched).toBeTrue();
        expect(component.superheroForm.controls.universe.touched).toBeTrue();
        expect(component.superheroForm.controls.biography.touched).toBeTrue();

        expect(mockSuperheroService.addSuperhero).not.toHaveBeenCalled();
        expect(mockSuperheroService.updateSuperhero).not.toHaveBeenCalled();

        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should call addSuperhero and navigate on new superhero submission', async () => {
        component.isNew.set(true);
        fixture.detectChanges();

        component.superheroForm.patchValue({
            name: 'New Hero',
            universe: 'Marvel',
            biography: 'This is a brand new superhero with amazing powers.',
            id: 0
        });
        component.currentSuperheroPowers.set(['Flight', 'Invisibility']);

        mockSuperheroService.isNameRepeated.and.returnValue(false);
        component.superheroForm.controls.name.updateValueAndValidity();
        await new Promise(resolve => setTimeout(resolve, 50));
        fixture.detectChanges();

        expect(component.superheroForm.valid).toBeTrue();

        const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
        await saveButton.click();

        fixture.detectChanges();

        expect(mockSuperheroService.addSuperhero).toHaveBeenCalledOnceWith({
            id: 0,
            name: 'New Hero',
            universe: 'Marvel',
            biography: 'This is a brand new superhero with amazing powers.',
            powers: ['Flight', 'Invisibility']
        });

        expect(mockMatSnackBar.open).toHaveBeenCalledWith('✅ Superhero added successfully', '', { duration: 5000 });

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/superheroes']);
    });

    it('should call updateSuperhero and navigate on existing superhero submission', async () => {
        const heroId = 1;
        const existingHero = { ...MOCK_SUPERHEROES[0], id: heroId };
        const updatedName = 'Updated Hero Name';
        const updatedBiography = 'This is an updated biography for an existing superhero. It needs to be at least 40 characters long.';
        const updatedPowers = ['Super Strength', 'Flight', 'Telekinesis'];

        //set the component to edit mode for an existing hero
        mockSuperheroService.getSuperheroById.and.returnValue(
            of(existingHero).pipe(delay(700))
        );
        mockSuperheroService.isNameRepeated.and.returnValue(false);
        mockSuperheroService.updateSuperhero.and.returnValue(undefined);

        fixture.componentRef.setInput('superheroId', heroId.toString());
        component.ngOnInit();
        fixture.detectChanges();

        await new Promise(resolve => setTimeout(resolve, 1500));
        fixture.detectChanges();

        expect(component.isLoading()).toBeFalse();
        expect(component.isNew()).toBeFalse();
        expect(component.superheroForm.value.id).toEqual(heroId);

        //modify the form with the updated data
        component.superheroForm.patchValue({
            name: updatedName,
            universe: 'DC Comics',
            biography: updatedBiography,
            id: heroId
        });
        component.currentSuperheroPowers.set(updatedPowers);

        component.superheroForm.controls.name.updateValueAndValidity();
        await new Promise(resolve => setTimeout(resolve, 10));
        fixture.detectChanges();

        expect(component.superheroForm.valid).toBeTrue();

        //submit the form
        const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Update' }));
        await saveButton.click();
        fixture.detectChanges();

        //verify expected calls
        const expectedUpdatedHero = {
            id: heroId,
            name: updatedName,
            universe: 'DC Comics',
            biography: updatedBiography,
            powers: updatedPowers
        };

        expect(mockSuperheroService.updateSuperhero).toHaveBeenCalledOnceWith(expectedUpdatedHero);
        expect(mockSuperheroService.addSuperhero).not.toHaveBeenCalled();

        expect(mockMatSnackBar.open).toHaveBeenCalledWith('✅ Superhero updated successfully', '', { duration: 5000 });

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/superheroes']);
    });

    it('should call onReset and clear the form', async () => {
        component.superheroForm.patchValue({
            name: 'Hero To Reset',
            universe: 'Marvel',
            biography: 'This is a biography that will be reset. It must be at least 40 characters long.',
            id: 0
        });
        component.currentSuperheroPowers.set(['Flying', 'Strength']);
        fixture.detectChanges();

        expect(component.superheroForm.value.name).toEqual('Hero To Reset');
        expect(component.currentSuperheroPowers()).toEqual(['Flying', 'Strength']);

        const resetButton = await loader.getHarness(MatButtonHarness.with({ text: 'Reset' }));
        await resetButton.click();
        fixture.detectChanges();

        expect(component.superheroForm.value).toEqual({
            id: 0,
            name: '',
            universe: 'Other',
            biography: '',
            powers: []
        });
        expect(component.currentSuperheroPowers()).toEqual([]);
    });

    it('should navigate to superheroes list when onCancel is called', () => {
        component.onCancel();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/superheroes']);
    });

    //Chips & autocomplete

    it('should add a power to currentSuperheroPowers on addPower event', async () => {
        const initialPowers = component.currentSuperheroPowers().length;
        const input = await loader.getHarness(MatInputHarness.with({ selector: '[name="powers"]' }));
        await input.setValue('New Power');

        const mockChipInput = { clear: jasmine.createSpy('clear') };
        const mockHtmlInput = document.createElement('input');
        const createEvent = (value: string): MatChipInputEvent => ({
            value: value,
            chipInput: mockChipInput as any,
            input: mockHtmlInput
        });

        component.addPower(createEvent('New Power'));
        fixture.detectChanges();

        expect(component.currentSuperheroPowers().length).toEqual(initialPowers + 1);
        expect(component.currentSuperheroPowers()).toContain('New Power');
        expect(component.currentPower()).toEqual('');
        expect(component.currentPowerCtrl.value).toEqual('');
        expect(mockChipInput.clear).toHaveBeenCalledTimes(1);
    });


    it('should add and remove powers correctly', () => {
        component.currentSuperheroPowers.set([]);
        const mockChipEvent = { value: 'New Power', chipInput: { clear: () => { } } } as any;
        component.addPower(mockChipEvent);

        expect(component.currentSuperheroPowers()).toContain('New Power');

        component.removePower('New Power');
        expect(component.currentSuperheroPowers()).not.toContain('New Power');
    });

    it('should not add a duplicate power', () => {
        component.currentSuperheroPowers.set(['Flight']);
        const mockChipEvent = { value: 'Flight', chipInput: { clear: () => { } } } as any;
        component.addPower(mockChipEvent);

        expect(component.currentSuperheroPowers().length).toBe(1);
    });
})
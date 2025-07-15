import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { signal, WritableSignal } from '@angular/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { delay, of, throwError } from 'rxjs';

import { SuperheroesListComponent } from './superheroes-list.component';
import { SuperheroService } from '../../../../core/services/superhero.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Superhero } from '../../../../core/models/superhero.model';
import { MOCK_SUPERHEROES } from '../../../../core/services/superhero-mock-data';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

describe('SuperheroesListComponent', () => {
    let component: SuperheroesListComponent;
    let fixture: ComponentFixture<SuperheroesListComponent>;
    let loader: HarnessLoader;

    // Mocks y Spies
    let mockSuperheroService: {
        superheroes: WritableSignal<Superhero[]>;
        deleteSuperhero: jasmine.Spy;
    };
    let mockRouter: jasmine.SpyObj<Router>;
    let mockMatSnackBar: jasmine.SpyObj<MatSnackBar>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        mockSuperheroService = {
            superheroes: signal<Superhero[]>([]),
            deleteSuperhero: jasmine.createSpy('deleteSuperhero')
        };
        mockSuperheroService.deleteSuperhero.and.returnValue(of(false));

        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockMatDialog.open.and.returnValue({
            afterClosed: () => of(true)
        } as MatDialogRef<any, any>);
        mockMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [
                SuperheroesListComponent,
            ],
            providers: [
                provideZonelessChangeDetection(),
                { provide: SuperheroService, useValue: mockSuperheroService },
                { provide: Router, useValue: mockRouter },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: MatSnackBar, useValue: mockMatSnackBar },
            ],
        }).overrideComponent(SuperheroesListComponent, {
        remove: {
          imports: [MatDialogModule]
        }
      })
      .compileComponents();

        fixture = TestBed.createComponent(SuperheroesListComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);

        mockSuperheroService.superheroes.set([...MOCK_SUPERHEROES]);

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('Data Rendering and Initial State', () => {
        it('should display the correct number of rows in the table', async () => {
            const table = await loader.getHarness(MatTableHarness);
            const rows = await table.getRows();
            expect(rows.length).toBe(5);
        });

        it('should display superhero data correctly in a row', async () => {
            const table = await loader.getHarness(MatTableHarness);
            const firstRow = (await table.getRows())[0];
            const cells = await firstRow.getCells();
            const cellTexts = await Promise.all(cells.map(async cell => await cell.getText()));

            expect(cellTexts[0]).toBe(MOCK_SUPERHEROES[0].name);
            expect(cellTexts[1]).toBe(MOCK_SUPERHEROES[0].universe);
        });

        it('should configure the paginator correctly', async () => {
            const paginator = await loader.getHarness(MatPaginatorHarness);
            expect(await paginator.getPageSize()).toBe(5);
            expect(await paginator.getRangeLabel()).toBe(`1 – 5 of ${MOCK_SUPERHEROES.length}`);
        });
    });

    describe('Navigation', () => {
        it('should navigate to the new superhero page when "Add new superhero" is clicked', async () => {
            const addButton = await loader.getHarness(MatButtonHarness.with({ text: 'Add new superhero' }));
            await addButton.click();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/superheroes', 'new']);
        });

        it('should navigate to the edit page when an edit button is clicked', async () => {
            const editButton = await loader.getHarness(MatButtonHarness.with({ selector: '.button-edit', text: 'Edit' }));
            await editButton.click();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/superheroes', MOCK_SUPERHEROES[0].id, 'edit']);
        });
    });

    describe('Search and Filtering', () => {
        it('should filter the table when a search term is entered', async () => {
            const searchInput = await loader.getHarness(MatInputHarness.with({ selector: 'input[matInput]' }));
            await searchInput.setValue('Superman');

            const table = await loader.getHarness(MatTableHarness);
            const rows = await table.getRows();
            expect(rows.length).toBe(1);

            const firstRowText = await rows[0].getCellTextByIndex({ columnName: 'name' });
            expect(firstRowText).toContain('Superman');
        });

        it('should clear the filter when the clear button is clicked', async () => {
            const searchInput = await loader.getHarness(MatInputHarness.with({ selector: 'input[matInput]' }));
            await searchInput.setValue('Superman');

            let table = await loader.getHarness(MatTableHarness);
            let rows = await table.getRows();
            expect(rows.length).toBe(1);

            const clearButton = await loader.getHarness(MatButtonHarness.with({ selector: '[aria-label="Clear"]' }));
            await clearButton.click();

            rows = await table.getRows();
            expect(rows.length).toBe(5);
            expect(await searchInput.getValue()).toBe('');
        });
    });

    describe('Deletion Flow', () => {
        it('should open a confirmation dialog when a delete button is clicked', async () => {
            mockMatDialog.open.and.returnValue({ afterClosed: () => of(true)} as any);

            const deleteButton = await loader.getHarness(MatButtonHarness.with({ selector: '.button-delete' }));
            await deleteButton.click();
            fixture.detectChanges();
        
            expect(mockMatDialog.open).toHaveBeenCalled()
        });

        it('should call deleteSuperhero service if dialog is confirmed', async () => {
            mockMatDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
            mockSuperheroService.deleteSuperhero.and.returnValue(of(true));

            component.onDeleteSuperhero(MOCK_SUPERHEROES[0].id, 'Spider-Man');

            expect(mockSuperheroService.deleteSuperhero).toHaveBeenCalledWith(1);

            await new Promise(resolve => setTimeout(resolve, 1500));
            fixture.detectChanges();

            expect(component.isLoading()).toBeFalse();
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('✅ Superhero deleted successfully', '', jasmine.any(Object));
        });

        it('should not call deleteSuperhero service if dialog is cancelled', () => {
            mockMatDialog.open.and.returnValue({ afterClosed: () => of(false) } as any);

            component.onDeleteSuperhero(MOCK_SUPERHEROES[0].id, 'Spider-Man');

            expect(mockSuperheroService.deleteSuperhero).not.toHaveBeenCalled();
        });

        it('should show an error snackbar if deletion fails', async () => {
            mockSuperheroService.deleteSuperhero.and.returnValue(throwError(() => new Error('Deletion Failed')).pipe(delay(500)));

            component.deleteSuperhero(50);
            fixture.detectChanges();
            expect(mockSuperheroService.deleteSuperhero).toHaveBeenCalledWith(50);
            
            await new Promise(resolve => setTimeout(resolve, 800)); 
            fixture.detectChanges();

            expect(component.isLoading()).toBeFalse();
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('❌ Error deleting superhero', 'Close', jasmine.any(Object));
        });
    });
});
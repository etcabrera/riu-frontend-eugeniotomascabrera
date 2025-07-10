import { Component, computed, DestroyRef, effect, inject, input, model, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SuperheroService } from '../../../../core/services/superhero.service';
import { Router } from '@angular/router';
import { repeatedNameValidator } from '../../../../core/validators/repeated-name.validator';
import { Superhero } from '../../../../core/models/superhero.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UppercaseTextDirective } from '../../../../core/directives/uppercaseText.directive';

@Component({
  selector: 'app-superheroes-edit',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatChipsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    UppercaseTextDirective
  ],
  templateUrl: './superhero-edit.component.html',
  styleUrl: './superhero-edit.component.scss'
})
export class SuperheroEditComponent implements OnInit {
  isLoading = signal(false);
  isNew = signal(true);
  superheroId = input<string | undefined>();
  private _superheroService = inject(SuperheroService);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private _destroyRef = inject(DestroyRef);

  readonly currentPower = model<string>('')
  readonly allPowers = computed(() => this._superheroService.getPowers());
  readonly filteredPowers = computed(() => {
    const currentPowerValue = this.currentPower().toLowerCase();
    return currentPowerValue
      ? this.allPowers().filter(power => power.toLowerCase().includes(currentPowerValue))
      : this.allPowers().slice();
  });
  readonly currentSuperheroPowers: WritableSignal<string[]> = signal([]);

  currentPowerCtrl = new FormControl('');
  superheroForm = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.minLength(3)] }),
    powers: new FormControl<string[]>([], { validators: [Validators.required] }),
    universe: new FormControl<'DC Comics' | 'Marvel' | 'Other'>('Other', Validators.required),
    biography: new FormControl('', { validators: [Validators.required, Validators.minLength(40)] }),
    id: new FormControl<number>(0)
  });

  constructor() {
    effect(() => {
      const value = this.currentPowerCtrl.value;
      this.currentPower.set(value || '');
    });

    effect(() => {
      this.superheroForm.get('powers')?.setValue(this.currentSuperheroPowers(), { emitEvent: false });
    });
  }

  ngOnInit() {
    const idFromInput = this.superheroId();
    let idAsNumber: number | undefined;

    if (idFromInput !== undefined) {
      const parsedId = parseInt(idFromInput);

      if (!isNaN(parsedId)) {
        idAsNumber = parsedId;
        this.isNew.set(false);
        this.isLoading.set(true);

        this._superheroService.getSuperheroById(parsedId)
          .pipe(
            delay(700),
            takeUntilDestroyed(this._destroyRef)).subscribe({
            next: (currentSuperhero: Superhero | undefined) => {
              if (currentSuperhero) {
                this.superheroForm.patchValue({
                  name: currentSuperhero.name,
                  universe: currentSuperhero.universe as "DC Comics" | "Marvel" | "Other",
                  biography: currentSuperhero.biography,
                  id: currentSuperhero.id
                });
                this.currentSuperheroPowers.set(currentSuperhero.powers);
              } else {
                console.warn(`There is no superhero with ID: ${idAsNumber}. Redirecting...`);
                this._router.navigate(['/superheroes']);
              }
            },
            error: (err: Error) => {
              console.error(`Error loading superhero with ID: ${idAsNumber}`, err);
              this._snackBar.open('❌ Error loading superhero data', 'Close', { duration: 5000 });
              this._router.navigate(['/superheroes']);
            },
            complete: () => {
              this.isLoading.set(false); // <--- Desactiva el spinner al completar (éxito o error)
            }
          });
      } else {
        console.error(`Invalid ID in URL: ${idFromInput}. Redirecting...`);
        this._router.navigate(['/superheroes']);
        return;
      }
    }

    this.superheroForm.get('name')?.addValidators([
      Validators.required,
      Validators.minLength(3),
      repeatedNameValidator(this._superheroService, idAsNumber)
    ]);
    this.superheroForm.get('name')?.updateValueAndValidity();
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', { duration: 5000 });
  }

  onSubmit() {
    if (this.superheroForm.invalid) {
      this.superheroForm.markAllAsTouched();
      return;
    }

    const newSuperhero: Superhero = this.superheroForm.value as Superhero
    if(newSuperhero.id !== 0) {
      this._superheroService.updateSuperhero(newSuperhero);
      this.openSnackBar('✅ Superhero updated successfully');
      this._router.navigate(['/superheroes']);
      return;
    }
    this._superheroService.addSuperhero(newSuperhero);
    this.openSnackBar('✅ Superhero added successfully')
    this._router.navigate(['/superheroes']);
    return;
  }

  onReset() {
    this.superheroForm.reset({
      name: '',
      powers: [],
      universe: 'Other',
      biography: '',
      id: 0
    });
    this.superheroForm.get('powers')?.setValue([]);
    this.currentSuperheroPowers.set([]);
    this.currentPower.set('');
    this.currentPowerCtrl.setValue('');
  }

  onCancel() {
    this._router.navigate(['/superheroes']);
  }

  // Chip functions
  removePower(powerToRemove: string) {
    this.currentSuperheroPowers.update(powers => powers.filter(p => p !== powerToRemove));
  }

  addPower(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && !this.currentSuperheroPowers().includes(value)) {
      this.currentSuperheroPowers.update(powers => [...powers, value]);
    }

    this.currentPower.set('');
    this.currentPowerCtrl.setValue('');
    event.chipInput?.clear();
  }

  selectedPower(event: MatAutocompleteSelectedEvent) {
    const value = event.option.viewValue;
    if (value && !this.currentSuperheroPowers().includes(value)) {
      this.currentSuperheroPowers.update(powers => [...powers, value]);
    }

    this.currentPower.set('');
    this.currentPowerCtrl.setValue('');
  }

}

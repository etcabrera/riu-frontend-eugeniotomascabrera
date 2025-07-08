import { Component, computed, DestroyRef, effect, inject, model, signal, WritableSignal } from '@angular/core';
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

@Component({
  selector: 'app-superheroes-list',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatChipsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './superheroes-edit.component.html',
  styleUrl: './superheroes-edit.component.scss'
})
export class SuperheroesEditComponent {
  private _superheroeService = inject(SuperheroService);
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);

  readonly currentPower = model<string>('')
  readonly allPowers = computed(() => this._superheroeService.getPowers());
  readonly filteredPowers = computed(() => {
    const currentPowerValue = this.currentPower().toLowerCase();
    return currentPowerValue
      ? this.allPowers().filter(power => power.toLowerCase().includes(currentPowerValue))
      : this.allPowers().slice();
  });

  currentPowerCtrl = new FormControl('');
  currentSuperheroPowers: WritableSignal<string[]> = signal([]);
  superheroForm = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.minLength(3), repeatedNameValidator()] }),
    powers: new FormControl<string[]>([], { validators: [Validators.required] }),
    universe: new FormControl<'DC Comics' | 'Marvel' | 'Other'>('Other', Validators.required),
    biography: new FormControl('', { validators: [Validators.required, Validators.minLength(40)] })
  });

  constructor() {
    const powerSubscription = this.currentPowerCtrl.valueChanges.subscribe(value => {
      this.currentPower.set(value || '');
    });

    this._destroyRef.onDestroy(() => {
      powerSubscription.unsubscribe();
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {duration: 5000});
  }

  onSubmit() {
    if (this.superheroForm.invalid) {
      this.superheroForm.markAllAsTouched();
      return;
    }

    const newSuperhero: Superhero = this.superheroForm.value as Superhero
    this._superheroeService.addSuperhero(newSuperhero);
    this.openSnackBar('✅ Superhero added successfully')
    this.onReset();
  }

  onReset() {
    this.superheroForm.reset();
    this.superheroForm.get('powers')?.setValue([]);
  }

  onCancel() {
    this._router.navigate(['/superheroes']);
  }

  // Chip functions
  get formPowers(): string[] {
    return this.superheroForm.get('powers')?.value as string[] || [];
  }

  removePower(powerToRemove: string) {
    const currentFormPowers = this.formPowers;
    const updatedPowers = currentFormPowers.filter(p => p !== powerToRemove);
    this.superheroForm.get('powers')?.setValue(updatedPowers);
  }

  addPower(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    const currentFormPowers = this.formPowers;

    // Add our power
    if (value && !currentFormPowers.includes(value)) {
      const updatedPowers = [...currentFormPowers, value];
      this.superheroForm.get('powers')?.setValue(updatedPowers);
    }

    // Clear the input value
    this.currentPower.set('');
    this.currentPowerCtrl.setValue('');
    event.chipInput?.clear();
  }

  selectedPower(event: MatAutocompleteSelectedEvent) {
    const value = event.option.viewValue;
    const currentFormPowers = this.formPowers;

    if (value && !currentFormPowers.includes(value)) {
      const updatedPowers = [...currentFormPowers, value];
      this.superheroForm.get('powers')?.setValue(updatedPowers);
    }

    this.currentPower.set('');
    this.currentPowerCtrl.setValue('');
  }

}

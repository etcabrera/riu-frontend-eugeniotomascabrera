import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { inject } from '@angular/core';

import { SuperheroService } from '../services/superhero.service';

export function repeatedNameValidator(): ValidatorFn {
    const _superheroeService = inject(SuperheroService);

    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null; 
        }

        const names = _superheroeService.getSuperheroes().map(s => s.name.toLowerCase());
        const controlValue = (control.value as string).toLowerCase();

        if (names.includes(controlValue)) {
            return { repeatedName: true };
        }
        return null;
    };
}
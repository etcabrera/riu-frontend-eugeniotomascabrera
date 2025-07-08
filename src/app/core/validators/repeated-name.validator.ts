import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SuperheroService } from '../services/superhero.service';

export function repeatedNameValidator(superheroService: SuperheroService, optionalId?: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

        if (!control.value) {
            return null;
        }

        const controlValue = (control.value as string).toLowerCase();
        
        if (superheroService.isNameRepeated(controlValue, optionalId)) {
            return { repeatedName: true };
        }
        
        return null;
    };
}
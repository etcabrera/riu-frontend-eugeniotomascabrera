import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[uppercaseText]',
    standalone: true
})
export class UppercaseTextDirective {
    private control = inject(NgControl)
    
    @HostListener('input', ['$event'])

    onInput(event: Event): void {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)  {
            const element = event.target;
            element.value = element.value.toUpperCase();
            this.control.control?.setValue(element.value);

            const start = element.selectionStart;
            const end = element.selectionEnd;

            if (start !== null && end !== null) {
                element.setSelectionRange(start, end)
            }
        }

    }
}
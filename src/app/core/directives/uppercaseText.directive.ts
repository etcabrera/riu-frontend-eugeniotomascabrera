import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[uppercaseText]',
    standalone: true
})
export class UppercaseTextDirective {

    constructor(
        private el: ElementRef<HTMLInputElement>
    ) { }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)  {
            const element = event.target;
            const start = element.selectionStart;
            const end = element.selectionEnd;
            element.value = element.value.toUpperCase();

            if (start !== null && end !== null) {
                element.setSelectionRange(start, end)
            }
        }

    }
}
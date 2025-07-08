import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinArray'
})
export class JoinArrayPipe implements PipeTransform {

  transform(value: any[], separator: string = ','): string {
        if (!Array.isArray(value)) {
          return '';
        }
        return value.join(separator);
      }

}

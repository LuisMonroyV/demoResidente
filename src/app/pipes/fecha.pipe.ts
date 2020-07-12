import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({
  name: 'fechaCorta'
})
export class FechaPipe implements PipeTransform {

  transform(value: firebase.firestore.Timestamp, formato: string, tipo: string): string {
    moment.locale('es');
    // console.log(value.toDate());
    if (tipo === 'futuro') {
      return moment(value.toDate()).fromNow().toString();
    } else if ( tipo === 'pasado') {
      return moment(value.toDate()).fromNow().toString();
    } else if ( formato ) {
      return moment(value.toDate()).format(formato).toString();
    }
    return '';
  }

}

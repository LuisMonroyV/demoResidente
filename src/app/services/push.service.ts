import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { oneSignalConfig, firebaseConfig } from '../../environments/environment';
import { FirebaseService } from './firebase.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const OSAppIdCliente = oneSignalConfig.OSapiId;
const OSApiUrl = oneSignalConfig.OSApiUrl;
const OSRestApiKey = oneSignalConfig.OSRestApiKey;
const FBId = firebaseConfig.messagingSenderId;
const headers = new HttpHeaders({
  'Content-Type': 'application/json; charset=utf-8',
  // tslint:disable-next-line: object-literal-key-quotes
  'Authorization': 'Basic ' + OSRestApiKey
});

@Injectable({
  providedIn: 'root'
})
export class PushService {

  constructor( private oneSignal: OneSignal,
               private fbSrvc: FirebaseService,
               private http: HttpClient ) { }

  configuracionInicialCliente() {
    if ( !this.fbSrvc.oneSignalIdActualizado ) {
      console.log('PUSH configuracionInicialCliente()');
      this.oneSignal.startInit(OSAppIdCliente, FBId);
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification );

      this.oneSignal.handleNotificationReceived().subscribe((notifR) => {
      // do something when notification is received
      console.log('notificación recibida', notifR);
      if (notifR.payload.title === 'Emergencia en tu comunidad!!' ) {
        this.fbSrvc.lanzarSonido('smokeAlarm');
      } else if (notifR.payload.title === 'Nueva noticia en tu comunidad') {
        this.fbSrvc.lanzarSonido('sms');
      }
      });

      this.oneSignal.handleNotificationOpened().subscribe((notifO) => {
        // do something when a notification is opened
        console.log('notificación abierta', notifO);
      });

      // id Suscriptor
      this.oneSignal.getIds().then( info => {
        console.log('ID Movil: ', info.userId);
        this.fbSrvc.oneSignalIdCliente = info.userId;
      });
      this.oneSignal.endInit();
    }
  }

  async validarNumeroMovil() {
    if (!this.fbSrvc.oneSignalIdCliente) {
      this.oneSignal.getIds()
      .then( info => {
        if (info.userId && info.userId.length > 0) {
          this.fbSrvc.oneSignalIdCliente = info.userId;
        }
      })
      .catch (err => {
        console.log('Error al obtener id del dispositiivo: ', err);
        this.fbSrvc.mostrarMensaje('no se puso identificar el dispositivo.');
      });
    }
    const randomNum = Math.round(Math.random() * 10000);
    const body = {
      app_id: OSAppIdCliente,
      include_player_ids: [this.fbSrvc.oneSignalIdCliente],
      data: {
        codeNum: randomNum
      },
      contents: {
        en: 'Validation code for this device',
        es: 'Código de validación para el dispositivo',
      },
      headings: {
        en: 'Validación de dispositivo',
        es: 'Validación de dispositivo',
      }
    };
    return this.http.post(OSApiUrl, body, { headers } )
    .subscribe( result => {
      console.log('Respuesta oneSignal: ', result);
    });
  }

  async notificarAlerta() {
    const body = {
      app_id: OSAppIdCliente,
      included_segments: ['Subscribed Users'],
      data: {
        calle: this.fbSrvc.persona.calle,
        numero: this.fbSrvc.persona.numero,
        nombre: this.fbSrvc.persona.nombres + ' ' + this.fbSrvc.persona.apellidoPaterno
      },
      contents: {
        // tslint:disable-next-line: max-line-length
        en: `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} needs help in ${this.fbSrvc.persona.calle} ${this.fbSrvc.persona.numero}`,
        // tslint:disable-next-line: max-line-length
        es: `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} necesita ayuda en ${this.fbSrvc.persona.calle} ${this.fbSrvc.persona.numero}`
      },
      headings: {
        en: 'Alerta de Seguridad en tu comunidad',
        es: 'Alerta de Seguridad en tu comunidad'
      },
      ios_sound: 'woopWoop.mp3',
      android_sound: 'woopWoop',
    };
    console.log({body});
    return this.http.post(OSApiUrl, body, { headers } )
    .subscribe( data2 => {
      console.log('Respuesta oneSignal: ', data2);
    });
  }

  async notificarNoticia() {
    const body = {
      app_id: OSAppIdCliente,
      included_segments: ['Subscribed Users'],
      data: {
        nombre: this.fbSrvc.persona.nombres + ' ' + this.fbSrvc.persona.apellidoPaterno
      },
      contents: {
        en: 'News',
        // tslint:disable-next-line: max-line-length
        es: `Nueva noticia creada por @${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`
      },
      headings: {
        en: 'Nueva noticia de la comunidad',
        es: 'Nueva noticia de la comunidad'
      },
    };
    console.log({body});
    return this.http.post(OSApiUrl, body, { headers } )
    .subscribe( data2 => {
      console.log('Respuesta oneSignal: ', data2);
    });
  }
}

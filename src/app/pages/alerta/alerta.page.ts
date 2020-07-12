import { Component, OnInit } from '@angular/core';
import { Emergencia } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';
import { NgForm } from '@angular/forms';
import { PushService } from '../../services/push.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import * as moment from 'moment';


@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.page.html',
  styleUrls: ['./alerta.page.scss'],
})
export class AlertaPage implements OnInit {
  // movilesRegistrados: string[] = [];
  codigoAlerta = '';
  pasoActual = 'en alerta';
  nuevaEmergencia: Emergencia = {
    estado: 'Enviada',
    fechaInicio: new Date(),
    fechaTermino: null,
    guardia: null,
    idDireccion: this.fbSrvc.parametros.codigoDir,
    idEmergencia: null,
    obs: ''
  };
  constructor( public fbSrvc: FirebaseService,
               private pushSrvc: PushService,
               private webview: WebView) { }

  ngOnInit() {
  }
  siguiente( form: NgForm) {
    if (this.fbSrvc.pasoAlerta === 0) {
      this.fbSrvc.imagenAlerta = this.webview.convertFileSrc('assets/images/panic-button-1.png');
      this.fbSrvc.pasoAlerta = 1;
    } else if ( this.fbSrvc.pasoAlerta === 1) {
        if ( !form.valid || this.codigoAlerta === '') {
          this.fbSrvc.mostrarMensaje('Ingresa el código de confirmación.');
          return false;
        }
        if ( this.codigoAlerta === this.fbSrvc.parametros.codigoAlerta) {
        // enviar alerta
        this.pushSrvc.notificarAlerta()
        .then( ret => {
          // console.log('Retorno oneSignal:', ret);
          this.fbSrvc.imagenAlerta = this.webview.convertFileSrc('assets/images/panic-button-2.png');
          this.fbSrvc.mostrarMensaje('Alerta enviada.');
          this.fbSrvc.pasoAlerta = 2;
          this.fbSrvc.alertaEnviada = true;
          const hora = moment().format('HH:mm');
          // tslint:disable-next-line: max-line-length
          this.fbSrvc.textoAlerta = `Alerta enviada: ${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} necesita ayuda en ${this.fbSrvc.persona.calle} ${this.fbSrvc.persona.numero} @${hora}`;
          // Guarda emergencia en firebase
          this.nuevaEmergencia.obs = this.fbSrvc.textoAlerta;
          this.fbSrvc.postEmergencia(this.nuevaEmergencia)
          .then( () => {
            console.log('Emergencia guardada.');
          })
          .catch( err => {
            console.log('Error al guradar emergencia: ', err);
          });
        })
        .catch( err => {
          console.log('Error al notificar ususarios: ', err);
        });
      } else {
        console.log(this.codigoAlerta);
        console.log(this.fbSrvc.parametros.codigoAlerta);
        this.fbSrvc.mostrarMensaje('Código incorrrecto.');
        this.codigoAlerta = '';
      }
    } else if ( this.fbSrvc.pasoAlerta === 2) {
      this.fbSrvc.mostrarMensaje('Alerta ya fué enviada.');
    }
  }

}

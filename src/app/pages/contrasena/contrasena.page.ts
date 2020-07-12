import { Component, OnInit, ViewChild } from '@angular/core';
// import { OneSignal } from '@ionic-native/onesignal/ngx';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-contrasena',
  templateUrl: './contrasena.page.html',
  styleUrls: ['./contrasena.page.scss'],
})
export class ContrasenaPage implements OnInit {
  @ViewChild('passInput', { static: true }) passInput: IonInput;
  verPass = 'password';
  contrasenaEnviada = false;
  iconoCandado = 'lock-closed-sharp';

  constructor( public fbSrvc: FirebaseService,
               private router: Router ) { }

  ngOnInit() {
    setTimeout(() => {
      this.passInput.setFocus();
    }, 500);
  }
  validaContrasena( form: NgForm) {
    if (form.valid) {
      this.fbSrvc.loginFirebase( this.fbSrvc.login.email, this.fbSrvc.login.contrasena)
      .then( aut => {
        this.fbSrvc.loading('Ingresando...');
        this.fbSrvc.getPersonaxAuthUid(aut.user.uid)
        .subscribe( (per) => {
          if (per && per.length > 0) {
            this.iconoCandado = 'lock-open-sharp';
            this.fbSrvc.persona = per[0];
            console.log('authId: ', aut.user.uid);
            console.log('persona: ', per);
            this.fbSrvc.parametros.identificado = true;
            this.fbSrvc.parametros.verificado = aut.user.emailVerified;
            this.fbSrvc.parametros.validado = this.fbSrvc.persona.adminOk;
            this.fbSrvc.persona.emailOk = aut.user.emailVerified;
            this.fbSrvc.persona.email = this.fbSrvc.login.email;
            // this.fbSrvc.guardarStorage('persona', this.fbSrvc.persona);
            this.fbSrvc.creaCodigo();
            this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
            if ((aut.user.emailVerified) && (this.fbSrvc.persona.adminOk)) {
              console.log('Redireccionando hacia Inicio.');
              this.fbSrvc.putPersona(this.fbSrvc.persona);
              this.fbSrvc.stopLoading();
              this.router.navigate(['/folder/inicio']);
            } else {
              console.log('Redireccionando hacia Activar Mail.');
              this.fbSrvc.stopLoading();
              this.router.navigate(['/activar-mail']);
            }
          } else {
            console.log('no se encontró persona con authId: ', aut.user.uid);
          }
        });
      })
      .catch( err => {
        console.log('Contraseña incorrecta: ', err);
        // this.contrasenaOK = false;
        this.fbSrvc.mostrarMensaje('Contraseña Incorrecta.');
      });
    }
    }
  restablecerContrasena() {
    this.contrasenaEnviada = true;
    this.fbSrvc.resetPassword();
  }
}

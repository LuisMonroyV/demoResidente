import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
// import { FirebaseAuth } from '@angular/fire';

@Component({
  selector: 'app-activar-mail',
  templateUrl: './activar-mail.page.html',
  styleUrls: ['./activar-mail.page.scss'],
})
export class ActivarMailPage implements OnInit {
  inter: any;
  verificando = false;
  minutos = 5;
  constructor(public fbSrvc: FirebaseService,
              // private fbAuth: FirebaseAuth,
              private router: Router) {
  }

  ionViewWillLeave() {
    console.log(' Activar Mail - ionViewWillLeave()');
    clearInterval(this.inter);
    this.verificando = false;
  }
  ionViewWillEnter() {
    console.log(' Activar Mail - ionViewWillEnter()');
    this.verificarEstado();
  }

  ngOnInit() {
    console.log(' Activar Mail - Init');
    this.verificarEstado();
  }
  async reenviar() {
    await this.fbSrvc.sendEmailVerification();
  }
  irLogin() {
    clearInterval(this.inter);
    if (this.fbSrvc.persona.adminOk && this.fbSrvc.persona.emailOk) {
      this.router.navigate(['/folder/inicio']);
    } else {
      console.log('Redirigiendo hacia login...');
      this.router.navigate(['/login']);
    }
  }
  verificarEstado() {
    console.log(`verificarEstado(${this.verificando})`);
    if (!this.verificando) {
      this.verificando = true;
      console.log('Login: ', this.fbSrvc.login);
      if ((this.fbSrvc.login.email.length > 0) && (this.fbSrvc.login.contrasena.length > 0)) {
        console.log('Interval activado');
        this.inter = setInterval( () => {
          this.fbSrvc.loginFirebase(this.fbSrvc.login.email, this.fbSrvc.login.contrasena)
          .then( usr => {
            this.minutos = this.minutos * 2;
            this.fbSrvc.persona.emailOk = usr.user.emailVerified;
            this.fbSrvc.parametros.verificado = usr.user.emailVerified;
            // Validacion de email
            if (usr.user.emailVerified) {
              console.log('Email verificado');
              this.fbSrvc.putPersonaEmailOk(this.fbSrvc.persona);
            } else {
              console.log('Email NO verificado');
              this.fbSrvc.mostrarMensaje('Esperando verificación de correo electrónico.');
            }
            // Validacion de administrador
            if (this.fbSrvc.parametros.validado) {
              this.fbSrvc.persona.adminOk = true;
            } else {
              if (this.fbSrvc.persona.estado === '3-suspendido') {
                this.fbSrvc.mostrarMensaje('Usuario suspendido.');
                clearInterval(this.inter);
              } else {
                this.fbSrvc.mostrarMensaje('Esperando OK del administrador.');
              }
            }
          })
          .catch( err => {
            console.log('Error al iniciar sesión: ', err);
            clearInterval(this.inter);
          });
          if (this.fbSrvc.parametros.verificado && this.fbSrvc.parametros.validado) {
            clearInterval(this.inter);
            this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
            // this.fbSrvc.guardarStorage('persona', this.fbSrvc.persona);
            this.fbSrvc.putPersona(this.fbSrvc.persona);
            this.router.navigate(['/folder/inicio']);
          }
        } , (this.minutos * 60000));
      } else {
        this.irLogin();
      }
    }
  }
}

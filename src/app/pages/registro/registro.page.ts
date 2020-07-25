import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  creandoCuenta = false;
  verPass = 'password';
  prefijoMovil = '+569';
  prefijoFijo = '+562';
  constructor( private router: Router,
               public fbSrvc: FirebaseService,
               private modalCtrl: ModalController ) { }

  ngOnInit() {
    // Calles, direcciones y personas
    this.fbSrvc.loginFirebase('admin@admin.cl', '123456')
    .then( usr => {
      this.fbSrvc.getCalles()
      .subscribe( data => {
        if (data) {
          this.fbSrvc.calles = data;
          console.log('Calles: ', data);
        }
      });
    })
    .catch( err => {
      console.log('Error en login con admin. ', err);
    });
    this.limpiarCampos();
  }
  creaCuenta(form: NgForm) {
    if (form.valid) {
      this.creandoCuenta = true;
      this.fbSrvc.persona.movil = this.prefijoMovil + this.fbSrvc.persona.movil;
      this.fbSrvc.persona.telefono = this.prefijoFijo + this.fbSrvc.persona.telefono;
      this.fbSrvc.persona.numero = this.fbSrvc.persona.numero.trim();
      this.fbSrvc.persona.fechaRegistro = new Date();
      this.fbSrvc.registroFirebase( this.fbSrvc.login.email, this.fbSrvc.login.contrasena)
        .then( async respFB => {
          if (respFB) {
            this.fbSrvc.creaCodigo();
            this.fbSrvc.loading('Creando cuenta...');
            console.log('Registrado en Firebase!');
            console.log('authUid:', respFB.user.uid);
            this.fbSrvc.sendEmailVerification();
            this.fbSrvc.parametros.identificado = true;
            this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
            this.fbSrvc.persona.authUid = respFB.user.uid;
            this.fbSrvc.persona.email = this.fbSrvc.login.email;
            this.fbSrvc.persona.estado = '0-nuevo';
            this.fbSrvc.persona.obs = 'Los datos de tu cuenta deben ser validados por el administrador de la aplicación.';
            await this.fbSrvc.postPersona(this.fbSrvc.persona);
            this.fbSrvc.mostrarMensaje('Cuenta creada. Bienvenido!');
            this.fbSrvc.stopLoading();
            console.log(this.fbSrvc.persona);
            this.router.navigate(['/activar-mail']);
          }
        }).catch( err => {
          // tslint:disable-next-line: max-line-length
          console.log('Error al crear ususario en firebase: ', err);
        });
    } else {
      this.creandoCuenta = false;
      return;
    }
  }
  limpiarCampos() {
    this.fbSrvc.login.contrasena = '';
    this.fbSrvc.persona.apellidoMaterno = '';
    this.fbSrvc.persona.apellidoPaterno = '';
    this.fbSrvc.persona.calle = '';
    this.fbSrvc.persona.movil = '';
    this.fbSrvc.persona.nombres = '';
    this.fbSrvc.persona.numero = '';
    this.fbSrvc.persona.telefono = '';
  }
}

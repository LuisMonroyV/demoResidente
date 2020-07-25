import { Component, OnInit, ViewChild } from '@angular/core';
import { Aviso } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';
import { IonInput } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-aviso',
  templateUrl: './aviso.page.html',
  styleUrls: ['./aviso.page.scss'],
})
export class AvisoPage implements OnInit {
  @ViewChild('notaInput', {static: false}) notaInput: IonInput;
  fechaString = this.fbSrvc.fechaHoyIso;
  guardando = false;
  misAvisos: Aviso[] = [];
  misAvisosProgramados: Aviso[] = [];
  nuevoAviso: Aviso = {
    avisar: false,
    fecha: null,
    idAviso: '',
    idDireccion: this.fbSrvc.parametros.codigoDir,
    nota: '',
    vigente: true
  };


  constructor( public fbSrvc: FirebaseService) {
    moment.locale('es');
    console.log(this.fbSrvc.fechaHoyIso);
  }

  ngOnInit() {
    this.fbSrvc.getMisAvisos()
    .subscribe( avi => {
      if (avi && avi.length > 0) {
        this.misAvisos = avi;
      } else {
        this.misAvisos = [];
      }
    });
    this.fbSrvc.getMisAvisosProgramados()
    .subscribe( avip => {
      if (avip && avip.length > 0) {
        this.misAvisosProgramados = avip;
      } else {
        this.misAvisosProgramados = [];
      }
    });
    this.fbSrvc.deleteAvisos()
    .then( () => {
      console.log('Avisos eliminados');
    })
    .catch( err => {
      console.log('Error al eliminar avisos: ', err);
    });

    setTimeout(() => {
      this.notaInput.setFocus();
    }, 1000);
  }
  guardarAviso() {
    this.guardando = true;
    this.nuevoAviso.fecha = moment(this.fechaString).toDate();
    this.fbSrvc.postAviso(this.nuevoAviso)
    .then( () => {
      const fechaFinHoy = moment().endOf('day').toDate();
      if (this.nuevoAviso.fecha > fechaFinHoy) {
        this.fbSrvc.mostrarMensaje('Aviso programado correctamente.');
      }
      this.limpiarCampos();
      this.guardando = false;
      this.notaInput.setFocus();
    })
    .catch(err => {
      console.log('Error al guardar aviso: ', err);
      this.fbSrvc.mostrarMensaje('No se pudo guardar el aviso, reintenta en unos momentos.');
      this.guardando = false;
    });
  }
  borrarAviso(pos: number) {
    this.fbSrvc.deleteAviso(this.misAvisos[pos].idAviso)
    .then( () => {
      this.fbSrvc.mostrarMensaje('Aviso eliminado');
      if (this.misAvisos.length === 0) {
        this.misAvisos = [];
      }
    })
    .catch(err => {
      console.log('Error al borrar aviso: ', err);
      this.fbSrvc.mostrarMensaje('No se pudo borrar el aviso, reintenta en unos momentos.');
    });
  }
  borrarAvisoProgramado(pos: number) {
    this.fbSrvc.deleteAviso(this.misAvisosProgramados[pos].idAviso)
    .then( () => {
      this.fbSrvc.mostrarMensaje('Aviso programado eliminado');
      if (this.misAvisosProgramados.length === 0) {
        this.misAvisosProgramados = [];
      }
    })
    .catch(err => {
      console.log('Error al borrar aviso programado: ', err);
      this.fbSrvc.mostrarMensaje('No se pudo borrar el aviso programado, reintenta en unos momentos.');
    });
  }
  limpiarCampos() {
    this.nuevoAviso.avisar = false;
    this.nuevoAviso.idAviso = '';
    this.nuevoAviso.nota = '';
    this.fechaString = moment().toISOString();
  }
}

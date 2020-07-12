import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Persona } from '../../interfaces/fb-interface';
import { ModalController, IonList } from '@ionic/angular';
import { ModalRechazoComponent } from '../../components/modal-rechazo/modal-rechazo.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  @ViewChild('listaNuevos', { static: true }) listaN: IonList;
  @ViewChild('listaActuales', { static: true }) listaA: IonList;
  personasNuevas: Persona[] = [];
  personasRegistradas: Persona[] = [];
  motivo = '';

  constructor( public fbSrvc: FirebaseService,
               private modalCtrl: ModalController ) { }

  ngOnInit() {
    this.fbSrvc.loading('Cargando información...');
    this.fbSrvc.cargando = true;
    this.fbSrvc.getNuevasPersonas()
    .subscribe( per => {
      this.personasNuevas = [];
      if (per && per.length > 0) {
        console.log(per.length + ' nuevos usuarios.');
        this.personasNuevas = per;
      }
      console.log('Personas Nuevas: ', this.personasNuevas);
      this.fbSrvc.stopLoading();
    });
    this.fbSrvc.getPersonasRegistradas()
    .subscribe( per => {
      this.personasRegistradas = [];
      if (per && per.length > 0) {
        console.log(per.length + ' usuarios registrados.');
        this.personasRegistradas = per;
      }
      console.log('Personas Registradas : ', this.personasRegistradas);
      this.fbSrvc.stopLoading();
      this.fbSrvc.cargando = false;
    });
  }
  aprobar( pos: number, tipo: string) {
    if (tipo === 'nuevos') {
      this.personasNuevas[pos].adminOk = true;
      this.personasNuevas[pos].estado = '2-vigente';
      this.personasNuevas[pos].obs = '';
      this.fbSrvc.putPersona(this.personasNuevas[pos]);
    } else {
      this.personasRegistradas[pos].adminOk = true;
      this.personasRegistradas[pos].estado = '2-vigente';
      this.personasRegistradas[pos].obs = '';
      this.fbSrvc.putPersona(this.personasRegistradas[pos]);
    }
  }
  rechazar( pos: number, tipo: string) {
    this.modalMotivo(tipo, pos)
    .then( () => {
      if (this.motivo !== '') {
        console.log('Motivo de rechazo:', this.motivo);
        console.log('Tipo:', tipo);
        if (tipo === 'nuevos') {
          this.personasNuevas[pos].adminOk = false;
          this.personasNuevas[pos].obs = this.motivo;
          this.personasNuevas[pos].estado = '1-rechazado';
          this.fbSrvc.putPersona(this.personasNuevas[pos]);
        } else {
          this.personasRegistradas[pos].adminOk = false;
          this.personasRegistradas[pos].obs = this.motivo;
          this.personasRegistradas[pos].estado = '3-suspendido';
          this.fbSrvc.putPersona(this.personasRegistradas[pos]);
        }
      } else {
        this.fbSrvc.mostrarMensaje('Debe indicar motivo de rechazo.');
        if (tipo === 'nuevos') {
          this.listaN.closeSlidingItems();
        } else {
          this.listaA.closeSlidingItems();
        }
      }
    })
    .catch( err => {
      console.log('Error al rechazar usuario: ', err);
    });
  }
  async modalMotivo(tipo: string, pos: number) {
    if (tipo === 'nuevos') {
      this.motivo = this.personasNuevas[pos].obs;
    } else {
      this.motivo = this.personasRegistradas[pos].obs;
    }
    const modalMotivo = await this.modalCtrl.create({
      component: ModalRechazoComponent,
      componentProps: {
        guardar: '?',
        motivo: this.motivo
      }
    });
    await modalMotivo.present();
    const {data} = await modalMotivo.onDidDismiss();
    if (data) {
      if (data.guardar === 'SI') {
        this.motivo = data.motivo;
      }
    }
  }
}

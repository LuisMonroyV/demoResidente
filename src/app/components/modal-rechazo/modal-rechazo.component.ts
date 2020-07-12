import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-rechazo',
  templateUrl: './modal-rechazo.component.html',
  styleUrls: ['./modal-rechazo.component.scss'],
})
export class ModalRechazoComponent implements OnInit {

  motivo = '';
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}
  cerrarModal() {
    this.modalCtrl.dismiss();
  }
  guardarMotivo() {
    this.modalCtrl.dismiss({ guardar: 'SI', motivo: this.motivo });
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-visitas',
  templateUrl: './modal-visitas.component.html',
  styleUrls: ['./modal-visitas.component.scss'],
})
export class ModalVisitasComponent implements OnInit {
  @Input() tipo: string;
  nuevaVisita = '';
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}
  cerrarModal() {
    this.modalCtrl.dismiss();
  }
  guardarVisita() {
    this.modalCtrl.dismiss({ guardar: 'SI', visita: this.nuevaVisita });
  }

}

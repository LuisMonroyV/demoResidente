import { CommonModule } from '@angular/common';
import { FechaPipe } from '../pipes/fecha.pipe';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { ModalRechazoComponent } from './modal-rechazo/modal-rechazo.component';
import { ModalVisitasComponent } from './modal-visitas/modal-visitas.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccesosComponent } from './accesos/accesos.component';
import { NoticiasComponent } from './noticias/noticias.component';
import { EmergenciasComponent } from './emergencias/emergencias.component';
import { RondasComponent } from './rondas/rondas.component';


@NgModule({
  declarations: [
    FechaPipe,
    HeaderComponent,
    ModalRechazoComponent,
    ModalVisitasComponent,
    AccesosComponent,
    EmergenciasComponent,
    NoticiasComponent,
    RondasComponent,
  ],
  entryComponents: [
    ModalVisitasComponent,
    ModalRechazoComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
  ],
  exports: [
    FechaPipe,
    HeaderComponent,
    ModalRechazoComponent,
    ModalVisitasComponent,
    AccesosComponent,
    EmergenciasComponent,
    NoticiasComponent,
    RondasComponent,
  ]
})
export class ComponentsModule { }

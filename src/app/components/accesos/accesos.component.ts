import { Component, OnInit } from '@angular/core';
import { RegistroVisita } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-accesos',
  templateUrl: './accesos.component.html',
  styleUrls: ['./accesos.component.scss'],
})
export class AccesosComponent implements OnInit {
  accesos: RegistroVisita[] = [];

  constructor(private fbSrvc: FirebaseService) { }

  ngOnInit() {
    setTimeout(() => {
      this.fbSrvc.getMisAccesos()
      .subscribe( acc => {
        if (acc && acc.length > 0) {
          this.accesos = acc;
        }
      });
    }, 3000);
  }

}

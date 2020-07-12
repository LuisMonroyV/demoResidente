import { Component, OnInit } from '@angular/core';
import { Ronda } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-rondas',
  templateUrl: './rondas.component.html',
  styleUrls: ['./rondas.component.scss'],
})
export class RondasComponent implements OnInit {
  rondas: Ronda[] = [];

  constructor(private fbSrvc: FirebaseService) { }

  ngOnInit() {
      this.fbSrvc.getRondas()
      .subscribe( rnd => {
        if (rnd && rnd.length > 0) {
          this.rondas = rnd;
        }
      });
  }
}

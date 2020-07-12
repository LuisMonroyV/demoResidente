import { Component, OnInit } from '@angular/core';
import { Noticia } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.scss'],
})
export class NoticiasComponent implements OnInit {
  noticias: Noticia[] = [];

  constructor(private fbSrvc: FirebaseService) { }

  ngOnInit() {
    this.fbSrvc.getNoticias()
    .subscribe( noti => {
      if (noti && noti.length > 0) {
        this.noticias = noti;
        // console.log(this.noticias);
      }
    });
  }

}

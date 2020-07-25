import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from './services/firebase.service';
import { Platform, MenuController, IonSplitPane } from '@ionic/angular';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

let contBack = 1;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('split', { static: true }) split: IonSplitPane;
  retorno: any[];
  public selectedIndex = 0;
  public dark = false;
  public appPages = [
    {
      title: 'Inicio',
      url: '/folder/Inicio',
      icon: 'home'
    },
    {
      title: 'Agenda',
      url: '/agenda',
      icon: 'call'
    },
    {
      title: 'Aviso de Visitas',
      url: '/aviso',
      icon: 'pizza'
    },
    {
      title: 'Botón de Pánico',
      url: '/alerta',
      icon: 'megaphone'
    },
    {
      title: 'Mis Datos',
      url: '/mis-datos',
      icon: 'document-text'
    },
  ];
  constructor(
              private fbAuth: AngularFireAuth,
              public fbSrvc: FirebaseService,
              private menu: MenuController,
              private platform: Platform,
              private router: Router,
              private splashScreen: SplashScreen,
              private statusBar: StatusBar,
              private storage: Storage,
              private audio: NativeAudio,
             ) {
    // console.log('constructor del AppComponent');
    this.initializeApp();
    // console.log('FIN constructor del AppComponent');

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.fbSrvc.getParametrosFB();
      this.statusBar.styleDefault();
      // this.splashScreen.show();
      // setTimeout(() => {
      //   this.splashScreen.hide();
      // }, 5000);
      this.platform.backButton.subscribe(() => {
        console.log('backButton: ', contBack);
        if (contBack === 2) {
          console.log ('exit');
          // tslint:disable-next-line: no-string-literal
          navigator['app'].exitApp();
        } else {
          this.fbSrvc.mostrarMensaje('Doble tap para salir de la aplicación.');
          contBack++;
          setTimeout(() => {
            contBack--;
            console.log('backButton: ', contBack);
          }, 1000);
          return;
        }
      });
      this.cargarSonidos();
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
    this.getParametros().then( () => {
      this.fbAuth.auth.onAuthStateChanged(user => {
        console.log('[appComponent] auth.onAuthStateChanged()');
        if (user) {
          if (!this.fbSrvc.escuchandoPersona) {
            this.fbSrvc.getPersonaxAuthUid(user.uid)
            .subscribe( (per) => {
              if (per && per.length > 0) {
                this.fbSrvc.lanzarSonido('click');
                this.fbSrvc.persona = per[0];
                this.fbSrvc.parametros.verificado = per[0].emailOk;
                console.log('Email OK: ', per[0].emailOk);
                this.fbSrvc.parametros.validado = per[0].adminOk;
                console.log('Admin OK: ', per[0].adminOk);
                this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
                console.log('Parametros guardados en Storage.');
                if (!this.fbSrvc.parametros.codigoDir) {
                  this.fbSrvc.creaCodigo();
                }
              }
            });
          }
        }
      });
    });

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    document.body.classList.toggle('dark', prefersDark.matches);
    console.log('Preferencia dark mode: ', prefersDark.matches );
    this.dark = prefersDark.matches;
    // Listen for changes to the prefers-color-scheme media query
    // tslint:disable-next-line: deprecation
    prefersDark.addListener((mediaQuery) => {
      this.dark = mediaQuery.matches;
      this.toggleDarkTheme(mediaQuery.matches);
    });


  }

  toggleDarkTheme(shouldAdd: boolean) {
    console.log('toggleDarkTheme:', shouldAdd);
    document.body.classList.toggle('dark', shouldAdd);
    console.log('this.dark: ', this.dark );
  }
  async getParametros() {
    console.log('Get Parametros()');
    await this.storage.get('parametros')
    .then( params => {
      console.log({params});
      if ( params ) {
        this.fbSrvc.parametros = params;
      }
      this.redirigir();
    })
    .catch( err => {
      console.log('no encontré parametros: ', err);
      this.fbSrvc.parametros.primeraVez = true;
      this.redirigir();
    });
  }
  cerrarSesion() {
    this.menu.close();
    this.fbSrvc.logOutFirebase();
    this.fbSrvc.parametros.identificado = false;
    this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
    this.router.navigate(['login']);
  }
  redirigir() {
    if (!this.fbSrvc.redirigido) {
      this.fbSrvc.redirigido = true;
      if (this.fbSrvc.parametros.primeraVez) {
        console.log('Redirigiendo a slides...');
        if (this.split) {
          this.split.disabled = true;
        } else {
          console.log('splitPane: ', this.split);
        }
        this.router.navigate(['/slides']);
        return;
      }
      if (!this.fbSrvc.parametros.identificado) {
        console.log('Redirigiendo a login...');
        this.router.navigate(['/login']);
        if (this.split) {
          this.split.disabled = true;
        } else {
          console.log('splitPane: ', this.split);
        }
        return;
      }
      if (this.fbSrvc.parametros.validado && this.fbSrvc.parametros.verificado) {
        console.log('Redirigiendo a inicio...');
        if (this.split) {
          this.split.disabled = false;
        } else {
          console.log('splitPane: ', this.split);
        }
        // this.router.navigate(['/folder/inicio']);
        return;
      } else if (!this.fbSrvc.parametros.validado) {
          console.log('Redirigiendo a activar mail...');
          if (this.split) {
            this.split.disabled = true;
          } else {
            console.log('splitPane: ', this.split);
          }
          this.router.navigate(['/activar-mail']);
          return;
      } else if (!this.fbSrvc.parametros.verificado) {
          console.log('Redirigiendo a Login...');
          if (this.split) {
            this.split.disabled = true;
          } else {
            console.log('splitPane: ', this.split);
          }
          this.router.navigate(['/login']);
          return;
      }

    } else {
      console.log('Ignorando redirección.');
    }
  }
  cargarSonidos() {
    this.audio.preloadSimple('woop', 'assets/sounds/woopWoop.mp3')
    .then( () => {
      console.log('sonido woop OK!');
    });

    this.audio.preloadSimple('click', 'assets/sounds/click-2.wav')
    .then( () => {
      console.log('sonido click OK!');
    });

    this.audio.preloadSimple('smokeAlarm', 'assets/sounds/smokeAlarm.mp3')
    .then( () => {
      console.log('sonido smokeAlarm OK!');
    });

    this.audio.preloadSimple('blop', 'assets/sounds/blop.mp3')
    .then( () => {
      console.log('sonido blop OK!');
    });

    this.audio.preloadSimple('sms', 'assets/sounds/sms-alert.mp3')
    .then( () => {
      console.log('sonido sms OK!');
    });

    this.audio.preloadSimple('ding', 'assets/sounds/ding.mp3')
    .then( () => {
      console.log('sonido ding OK!');
    });
  }
}

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { ParametrosApp, Persona, Calle, Parametros, RegistroVisita, Emergencia, Ronda, Aviso } from '../interfaces/fb-interface';
import { Noticia, Visita } from '../interfaces/fb-interface';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { AngularFireStorage } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  fechaHoyIso = moment().toISOString();
  randomNum = '';
  oneSignalIdCliente = '';
  oneSignalIdActualizado = false;
  pasoAlerta = 0;
  alertaEnviada = false;
  textoAlerta = '';
  imagenAlerta = 'assets/images/panic-button-0.png';
  idEncuesta = '';
  chatSeleccionado = '';
  pagosCreados = false;
  redirigido = false;
  enviado = false;
  escuchandoPersona = false;
  cargando = false;

  parametros: ParametrosApp = {
    codigoDir: '',
    identificado: false,
    codigoAlerta: '000',
    primeraVez: true,
    validado: false,
    verificado: false,
    verEmergencias: true,
    verAccesos: true,
    verRondas: true
  };
  parametrosFB: Parametros = {
    maxDiasNoticias: 10,
    cuadrante: '',
    guardia: '',
    maxNumNoticias: 5,
    maxNumEmergencias: 5,
    maxNumAccesos: 5,
    maxNumRondas: 5
  };
  persona: Persona = {
      adminOk: false,
      apellidoMaterno: '',
      apellidoPaterno: '',
      authUid: '',
      calle: '',
      email: '',
      emailOk: false,
      esAdmin: false,
      estado: '',
      fechaRegistro: null,
      idPersona: '',
      movil: '',
      nombres: '',
      numero: '',
      obs: '',
      telefono: '',
    };
  login = {
    email: '',
    contrasena: '',
    identificado: false
  };

  calles: Calle[] = [];
  imagenes: any[] = [];

  collectionPersona: AngularFirestoreCollection<Persona>;
  collectionNoticia: AngularFirestoreCollection<Noticia>;

  constructor( private fbAuth: AngularFireAuth,
               private db: AngularFirestore,
               private toast: ToastController,
               private storage: Storage,
               private audio: NativeAudio,
               public loadCtrl: LoadingController,
               private afStorage: AngularFireStorage ) {

    this.db.firestore.enablePersistence()
    .then ( () => {
      console.log('Persistencia de datos para FireBase habilitada!');
    })
    .catch( err => {
        console.log('No se pudo habilitar persistencia de datos para FireBase: ', err.code);
    });
    this.collectionPersona = db.collection<Persona>('persona');
    this.collectionNoticia = db.collection<Noticia>('noticias');
  }

  creaCodigo() {
    console.log('creaCodigo()');
    let miCodDir = '';
    if (this.persona.calle) {
      miCodDir = `${this.persona.calle}-${this.persona.numero}`;
      console.log('Codigo Dirección: ', miCodDir);
      this.parametros.codigoDir = miCodDir;
      this.guardarStorage('parametros', this.parametros);
    } else {
      this.leerStorage('parametros')
      .then( data => {
        miCodDir = data;
        console.log('Codigo Dirección desde storage: ', miCodDir);
      });
      this.parametros.codigoDir = miCodDir;
      this.guardarStorage('parametros', this.parametros);
    }

  }
  async deleteNoticias() {
    console.log(`this.parametrosFB.maxDiasNoticias: ${this.parametrosFB.maxDiasNoticias}`);
    if (this.parametrosFB.maxDiasNoticias && this.parametrosFB.maxDiasNoticias > 0) {
      const fechaAnt = moment().subtract(this.parametrosFB.maxDiasNoticias, 'days').toDate();
      console.log(`Eliminando registros de Noticias anteriores a: '${fechaAnt}`);
      return this.db.collection('noticias', ref => ref.where('fecha', '<', fechaAnt))
      .get()
      .subscribe( noti => {
        noti.forEach( async result => {
          await result.ref.delete();
        });
        console.log(`Eliminados ${noti.size} noticias`);
      });
    } else {
      return;
    }
  }
  async deleteAvisos() {
    const fechaAnt = moment().startOf('day').subtract(2, 'days').toDate();
    console.log(`Eliminando registros de Avisos anteriores a: '${fechaAnt}`);
    return this.db.collection('avisos', ref => ref.where('fecha', '<', fechaAnt))
    .get()
    .subscribe( avi => {
      avi.forEach( async result => {
        await result.ref.delete();
      });
      console.log(`Eliminados ${avi.size} avisos`);
    });
  }
  async deleteAviso(id: string) {
    return this.db.collection('avisos', ref => ref.where('idAviso', '==', id))
    .get()
    .subscribe( avi => {
      avi.forEach( async result => {
        await result.ref.delete();
      });
      // console.log(`Eliminados ${avi.size} registros`);
    });
  }
  async deleteUsuario(id: string) {
    console.log('borrando usuario de bd id: ', id);
    // this.db.collection('persona').doc(id).delete();
    this.db.collection('persona', ref => ref.where('idPersona', '==', id))
    .get()
    .subscribe( usu => {
      usu.forEach( async result => {
        await result.ref.delete();
        this.fbAuth.auth.currentUser.delete()
        .then( () => {
          console.log('fbAuth - usuario eliminado correctamente');
        })
        .catch( err => {
          console.log('fbAuth - Error al eliminar usuario: ', err);
        });
      });
    });
  }
  getCalles() {
    console.log('getCalles()');
    return this.db.collection<Calle>('calles', ref => ref.orderBy('descCalle', 'asc'))
                                                  .valueChanges();
  }
  getEmergencias() {
    console.log(`getEmergencias(${this.parametrosFB.maxNumEmergencias})`);
    return this.db.collection<Emergencia>('emergencias', ref => ref.limit(this.parametrosFB.maxNumEmergencias)
                                                                   .orderBy('fechaInicio', 'desc'))
                                                                   .valueChanges();
  }
  getMisAvisos() {
    console.log('getMisAvisos()');
    const fechaInicioHoy = moment().startOf('day').toDate();
    const fechaFinHoy = moment().endOf('day').toDate();
    return this.db.collection<Aviso>('avisos', ref => ref.where('idDireccion', '==', this.parametros.codigoDir)
                                                         .where('fecha', '>=', fechaInicioHoy)
                                                         .where('fecha', '<=', fechaFinHoy)
                                                         .where('vigente', '==', true)
                                                         .orderBy('fecha', 'asc'))
                                                         .valueChanges();
  }
  getMisAvisosProgramados() {
    console.log('getMisAvisosProgramados()');
    const fechaFinHoy = moment().endOf('day').toDate();
    return this.db.collection<Aviso>('avisos', ref => ref.where('idDireccion', '==', this.parametros.codigoDir)
                                                         .where('fecha', '>=', fechaFinHoy)
                                                         .where('vigente', '==', true)
                                                         .orderBy('fecha', 'asc'))
                                                         .valueChanges();
  }
  getNoticias() {
    console.log(`getNoticias(${this.parametrosFB.maxNumNoticias})`);
    return this.db.collection<Noticia>('noticias', ref => ref.limit(this.parametrosFB.maxNumNoticias)
                                                             .orderBy('fecha', 'desc') )
                                                             .valueChanges();
  }
  getNoticia(idNoticia: string) {
    return this.collectionNoticia.doc<Noticia>(idNoticia).valueChanges();
  }
  getMisAccesos() {
    console.log(`getMisAccesos(${this.parametrosFB.maxNumAccesos}): ${this.parametros.codigoDir}`);
    return this.db.collection<RegistroVisita>('registro', ref => ref.limit(this.parametrosFB.maxNumAccesos)
                                                                    .where('idDireccion', '==', this.parametros.codigoDir)
                                                                    .orderBy('fecha', 'desc'))
                                                                    .valueChanges();
  }
  getMisVisitas() {
    return this.db.collection<Visita>('visitas', ref => ref.where('idDireccion', '==', this.parametros.codigoDir))
                                                           .valueChanges();
  }
  getNuevasPersonas() {
    return this.db.collection<Persona>('persona', ref => ref.where('estado', '>=', '0-nuevo')
                                                            .where('estado', '<=', '1-rechazado')).valueChanges();
  }
  getNuevosRegistros() {
    return this.db.collection<Persona>('persona', ref => ref.where('estado', '==', '0-nuevo')).valueChanges();
  }
  getParametrosFB() {
    console.log('----getParametrosFB');
    this.db.collection('parametros').doc('maximos').get()
    .subscribe( max => {
      this.parametrosFB.maxDiasNoticias = max.get('maxDiasNoticias');
      this.parametrosFB.maxNumNoticias = max.get('maxNumNoticias');
      this.parametrosFB.maxNumEmergencias = max.get('maxNumEmergencias');
      this.parametrosFB.maxNumAccesos = max.get('maxNumAccesos');
      this.parametrosFB.maxNumRondas = max.get('maxNumRondas');
      console.log(this.parametrosFB );
    });
    this.db.collection('parametros').doc('numeros').get()
    .subscribe( num => {
      this.parametrosFB.cuadrante = num.get('cuadrante');
      this.parametrosFB.guardia = num.get('guardia');
    });

  }
  getPersonasRegistradas() {
    return this.db.collection<Persona>('persona', ref => ref.where('estado', '>=', '2-vigente')
                                                            .where('estado', '<=', '3-suspendido'))
                                                            .valueChanges();
  }
  getPersonaxAuthUid( id: string)  {
    console.log(`getPersonaxAuthUid(${id})`);
    this.escuchandoPersona = true;
    // tslint:disable-next-line: max-line-length
    return this.db.collection<Persona>('persona', ref => ref.where('authUid', '==', id))
                                                            .valueChanges();
  }
  getPersonasxDir(calle: string, numero: string) {
    return this.db.collection<Persona>('persona', ref => ref.where('calle', '==', calle)
                                                            .where('numero', '==', numero))
                                                            .valueChanges();
  }
  getRondas() {
    console.log(`getRondas(${this.parametrosFB.maxNumRondas})`);
    return this.db.collection<Ronda>('rondas', ref => ref.limit(this.parametrosFB.maxNumRondas)
                                                         .orderBy('fechaInicio', 'desc'))
                                                         .valueChanges();
  }
  async getUrlImagenesNoticias() {
    this.imagenes = [];
    const fechaAnt = moment().subtract(this.parametrosFB.maxDiasNoticias, 'days').toDate();
    return await this.db.collection('noticias').ref.where('fecha', '<', fechaAnt)
    .get()
    .then( (querySnapshot) => {
      querySnapshot.forEach( async doc => {
        this.imagenes.push(doc.data());
        if (this.imagenes[0].urlAdjunto.length > 0) {
          const url = this.imagenes[0].urlAdjunto;
          const ref = this.afStorage.storage.refFromURL(url);
          await ref.delete();
        }
        console.log(this.imagenes);
        this.imagenes.splice(0, 1);
      });
    })
    .catch( err => {
      console.log('Error al obtener url de imagenes. ', err );
    });
  }
  getVisitas() {
    return this.db.collection<Visita>('visitas').valueChanges();
  }
  guardarStorage( clave: string, struct: any ) {
    this.storage.set( clave, struct );
    // this.lanzarSonido('click');
  }
  lanzarSonido( id: string, times?: number ) {
    let veces = 1;
    if (times) {
      veces = times;
    }
    for (let index = 0; index < veces; index++) {
      this.audio.play(id)
      .then(() => {
        console.log('Sonido ' + id + ' lanzado!');
      });
      if ( index > 1 ) {
        // Esperar 1 segundo entre sonidos
        setTimeout(() => {
          // zzzzzz
        }, 1000);
      }
    }
  }
  async leerStorage( clave: string ) {
    console.log('leyendo storage.', clave );
    return await this.storage.get( clave );
  }
  async loading(texto?: string) {
    const load = await this.loadCtrl.create({
      spinner: 'circular',
      mode: 'ios',
      message: texto
    });
    await load.present();
    setTimeout(() => {
      this.stopLoading();
    }, 10000);
    const { role, data } = await load.onDidDismiss();
    console.log('Loading dismissed!');
  }
  loginFirebase(email: string, pass?: string) {  // Posteo en FireBase
    console.log('loginFirebase()');
    return this.fbAuth.auth.signInWithEmailAndPassword(email, pass);
  }
  logOutFirebase() {
    console.log('logOutFirebase()');
    this.parametros.identificado = false;
    this.parametros.validado = false;
    this.parametros.verificado = false;
    this.guardarStorage('parametros', this.parametros);
    this.persona.emailOk = false;
    this.persona.esAdmin = false;
    this.persona.adminOk = false;
    return this.fbAuth.auth.signOut();
  }
  async mostrarMensaje( texto: string ) {
    const toast = await this.toast.create({
      message: texto,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
  async postAviso( avi: Aviso ) {
    if (avi.nota.length > 0) {
      await this.db.collection('avisos').add(avi)
      .then( docRef => {
        console.log('Aviso ID: ', docRef.id);
        avi.idAviso = docRef.id;
        this.putAviso(avi)
        .then( () => {
          console.log('Aviso Actualizado.');
        })
        .catch( err => {
          console.log('Error al actualizar aviso: ', err);
        });
      })
      .catch( err => {
        console.log('Error al ingresar Aviso: ', err);
      });
    }
  }
  async postEmergencia( eme: Emergencia ) {
    if (eme.obs.length > 0) {
      await this.db.collection('emergencias').add(eme)
      .then( docRef => {
        console.log('Emergencia ID: ', docRef.id);
        eme.idEmergencia = docRef.id;
        this.putEmergencia(eme)
        .then( () => {
          console.log('Emergencia Actualizada.');
        })
        .catch( err => {
          console.log('Error al actualizar emergencia: ', err);
        });
      })
      .catch( err => {
        console.log('Error al ingresar Emergencia: ', err);
      });
    }
  }
  async postNoticia( noti: Noticia) {
    await this.db.collection('noticias').add(noti)
    .then( docRef => {
      console.log('Noticia ID: ', docRef.id);
      noti.idNoticia = docRef.id;
      this.putNoticia( noti )
      .then( () => {
        console.log('ID de noticia actualizada.');
      });
    });
    }
  async postPersona( per: Persona ) {
    await this.collectionPersona.add(per)
    .then( docRef => {
      console.log('Persona ID: ', docRef.id);
      this.persona.idPersona = docRef.id;
      this.putPersona( this.persona)
      .then( () => {
        console.log('ID de persona actualizada.');
      });
    });
  }
  postVisitas( visita: Visita) {
    return this.db.collection('visitas').doc(`${visita.idDireccion}`).set(visita);
  }
  putAviso( avi: Aviso) {
    return this.db.collection('avisos').doc(avi.idAviso).update(avi);
  }
  putEmergencia( eme: Emergencia) {
    return this.db.collection('emergencias').doc(eme.idEmergencia).update(eme);
  }
  putNoticia( noti: Noticia) {
    return this.db.collection('noticias').doc(noti.idNoticia).update(noti);
  }
  putPersona( per: Persona) {
    return this.collectionPersona.doc(per.idPersona).update(per);
  }
  putPersonaEmailOk( per: Persona) {
    return this.collectionPersona.doc(per.idPersona).update({ emailOk: true });
  }
  async registroFirebase( email: string, pass: string ) {
    console.log('registroFirebase()');
    return await this.fbAuth.auth.createUserWithEmailAndPassword( email, pass);
  }
  async resetPassword() {
    await this.fbAuth.auth.sendPasswordResetEmail( this.login.email )
    .then( () => {
      this.mostrarMensaje('Instrucciones enviadas al mail.');
    })
    .catch( (err) => {
      console.log('Error al enviar correo para reset de contraseña: ', err);
      this.mostrarMensaje('No se pudo enviar el correo.');
    });
  }
  async sendEmailVerification() {
    this.enviado = true;
    await this.fbAuth.auth.currentUser.sendEmailVerification()
    .then( () => {
      this.mostrarMensaje('Correo enviado.');
    })
    .catch( err => {
      console.log('Error al enviar correo: ', err);
      this.mostrarMensaje('No pudimos enviar el correo, reintenta en unos momentos.');
    });
  }
  stopLoading() {
    console.log('stopLoading()');
    this.loadCtrl.getTop().then( elem => {
      if (elem) {
        // console.log('Loading detenido: ', elem.id);
        this.loadCtrl.dismiss();
      }
    })
    .catch( err => {
      console.error(err);
    });
  }

}

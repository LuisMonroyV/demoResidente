export interface Calle {
    descCalle: string;
}
export interface Emergencia {
    estado: string;
    fechaInicio: Date;
    fechaTermino: Date;
    guardia: string;
    idDireccion: string;
    idEmergencia: string;
    obs: string;
}
export interface Noticia {
    creadaPor: string;
    fecha: Date;
    idNoticia: string;
    notificar: boolean;
    texto: string;
    titulo: string;
    urlImagen: string;
}
export interface Novedad {
    descripcion: string;
    fecha: Date;
}
export interface Parametros {
    maxDiasNoticias: number;
    cuadrante: string;
    guardia: string;
    maxNumNoticias: number;
    maxNumEmergencias: number;
    maxNumAccesos: number;
    maxNumRondas: number;
}
export interface ParametrosApp {
    codigoDir: string; // codigo calle + numero
    identificado: boolean; // Login
    codigoAlerta: string;
    primeraVez: boolean; // para mostrar slides
    validado: boolean; // por el administrador
    verificado: boolean; // email verificado
    // verNoticias: boolean;
    verEmergencias: boolean;
    verAccesos: boolean;
    verRondas: boolean;
}
export interface Persona {
    adminOk: boolean;
    apellidoPaterno: string;
    apellidoMaterno: null | string;
    authUid: string;
    calle: string;
    email: string;
    emailOk: boolean;
    esAdmin: boolean;
    estado: string;
    idPersona: string;
    movil: null | string;
    nombres: string;
    numero: string;
    telefono: string;
    obs: string;
}
export interface RegistroVisita {
    fecha: Date;
    guardia: string;
    idDireccion: string;
    idRegistro: string;
    nombreVisitante: string;
    numeroCartel: string;
    obs: string;
    patente: string;
    residenteResponde: boolean;
    turno: string;
}
export interface Ronda {
    fechaInicio: Date;
    fechaTermino: Date;
    guardia: string;
    novedades: Novedad[];
}
export interface Visita {
    idDireccion: string;
    autorizados: string[];
    rechazados: string[];
}

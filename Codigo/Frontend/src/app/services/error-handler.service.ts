import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Intentar extraer el mensaje de error de varias posibles fuentes (anidamientos)
    const errorString = this.getRecursiveErrorMessage(error);

    // Silenciar errores internos de comunicación de Ionic Tabs que no afectan al funcionamiento
    if (errorString.includes('tabs:outgoing.message')) {
      return;
    }

    // Para el resto de errores, mantener el comportamiento por defecto (mostrar en consola)
    // Usamos el objeto original para no perder el stack trace en la consola
    console.error(error);
  }

  private getRecursiveErrorMessage(error: any): string {
    if (!error) return '';
    
    let message = '';
    
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object') {
      // Algunos errores de Angular/Ionic vienen envueltos en originalError o rejection
      message = error.message || error.rejection?.message || error.originalError?.message || error.toString();
    }

    // Si hay un error anidado, lo comprobamos también recursivamente
    const nestedError = error.rejection || error.originalError;
    if (nestedError && nestedError !== error) {
      message += ' ' + this.getRecursiveErrorMessage(nestedError);
    }

    return message;
  }
}

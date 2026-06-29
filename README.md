![GitHub release](https://img.shields.io/github/v/release/selugc4/SolfEdge)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Online-success)
![License](https://img.shields.io/badge/license-Academic-blue)

# SolfEdge

SolfEdge es una aplicación web desarrollada como parte del Trabajo Fin de Grado en Ingeniería Informática, así como del complemento, cuyo objetivo es proporcionar una plataforma de apoyo para la enseñanza y el aprendizaje del lenguaje musical.

La documentación completa del proyecto, así como las decisiones de diseño, la arquitectura software, la metodología empleada y el desarrollo de la aplicación se encuentran descritos en las memorias del proyecto.

---

# Organización del repositorio

El repositorio se organiza en tres bloques principales:

```text
.
├── Código/
│   ├── Frontend/
│   └── Backend/
│
├── Memorias/
│   ├── TFG/
│   └── CTFG/
│
└── .github/
    └── workflows/
        └── build.yml
```

## Memorias

Contiene toda la documentación escrita del proyecto en formato LaTeX.

Se divide en dos subdirectorios:

* **TFG/**: Memoria del Trabajo Fin de Grado.
* **CTFG/**: Memoria correspondiente al Complemento del Trabajo Fin de Grado.

En ambos casos se incluyen los archivos fuente necesarios para generar la documentación mediante LaTeX.

---

## Código

Contiene el código fuente de la aplicación.

Se encuentra dividido en dos proyectos independientes:

* **Frontend/**
* **Backend/**

La estructura interna, las decisiones de diseño, los patrones de arquitectura empleados y el funcionamiento de ambos proyectos se describen detalladamente en las memorias del proyecto.

---

## GitHub Actions

El directorio:

```text
.github/workflows/
```

contiene el flujo de integración y despliegue continuo del proyecto.

Actualmente dispone del archivo:

```text
build.yml
```

encargado de automatizar el proceso de compilación y despliegue de la aplicación.

---

# Ejecución de la aplicación

Existen dos formas de utilizar SolfEdge.

## Opción 1. Acceso mediante GitHub Pages

La aplicación se encuentra desplegada y disponible en:

https://selugc4.github.io/SolfEdge/

También puede accederse desde el propio repositorio seleccionando:

**GitHub → Deployments → GitHub Pages**

o bien desde:

**Settings → Pages**

si se desea comprobar la configuración del despliegue.

---

## Opción 2. Instalación mediante APK

También es posible utilizar la aplicación desde un dispositivo Android instalando el archivo APK generado para el proyecto.

Basta con descargar el archivo APK disponible en las publicaciones (*Releases*) del repositorio e instalarlo en el dispositivo.

---

# Importación de usuarios mediante CSV

Para facilitar las pruebas de la funcionalidad **Importar desde CSV**, el repositorio incluye un archivo de ejemplo en la siguiente ruta:

```text
Memorias/CTFG/Figuras/valido.csv
```

Este archivo permite realizar una primera importación de usuarios y comprobar el funcionamiento de dicha característica.

No obstante, la aplicación ya dispone de una carga inicial de datos para que sea posible probar directamente el resto de funcionalidades sin necesidad de realizar previamente la importación.

---

# Acceso para evaluación

Las credenciales del usuario administrador con el que se pueden probar las cargas de datos e ir creando el resto de elementos son las siguientes:

Administrador


Usuario: admin 

Contraseña: owmJMhtR52kNe5HZ


Además, si se prefiere directamente probar otras funcionalidades concretas se adjuntan las credenciales de un usuario de cada rol.

Profesor


Usuario: agr

Contraseña: QF18yJZl39

Alumno


Usuario: lms

Contraseña: 3TW6ZXniji


---

# Licencia

Este proyecto ha sido desarrollado con fines exclusivamente académicos como parte del Trabajo Fin de Grado y su complemento del Grado en Ingeniería Informática.

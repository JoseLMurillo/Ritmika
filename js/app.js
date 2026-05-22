let quizData = null;
let preguntaActual = 0;
let respuestaUsuario = null;

const sonidoCorrecto = "./resources/correct.mp3";
const sonidoIncorrecto = "./resources/fail.mp3";

const selectorModulo = document.getElementById("selectorModulo");
const selectorNivel = document.getElementById("selectorNivel");

const tema = document.getElementById("tema");
const preguntaTexto = document.getElementById("preguntaTexto");
const contenedor = document.getElementById("contenedor");


// -------------------------
// CAMBIO DE PANTALLAS
// -------------------------

function mostrarPantalla(id) {

    const pantallas = document.querySelectorAll('.pantalla');

    pantallas.forEach(p => {
        p.classList.remove('activa');
    });

    document.getElementById(id).classList.add('activa');
}

function volverDashboard() {
    mostrarPantalla('dashboard');
}
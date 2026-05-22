let instrumentoActual = null;

let ejerciciosPorNivel = {};

const menuInstrumentos =
    document.getElementById("menuInstrumentos");

const instrumentoScreen =
    document.getElementById("instrumentoScreen");

const tituloInstrumento =
    document.getElementById("tituloInstrumento");

const nivelesContainer =
    document.getElementById("nivelesContainer");

const contenedorEjercicio =
    document.getElementById("contenedorEjercicio");


// -------------------------
// ABRIR INSTRUMENTO
// -------------------------

async function abrirInstrumento(instrumento) {
    instrumentoActual = instrumento;

    menuInstrumentos.style.display = "none";

    instrumentoScreen.style.display = "block";

    tituloInstrumento.textContent =
        instrumento.toUpperCase();

    await cargarEjerciciosInstrumento(instrumento);
}


// -------------------------
// VOLVER MENU
// -------------------------

function volverMenuInstrumentos() {
    instrumentoScreen.style.display = "none";

    menuInstrumentos.style.display = "block";

    nivelesContainer.innerHTML = "";

    contenedorEjercicio.innerHTML = "";
}


// -------------------------
// CARGAR EJERCICIOS
// -------------------------

async function cargarEjerciciosInstrumento(instrumento) {
    nivelesContainer.innerHTML = "";

    ejerciciosPorNivel = {};

    const niveles = [
        "basico",
        "intermedio",
        "avanzado"
    ];

    for (const nivel of niveles) {
        try {
            const response = await fetch(
                `./data/exercises/${instrumento}/${nivel}.json`
            );

            if (!response.ok) continue;

            const data = await response.json    ();

            ejerciciosPorNivel[nivel] =
                data.ejercicios || [];

        } catch(error) {
            console.error(error);
        }
    }

    renderMenuNiveles();
}


// -------------------------
// MENU NIVELES
// -------------------------

function renderMenuNiveles() {
    nivelesContainer.innerHTML = "";

    Object.keys(ejerciciosPorNivel)
        .forEach(nivel => {

            const section =
                document.createElement("div");

            section.className =
                "nivel-section";

            section.innerHTML = `
                <h2>
                    ${nivel.toUpperCase()}
                </h2>
            `;

            ejerciciosPorNivel[nivel]
                .forEach((ejercicio, index) => {

                    const card =
                        document.createElement("div");

                    card.className =
                        "ejercicio-card";

                    card.innerHTML = `
                        <h3>
                            ${ejercicio.titulo}
                        </h3>

                        <p>
                            ${ejercicio.descripcion}
                        </p>

                        <button
                            onclick="
                                seleccionarEjercicio(
                                    '${nivel}',
                                    ${index}
                                )
                            "
                        >
                            Abrir ejercicio
                        </button>
                    `;

                    section.appendChild(card);
                });

            nivelesContainer.appendChild(section);
        });
}


// -------------------------
// SELECCIONAR EJERCICIO
// -------------------------

function seleccionarEjercicio(
    nivel,
    index
) {

    const ejercicio =
        ejerciciosPorNivel[nivel][index];

    renderEjercicio(ejercicio);
}


// -------------------------
// RENDER GENERAL
// -------------------------

function renderEjercicio(ejercicio) {
    contenedorEjercicio.innerHTML = "";

    switch(ejercicio.tipo) {

        case "tiempo":
            renderEjercicioTiempo(ejercicio);
            break;

        case "ritmo":
            renderEjercicioRitmo(ejercicio);
            break;

        case "disociacion":
            renderEjercicioDisociacion(ejercicio);
            break;
    }
}


// -------------------------
// TIEMPO
// -------------------------

function renderEjercicioTiempo(ejercicio) {
    contenedorEjercicio.innerHTML = `
        <div class="exercise-view">

            <h2>
                ${ejercicio.titulo}
            </h2>

            <p>
                ${ejercicio.descripcion}
            </p>

            <div class="controls">

                <label>
                    Tempo
                </label>

                <input
                    type="range"
                    id="tempoSlider"
                    min="40"
                    max="220"
                    value="${ejercicio.tempo}"
                >

                <span id="tempoValue">
                    ${ejercicio.tempo} BPM
                </span>

            </div>

            <div class="controls">

                <label>
                    Pulsos
                </label>

                <input
                    type="number"
                    id="compasInput"
                    min="1"
                    max="12"
                    value="${ejercicio.compas}"
                >

            </div>

            <div
                id="metronomoContainer"
                class="metronomo"
            >

                ${Array.from({
                    length: ejercicio.compas
                }).map(() => `
                    <div class="beat"></div>
                `).join("")}

            </div>

            <div class="exercise-buttons">

                <button id="btnStart">
                    Iniciar
                </button>

                <button id="btnStop">
                    Detener
                </button>

            </div>

        </div>
    `;

    const tempoSlider =
        document.getElementById("tempoSlider");

    const tempoValue =
        document.getElementById("tempoValue");

    tempoSlider.addEventListener("input", () => {

        tempoValue.textContent =
            `${tempoSlider.value} BPM`;
    });

    document
        .getElementById("compasInput")
        .addEventListener("change", actualizarPulsosVisuales);

    document
        .getElementById("btnStart")
        .addEventListener("click", () => {

            if (metronomoActivo) return;

            iniciarMetronomoVisual();
        });

    document
        .getElementById("btnStop")
        .addEventListener("click", detenerMetronomo);
}

function actualizarPulsosVisuales() {
    const compas =
        parseInt(
            document.getElementById("compasInput").value
        );

    const metronomoContainer =
        document.getElementById("metronomoContainer");

    metronomoContainer.innerHTML = "";

    for (let i = 0; i < compas; i++) {

        metronomoContainer.innerHTML += `
            <div class="beat"></div>
        `;
    }
}


// -------------------------
// RITMO
// -------------------------

function renderEjercicioRitmo(ejercicio) {
    contenedorEjercicio.innerHTML = `
        <div class="exercise-view">
            <h2>
                ${ejercicio.titulo}
            </h2>

            <p>
                ${ejercicio.descripcion}
            </p>

            <div class="grid-ritmo">

                ${ejercicio.pattern.map(step => `

                    <div class="step">

                        <div>
                            ${step.manoDerecha || ""}
                        </div>

                        <div>
                            ${step.manoIzquierda || ""}
                        </div>

                        <div>
                            ${step.pieDerecho || ""}
                        </div>

                    </div>

                `).join("")}

            </div>

            <button id="btnPlayPattern">
                Iniciar
            </button>

        </div>
    `;

    document
        .getElementById("btnPlayPattern")
        .addEventListener("click", () => {

            iniciarPatronRitmo(ejercicio);
        });
}


// -------------------------
// DISOCIACION
// -------------------------

function renderEjercicioDisociacion(ejercicio) {
    contenedorEjercicio.innerHTML = `
        <div class="exercise-view">

            <h2>
                ${ejercicio.titulo}
            </h2>

            <p>
                ${ejercicio.descripcion}
            </p>

            <div class="body-grid">

                <div id="rh" class="limb">
                    RH
                </div>

                <div id="lh" class="limb">
                    LH
                </div>

                <div id="rf" class="limb">
                    RF
                </div>

                <div id="lf" class="limb">
                    LF
                </div>

            </div>

            <button id="btnStartCoordination">
                Iniciar
            </button>

        </div>
    `;

    document
        .getElementById("btnStartCoordination")
        .addEventListener("click", () => {

            iniciarDisociacion(ejercicio);
        });
}


// -------------------------
// METRONOMO
// -------------------------
let metronomoInterval = null;

let metronomoActivo = false;


function iniciarMetronomoVisual() {
    metronomoActivo = true;

    const beats =
        document.querySelectorAll(".beat");

    const tempo =
        parseInt(
            document.getElementById("tempoSlider").value
        );

    const compas =
        parseInt(
            document.getElementById("compasInput").value
        );

    const beatTime =
        (60 / tempo) * 1000;

    let currentBeat = 0;

    metronomoInterval = setInterval(() => {

        beats.forEach(beat => {
            beat.classList.remove("active");
        });

        beats[currentBeat]
            .classList.add("active");

        playSound({
            type: "drum",
            drum: currentBeat === 0
                ? "kick"
                : "snare"
        });

        currentBeat++;

        if(currentBeat >= compas) {
            currentBeat = 0;
        }

    }, beatTime);
}

function detenerMetronomo() {

    clearInterval(metronomoInterval);

    metronomoActivo = false;

    document
        .querySelectorAll(".beat")
        .forEach(beat => {

            beat.classList.remove("active");
        });
}


// -------------------------
// RITMO LOOP
// -------------------------

function iniciarPatronRitmo(ejercicio) {

    const steps =
        document.querySelectorAll(".step");

    const beatTime =
        (60 / ejercicio.tempo) * 1000;

    let current = 0;

    setInterval(() => {

        steps.forEach(step => {
            step.classList.remove("active");
        });

        steps[current]
            .classList.add("active");

        const beat =
            ejercicio.pattern[current];

        if (beat.pieDerecho) {
            playSound({
                type: "drum",
                drum: "kick"
            });
        }

        if (beat.manoIzquierda) {
            playSound({
                type: "drum",
                drum: "snare"
            });
        }

        if (beat.manoDerecha) {
            playSound({
                type: "drum",
                drum: "hihat"
            });
        }

        current++;

        if(current >= ejercicio.pattern.length) {
            current = 0;
        }

    }, beatTime);
}


// -------------------------
// DISOCIACION LOOP
// -------------------------

function iniciarDisociacion(ejercicio) {

    const limbs =
        document.querySelectorAll(".limb");

    const stepTime =
        (60 / ejercicio.tempo) * 1000;

    let current = 0;

    setInterval(() => {

        limbs.forEach(limb => {
            limb.classList.remove("active");
        });

        const step =
            ejercicio.steps[current];

        if(step.manoDerecha) {
            document
                .getElementById("rh")
                .classList.add("active");
        }

        if(step.manoIzquierda) {
            document
                .getElementById("lh")
                .classList.add("active");
        }

        if(step.pieDerecho) {
            document
                .getElementById("rf")
                .classList.add("active");
        }

        if(step.pieIzquierdo) {
            document
                .getElementById("lf")
                .classList.add("active");
        }

        current++;

        if(current >= ejercicio.steps.length) {
            current = 0;
        }

    }, stepTime);
}
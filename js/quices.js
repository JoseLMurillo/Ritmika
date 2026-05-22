let preguntasLeccion = [];

const btnConfirmar = document.getElementById("btnConfirmar");
let correctas = 0;

// Función principal para cargar los datos
async function cargarQuiz() {
    const modulo = selectorModulo.value;
    const nivel = selectorNivel.value;

    if (!modulo || !nivel) return;

    try {
        // 🔥 Ruta correcta del JSON base
        const basePath = `./data/${modulo}/${nivel}`;
        const response = await fetch(`${basePath}/${nivel}.json`);

        if (!response.ok) throw new Error("Archivo base no encontrado");

        quizData = await response.json();

        let gruposData = [];

        // 🔥 1. Cargar todos los grupos
        for (const grupo of quizData.grupos) {
            const resGrupo = await fetch(`${basePath}/${grupo}.json`);
            if (!resGrupo.ok) {
                console.warn(`Grupo no encontrado: ${grupo}`);
                continue;
            }

            const dataGrupo = await resGrupo.json();

            gruposData.push({
                nombre: grupo,
                preguntas: shuffle(dataGrupo.preguntas || [])
            });
        }

        // ⚠️ Si no hay grupos válidos
        if (gruposData.length === 0) {
            throw new Error("No se cargaron grupos de preguntas");
        }

        // 🔥 2. Total de preguntas (10–20)
        const totalPreguntas = Math.floor(Math.random() * 11) + 10;

        // 🔥 3. Mínimo por grupo (1 o 2)
        const minPorGrupo = totalPreguntas >= gruposData.length * 2 ? 2 : 1;

        let seleccion = [];

        // 🔥 4. Primera pasada (mínimo por grupo)
        for (const grupo of gruposData) {
            const tomadas = grupo.preguntas.slice(
                0,
                Math.min(minPorGrupo, grupo.preguntas.length)
            );

            seleccion = seleccion.concat(tomadas);

            grupo.preguntas = grupo.preguntas.slice(tomadas.length);
        }

        // 🔥 5. Restantes
        let restantes = totalPreguntas - seleccion.length;

        // 🔥 6. Reparto balanceado
        let index = 0;

        while (restantes > 0) {
            const grupo = gruposData[index % gruposData.length];

            if (grupo.preguntas.length > 0) {
                seleccion.push(grupo.preguntas.shift());
                restantes--;
            }

            index++;

            // ⚠️ Evita loop infinito si ya no hay preguntas
            if (index > 1000) break;
        }

        // 🔥 7. Mezcla final
        preguntasLeccion = shuffle(seleccion);

        // 🔥 Estado
        preguntaActual = 0;
        correctas = 0;
        btnConfirmar.disabled = false;

        cargarPregunta();

        console.log(`Preguntas cargadas: ${preguntasLeccion.length}`);

    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

// Eventos
selectorModulo.addEventListener("change", () => {
    // Si cambia el módulo, reiniciamos el nivel para obligar a elegir uno nuevo
    selectorNivel.value = "";
    btnConfirmar.disabled = true;

    // Opcional: Mostrar el selector de nivel si estaba oculto
    selectorNivel.style.display = "block";
});

selectorNivel.addEventListener("change", cargarQuiz);

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function cargarPregunta() {
    respuestaUsuario = null;
    contenedor.innerHTML = "";

    const pregunta = preguntasLeccion[preguntaActual];

    tema.textContent = quizData.tema;
    preguntaTexto.textContent = pregunta.texto;

    switch (pregunta.tipo) {

        case "select":
            const select = document.createElement("select");
            const clean_option = document.createElement("option");
            clean_option.value = "";
            clean_option.textContent = "";
            select.appendChild(clean_option);

            pregunta.opciones.forEach((op, index) => {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = op.texto;
                select.appendChild(option);
            });

            select.addEventListener("change", () => {
                respuestaUsuario = parseInt(select.value);
                playSound(pregunta.opciones[respuestaUsuario].sonido);
            });

            contenedor.appendChild(select);
            break;

        case "image":
            pregunta.opciones.forEach((op, index) => {
                const img = document.createElement("img");
                img.src = op.src;

                img.addEventListener("click", () => {
                    document.querySelectorAll("img").forEach(i => i.classList.remove("selected"));
                    img.classList.add("selected");
                    respuestaUsuario = index;
                    playSound(op.sonido);
                });

                contenedor.appendChild(img);
            });
            break;

        case "complete":
            const input = document.createElement("input");
            input.type = "text";

            input.addEventListener("input", () => {
                respuestaUsuario = input.value.trim();
                playSound(pregunta.sonido);
            });

            contenedor.appendChild(input);
            break;

        case "audioQuestion":

            const btnAudio = document.createElement("button");
            btnAudio.textContent = "🔊 Escuchar";

            btnAudio.addEventListener("click", () => {
                playSound(pregunta.audioPregunta);
            });

            contenedor.appendChild(btnAudio);

            const opcionesContainer = document.createElement("div");
            contenedor.appendChild(opcionesContainer);

            pregunta.opciones.forEach((op, index) => {

                let elemento;

                if (op.tipo === "texto") {
                    elemento = document.createElement("button");
                    elemento.textContent = op.contenido;
                }

                if (op.tipo === "imagen") {
                    elemento = document.createElement("img");
                    elemento.src = op.contenido;
                }

                elemento.style.margin = "10px";

                elemento.addEventListener("click", () => {
                    respuestaUsuario = index;
                    playSound(op.sonido);

                    opcionesContainer.querySelectorAll("*")
                        .forEach(el => el.classList.remove("selected"));

                    elemento.classList.add("selected");
                });

                opcionesContainer.appendChild(elemento);
            });

            break;

        case "order":

            let ordenActual = [];

            pregunta.opciones.forEach((op) => {

                const div = document.createElement("div");
                div.textContent = op.texto;
                div.className = "order-item";

                div.addEventListener("click", () => {

                    const existe = ordenActual.indexOf(op.texto);

                    if (existe > -1) {
                        ordenActual.splice(existe, 1);
                        div.classList.remove("order-selected");
                    } else {
                        ordenActual.push(op.texto);
                        div.classList.add("order-selected");
                        playSound(op.sonido);
                    }

                    respuestaUsuario = [...ordenActual];
                });

                contenedor.appendChild(div);
            });

            break;
    }
}

btnConfirmar.addEventListener("click", () => {

    //const pregunta = quizData.preguntas[preguntaActual];
    //let correcta = false;

    const pregunta = preguntasLeccion[preguntaActual];

    switch (pregunta.tipo) {
        case "select":
        case "image":
        case "audioQuestion":
            correcta = pregunta.opciones[respuestaUsuario]?.correcta === true;
            break;

        case "complete":
            correcta = respuestaUsuario === pregunta.correcta;
            break;

        case "order":
            correcta = JSON.stringify(respuestaUsuario) === JSON.stringify(pregunta.correcta);
            break;
    }

    if (correcta) {
        playSound(sonidoCorrecto);
        correctas++;
        // document.getElementById("explicacionTexto").textContent = pregunta.explicacion;

        console.log("Correctas:", correctas);
    } else {
        playSound(sonidoIncorrecto);
    }

    setTimeout(() => {
        preguntaActual++;
        if (preguntaActual < preguntasLeccion.length) {
            cargarPregunta();
        } else {
            alert(`Módulo finalizado. Preguntas correctas: ${correctas}/${preguntasLeccion.length}`);
        }
    }, 800);
});
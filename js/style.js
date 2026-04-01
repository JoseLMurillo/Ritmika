const temas = {
    general: {
        fondo: "#dec4c4",
        primario: "#2596be",
        secundario: "#8e5f8d",
        terciario: "#a477a3"
    },
    bateria: {
        fondo: "#f50b0b",
        primario: "#b08a8a",
        secundario: "#8c6d6d",
        terciario: "#5e4b4b"
    },
    guitarra: {
        fondo: "#ff9700"
    },
    bajo: {
        fondo: "#302c9b"
    },
    piano: {
        fondo: "#787878"
    },
    tecnica_vocal: {
        fondo: "#fff65f"
    }
};


// const selectorModulo = document.getElementById("selectorModulo");


function aplicarTema(modulo) {
    const tema = temas[modulo];
    if (!tema) return;

    if (tema.fondo)
        document.documentElement.style.setProperty('--color-fondo', tema.fondo);

    if (tema.primario)
        document.documentElement.style.setProperty('--color-primario', tema.primario);

    if (tema.secundario)
        document.documentElement.style.setProperty('--color-secundario', tema.secundario);

    if (tema.terciario)
        document.documentElement.style.setProperty('--color-terciario', tema.terciario);
}


selectorModulo.addEventListener("change", async () => {

    if (!selectorModulo.value) return;

    aplicarTema(selectorModulo.value); // 👈 aquí aplicas el estilo
});
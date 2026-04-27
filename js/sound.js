const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(sound) {

    if (!sound) return;

    // Si es string, usamos audio tradicional (correcto / incorrecto)
    if (typeof sound === "string") {
        const audio = new Audio(sound);
        audio.play();
        return;
    }

    // Si es nota individual
    if (sound.type === "note") {
        playNote(sound);
    }

    // Si es batería
    if (sound.type === "drum") {
        playDrum(sound);
    }

    // Si es melodía
    if (sound.type === "melody") {
        playMelody(sound.sequence, sound.tempo || 120);
    }

    // Si es patrón de batería
    if (sound.type === "drumPattern") {
        playDrumPattern(sound.pattern, sound.tempo || 120);
    }

    // Si es acorde
    if (sound.type === "chord") {
        playChord(sound.notes, sound.duration || 2);
    }
}

function playChord(notes, duration) {
    const now = audioCtx.currentTime;

    notes.forEach(note => {
        // Creamos los nodos para cada nota del acorde
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine"; // Puedes cambiar a "triangle" para un sonido más cálido
        osc.frequency.value = noteToFrequency(note);

        // Configuración de volumen (ADSR básico)
        // Dividimos el volumen entre el número de notas para evitar saturación (clipping)
        const volume = 0.5 / notes.length;

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + duration);
    });
}

function playDrumPattern(pattern, tempo) {
    const beatTime = 60 / tempo;
    const startTime = audioCtx.currentTime;

    pattern.forEach(step => {
        // Calculamos el momento exacto en el que debe sonar (basado en el beat)
        const time = startTime + (step.time * beatTime);

        // Llamamos a una versión modificada de playDrum que acepte un tiempo de inicio
        playDrumAtTime(step.drum, time);
    });
}

function playDrumAtTime(drum, time) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (drum === "kick") {
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.5);
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    }

    if (drum === "snare") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(100, time); // Un tono base para el redoblante
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    }

    // Opcional: Agregar un Hi-Hat rápido
    if (drum === "hihat") {
        osc.type = "square";
        osc.frequency.setValueAtTime(10000, time);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    }

    osc.start(time);
    osc.stop(time + 0.5);
}

function playNote({ note = "C4", duration = 0.4 }) {

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = noteToFrequency(note);

    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}


function noteToFrequency(note) {
    const notes = {
        C: -9, D: -7, E: -5, F: -4,
        G: -2, A: 0, B: 2
    };

    const letter = note[0];
    const octave = parseInt(note.slice(-1));

    const semitone = notes[letter];
    const a4 = 440;
    const semitonesFromA4 = semitone + (octave - 4) * 12;

    return a4 * Math.pow(2, semitonesFromA4 / 12);
}


function playDrum({ drum = "kick" }) {

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (drum === "kick") {
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    }

    if (drum === "snare") {
        osc.type = "triangle";
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    }

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}


function playMelody(sequence, tempo) {

    const beatTime = 60 / tempo;
    let time = audioCtx.currentTime;

    sequence.forEach(noteObj => {

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.value = noteToFrequency(noteObj.note);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.4, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + noteObj.duration);

        osc.start(time);
        osc.stop(time + noteObj.duration);

        time += noteObj.duration * beatTime;
    });
}
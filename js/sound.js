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
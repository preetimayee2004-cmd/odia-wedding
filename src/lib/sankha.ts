/**
 * Sankha (conch) sound for the opening. Must be called directly inside the
 * guest's tap handler — browsers only allow sound after a user gesture.
 *
 * With a configured recording it plays that file; otherwise it synthesises a
 * conch-like call with the Web Audio API (no download, no licence needed).
 * Sound is a nicety: any failure is swallowed so the opening never stalls.
 */

let ctx: AudioContext | null = null;

export function playSankha(src: string | null): void {
  try {
    if (src) {
      const audio = new Audio(src);
      audio.volume = 0.85;
      void audio.play().catch(() => {});
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    synthConch(ctx);
  } catch {
    /* no sound — the animation continues regardless */
  }
}

/** A brassy, swelling call with a slight pitch rise, gentle vibrato and breath. */
function synthConch(ac: AudioContext) {
  const t = ac.currentTime + 0.02;
  const dur = 4.4;
  const f0 = 220; // A3 — the low, resonant register of a large sankha

  // Master envelope: slow swell, long sustain, soft release
  const out = ac.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.3, t + 0.75);
  out.gain.setValueAtTime(0.3, t + dur - 1.5);
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  // Tone shaping: opening filter (the "bloom" of the call) + a horn-like formant
  const lowpass = ac.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.Q.value = 1.6;
  lowpass.frequency.setValueAtTime(550, t);
  lowpass.frequency.linearRampToValueAtTime(1900, t + 0.9);
  lowpass.frequency.linearRampToValueAtTime(1300, t + dur);
  const formant = ac.createBiquadFilter();
  formant.type = "peaking";
  formant.frequency.value = 880;
  formant.Q.value = 1.4;
  formant.gain.value = 7;

  // Gentle vibrato
  const lfo = ac.createOscillator();
  lfo.frequency.value = 5.1;
  const vibrato = ac.createGain();
  vibrato.gain.value = 2.4;
  lfo.connect(vibrato);

  const partials: Array<[ratio: number, level: number, type: OscillatorType]> = [
    [1, 0.55, "sawtooth"],
    [2, 0.16, "sawtooth"],
    [3, 0.05, "triangle"],
    [0.5, 0.14, "triangle"],
  ];
  const oscs = partials.map(([ratio, level, type]) => {
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0 * ratio * 0.93, t); // breath-driven pitch rise into the note
    osc.frequency.exponentialRampToValueAtTime(f0 * ratio, t + 0.5);
    vibrato.connect(osc.frequency);
    const g = ac.createGain();
    g.gain.value = level;
    osc.connect(g).connect(lowpass);
    return osc;
  });
  lowpass.connect(formant).connect(out);

  // Breath noise
  const noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ac.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const breathBand = ac.createBiquadFilter();
  breathBand.type = "bandpass";
  breathBand.frequency.value = 1500;
  breathBand.Q.value = 0.9;
  const breath = ac.createGain();
  breath.gain.setValueAtTime(0.0001, t);
  breath.gain.exponentialRampToValueAtTime(0.035, t + 0.3);
  breath.gain.exponentialRampToValueAtTime(0.012, t + 1.2);
  breath.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  noise.connect(breathBand).connect(breath).connect(out);

  // Temple-hall space: a short feedback echo
  const delay = ac.createDelay(1);
  delay.delayTime.value = 0.14;
  const feedback = ac.createGain();
  feedback.gain.value = 0.34;
  const wet = ac.createGain();
  wet.gain.value = 0.32;
  out.connect(delay);
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(ac.destination);
  out.connect(ac.destination);

  const stop = t + dur + 0.1;
  for (const o of [...oscs, lfo]) {
    o.start(t);
    o.stop(stop);
  }
  noise.start(t);
  noise.stop(stop);
}

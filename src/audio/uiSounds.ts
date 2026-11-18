import { getSettings, isSoundEnabled } from "../state/settings";
import { effectiveSfxGain } from "./volumeBalance";

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  ctx ??= new AudioContext();
  return ctx;
}

/**
 * Short wooden knock for UI taps (works in browser + Capacitor after user gesture).
 */
export function playUiKnock(): void {
  if (!isSoundEnabled()) return;
  const sfxGain = effectiveSfxGain(getSettings().soundVolume);
  const ac = audioContext();
  if (!ac) return;

  void ac.resume().then(() => {
    const t = ac.currentTime;

    const body = ac.createOscillator();
    const bodyGain = ac.createGain();
    body.type = "sine";
    body.frequency.setValueAtTime(220, t);
    body.frequency.exponentialRampToValueAtTime(95, t + 0.06);
    bodyGain.gain.setValueAtTime(0.0001, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.32 * sfxGain, t + 0.004);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    body.connect(bodyGain);
    bodyGain.connect(ac.destination);
    body.start(t);
    body.stop(t + 0.12);

    const bufferSize = Math.floor(ac.sampleRate * 0.04);
    const noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ac.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ac.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 900;
    noiseFilter.Q.value = 0.8;
    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.12 * sfxGain, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.04);
  });
}

/**
 * Gentle fabric swish when clothes move between shelves.
 * Slight random pitch so repeated moves don't sound identical.
 */
export function playClothesMove(): void {
  if (!isSoundEnabled()) return;
  const sfxGain = effectiveSfxGain(getSettings().soundVolume);
  const ac = audioContext();
  if (!ac) return;

  const duration = 0.26;
  const pitch = 0.9 + Math.random() * 0.2;

  void ac.resume().then(() => {
    const t = ac.currentTime;

    const samples = Math.floor(ac.sampleRate * duration);
    const buffer = ac.createBuffer(1, samples, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < samples; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ac.createBufferSource();
    noise.buffer = buffer;

    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(1500 * pitch, t);
    band.frequency.exponentialRampToValueAtTime(650 * pitch, t + duration);

    const soften = ac.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.value = 2600;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.09 * sfxGain, t + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    noise.connect(band);
    band.connect(soften);
    soften.connect(gain);
    gain.connect(ac.destination);
    noise.start(t);
    noise.stop(t + duration);
  });
}

/** E♭maj9 voicing (Hz): E♭3, B♭3, D4, G4, B♭4, F5 — rolled bottom to top. */
const LEVEL_COMPLETE_CHORD = [155.56, 233.08, 293.66, 392.0, 466.16, 698.46];

/**
 * Gentle rolled major-7 synth chord for finishing a level: quick bloom, soft fade.
 */
export function playLevelComplete(): void {
  if (!isSoundEnabled()) return;
  const sfxGain = effectiveSfxGain(getSettings().soundVolume);
  const ac = audioContext();
  if (!ac) return;

  const roll = 0.0715;
  const attack = 0.06;
  const release = 1.9;

  void ac.resume().then(() => {
    const t0 = ac.currentTime + 0.02;

    const tone = ac.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(1400, t0);
    tone.frequency.linearRampToValueAtTime(3200, t0 + 0.35);
    tone.frequency.exponentialRampToValueAtTime(900, t0 + release + 0.4);
    tone.Q.value = 0.4;

    const master = ac.createGain();
    master.gain.value = 0.5 * sfxGain;
    tone.connect(master);
    master.connect(ac.destination);

    // Gentle echo: darker, quieter repeats that fade out on their own.
    const echo = ac.createDelay(1);
    echo.delayTime.value = 0.24;
    const feedback = ac.createGain();
    feedback.gain.value = 0.32;
    const echoTone = ac.createBiquadFilter();
    echoTone.type = "lowpass";
    echoTone.frequency.value = 1800;
    const echoLevel = ac.createGain();
    echoLevel.gain.value = 0.35;
    master.connect(echo);
    echo.connect(echoTone);
    echoTone.connect(feedback);
    feedback.connect(echo);
    echoTone.connect(echoLevel);
    echoLevel.connect(ac.destination);

    LEVEL_COMPLETE_CHORD.forEach((freq, i) => {
      const start = t0 + i * roll;
      const end = start + release;
      const voice = ac.createGain();
      // Upper notes a touch quieter so the chord stays soft rather than bright.
      const level = 0.11 * (1 - i * 0.07);
      voice.gain.setValueAtTime(0.0001, start);
      voice.gain.linearRampToValueAtTime(level, start + attack);
      voice.gain.exponentialRampToValueAtTime(level * 0.45, start + 0.5);
      voice.gain.exponentialRampToValueAtTime(0.0001, end);
      voice.connect(tone);

      // Two slightly detuned oscillators per note give the warm synth-pad shimmer.
      for (const [type, detune] of [
        ["triangle", -7],
        ["sine", 6],
      ] as const) {
        const osc = ac.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        osc.connect(voice);
        osc.start(start);
        osc.stop(end + 0.05);
      }
    });
  });
}

/**
 * Soft whoosh when a full shelf slides off the wardrobe.
 * @param side which column slides off (left = exits left, right = exits right)
 */
export function playShelfSlideWhoosh(side: "left" | "right"): void {
  if (!isSoundEnabled()) return;
  const sfxGain = effectiveSfxGain(getSettings().soundVolume);
  const ac = audioContext();
  if (!ac) return;

  const duration = 0.48;

  void ac.resume().then(() => {
    const t = ac.currentTime;
    const pan = side === "left" ? -0.35 : 0.35;

    const samples = Math.floor(ac.sampleRate * duration);
    const buffer = ac.createBuffer(1, samples, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < samples; i++) {
      const envelope = 1 - i / samples;
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = ac.createBufferSource();
    noise.buffer = buffer;

    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    const swoopUp = t + 0.06;
    const swoopDown = t + duration - 0.05;
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.exponentialRampToValueAtTime(1400, swoopUp);
    filter.frequency.exponentialRampToValueAtTime(220, swoopDown);
    filter.Q.setValueAtTime(0.7, t);
    filter.Q.linearRampToValueAtTime(1.4, swoopUp);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.2 * sfxGain, t + 0.05);
    gain.gain.setValueAtTime(0.16 * sfxGain, t + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    const panner = ac.createStereoPanner();
    panner.pan.setValueAtTime(pan, t);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(ac.destination);
    noise.start(t);
    noise.stop(t + duration);

    const air = ac.createOscillator();
    const airGain = ac.createGain();
    air.type = "sine";
    air.frequency.setValueAtTime(520, t);
    air.frequency.exponentialRampToValueAtTime(180, t + duration);
    airGain.gain.setValueAtTime(0.0001, t);
    airGain.gain.linearRampToValueAtTime(0.06 * sfxGain, t + 0.08);
    airGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    air.connect(airGain);
    airGain.connect(panner);
    air.start(t);
    air.stop(t + duration);
  });
}
import { getSettings } from "../state/settings";

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
  if (!getSettings().soundEnabled) return;
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
    bodyGain.gain.exponentialRampToValueAtTime(0.32, t + 0.004);
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
    noiseGain.gain.setValueAtTime(0.12, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.04);
  });
}

/**
 * Soft whoosh when a full shelf slides off the wardrobe.
 * @param side which column slides off (left = exits left, right = exits right)
 */
export function playShelfSlideWhoosh(side: "left" | "right"): void {
  if (!getSettings().soundEnabled) return;
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
    gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gain.gain.setValueAtTime(0.16, t + 0.18);
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
    airGain.gain.linearRampToValueAtTime(0.06, t + 0.08);
    airGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    air.connect(airGain);
    airGain.connect(panner);
    air.start(t);
    air.stop(t + duration);
  });
}
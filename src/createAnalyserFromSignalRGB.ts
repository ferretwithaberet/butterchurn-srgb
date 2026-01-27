export const createAnalyserFromSignalRGB = (audioContext: AudioContext) => {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  // Feed analyser *silence* (keeps graph valid; output muted)
  const silent = audioContext.createConstantSource();
  const mute = audioContext.createGain();
  mute.gain.value = 0.0;
  silent.connect(analyser);
  analyser.connect(mute);
  mute.connect(audioContext.destination);
  silent.start();

  // 3) Spoof analyser reads using SignalRGB engine.audio.*
  //    - butterchurn reads bytes: freq/time arrays in 0..255 range.
  const clampByte = (x: number) => Math.max(0, Math.min(255, x | 0));

  // Cache arrays to avoid allocations
  let lastFreq200 = new Int8Array(200);

  analyser.getByteFrequencyData = function (out) {
    // SignalRGB: engine.audio.freq is 200 bins (Int8 values)
    lastFreq200 = new Int8Array(engine.audio.freq);

    // Map 200 bins -> out.length bins (usually analyser.frequencyBinCount = 1024)
    for (let i = 0; i < out.length; i++) {
      const t = i / (out.length - 1);
      const idx = t * (lastFreq200.length - 1);

      const i0 = idx | 0;
      const i1 = Math.min(lastFreq200.length - 1, i0 + 1);
      const frac = idx - i0;

      // SignalRGB freq often comes negative; use magnitude, then scale to 0..255
      const v =
        Math.abs(lastFreq200[i0]) * (1 - frac) +
        Math.abs(lastFreq200[i1]) * frac;
      out[i] = clampByte(v * 2); // tweak multiplier to taste
    }
  };

  analyser.getByteTimeDomainData = function (out) {
    // SignalRGB level is -100..0 (dB-ish). Convert to 0..1 “amplitude”.
    const amp = Math.max(0, Math.min(1, (100 + engine.audio.level) / 100));

    // Cheap synthetic waveform (noise around midpoint), driven by amp
    const A = amp * 90; // tweak
    for (let i = 0; i < out.length; i++) {
      out[i] = clampByte(128 + (Math.random() * 2 - 1) * A);
    }
  };

  return analyser;
};

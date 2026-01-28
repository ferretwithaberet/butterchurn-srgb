// This function was generated using AI, it seems like `getByteTimeDomainData` is the only thing that gets used by Butterchurn, but tbh idk
export const createSignalRGBAnalyser = (_audioContext: AudioContext) => {
  const frequencyBinCount = 1024;
  const clampByte = (x: number) => Math.max(0, Math.min(255, x | 0));

  const analyser = {
    fftSize: 2048,
    frequencyBinCount,

    connect() {}, // ← butterchurn never uses return value

    getByteFrequencyData(out: Uint8Array) {
      const freq = engine.audio.freq;

      for (let i = 0; i < out.length; i++) {
        const t = i / (out.length - 1);
        const idx = t * (freq.length - 1);

        const i0 = idx | 0;
        const i1 = Math.min(freq.length - 1, i0 + 1);
        const frac = idx - i0;

        const v = Math.abs(freq[i0]) * (1 - frac) + Math.abs(freq[i1]) * frac;

        out[i] = clampByte(v * 2.2);
      }
    },

    getByteTimeDomainData(out: Uint8Array) {
      const amp = Math.max(0, Math.min(1, (100 + engine.audio.level) / 100));
      const A = amp * 96;

      for (let i = 0; i < out.length; i++) {
        out[i] = clampByte(128 + (Math.random() * 2 - 1) * A);
      }
    },
  };

  return analyser as unknown as AnalyserNode;
};

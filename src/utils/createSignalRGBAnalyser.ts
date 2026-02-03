// TODO: Improve logic
const clampByte = (x: number) => Math.max(0, Math.min(255, Math.floor(x)));

export const createSignalRGBAnalyser = (_audioContext: AudioContext) => {
  const analyser = {
    getByteTimeDomainData(out: Uint8Array) {
      const { engine, Amplify } = window;
      const freqs = engine.audio.freq.map((freq) => Math.abs(freq));

      const length = Math.min(freqs.length, out.length);
      for (let i = 0; i < length; i++) {
        const value = freqs[i] ?? 0;
        out[i] = clampByte(value * (Amplify / 10));
      }
    },
  };

  return analyser as unknown as AnalyserNode;
};

import FFT from "als-fft";

type ComplexPair = [number, number];

type AudioLevelsLike = {
  updateAudioLevels: (fps: number, frame: number) => void;
  val: Float32Array;
  att: Float32Array;
};
type VisualizerLike = { renderer: { audioLevels: AudioLevelsLike } };

const clampByte = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : v);
const clamp01 = (v: number): number => (v < -1 ? -1 : v > 1 ? 1 : v);
const isPow2 = (n: number): boolean => n > 0 && (n & (n - 1)) === 0;

// Spectrum-sum threshold below which we treat a frame as silent. SignalRGB
// often leaks a low noise floor (frames like 1,1,2,4,6,19,... with no actual
// system sound), so a strict "any positive bin" check fails to gate it out.
const SILENCE_SUM_THRESHOLD = 50;

/**
 * SignalRGB-reported silence. Per the developer docs, `engine.audio.level`
 * is dB-style loudness in [-100, 0] where -100 is "very quiet"; that's the
 * documented sentinel. SignalRGB has also been observed to publish a low
 * noise floor in `.freq` while `level` reads slightly above -100, so we
 * additionally treat a near-zero total spectrum energy as silent. INT32_MIN
 * garbage in `.freq` is negative and therefore ignored by the sum.
 */
const isSilent = (): boolean => {
  const audio = engine?.audio;
  if (!audio) return true;
  if (audio.level <= -100) return true;

  const freq = audio.freq;
  if (!freq || freq.length === 0) return true;

  let sum = 0;
  for (let i = 0; i < freq.length; i++) {
    const v = freq[i];
    if (v > 0) sum += v;
    if (sum >= SILENCE_SUM_THRESHOLD) return false;
  }
  return true;
};

/**
 * Build a length-N real-valued time-domain signal from SignalRGB-style
 * frequency magnitudes (0..255). The source bins are stretched linearly
 * across the full output spectrum (bins 1..N/2-1) so butterchurn's bass,
 * mid, and treble bands all receive signal — not just the lowest 200 bins.
 * Each bin gets a random phase and a Hermitian-conjugate twin, so the
 * IFFT result is real.
 *
 * `shape` raises each normalized magnitude to that power. shape < 1 lifts
 * every bin toward 1, producing a high-amplitude time-domain signal that
 * clips heavily after IFFT — the clipping spreads energy across butterchurn's
 * FFT bins and yields big bass_att / mid_att / treb_att swings, i.e. "crazy".
 * shape > 1 shrinks small bins toward 0, lowering the time-domain peak,
 * which avoids clipping and feels calmer.
 */
function magsToTimeDomainIFFT(
  mags: ArrayLike<number>,
  N: number,
  shape: number,
): Float32Array {
  if (!isPow2(N)) throw new Error(`N must be a power of two, got ${N}`);
  const half = N >> 1;
  const numBins = half - 1;
  const srcLen = mags.length;

  const spectrum: ComplexPair[] = Array.from({ length: N }, () => [0, 0]);

  for (let k = 1; k < half; k++) {
    const srcIdx = Math.min(
      srcLen - 1,
      Math.floor(((k - 1) * srcLen) / numBins),
    );
    const m0 = clampByte(Number(mags[srcIdx] ?? 0)) / 255;
    if (m0 === 0) continue;

    const m = m0 ** shape;

    const phi = Math.random() * 2 * Math.PI;
    const re = m * Math.cos(phi);
    const im = m * Math.sin(phi);

    spectrum[k] = [re, im];
    spectrum[N - k] = [re, -im];
  }

  const recovered = FFT.ifft(spectrum) as ArrayLike<number>;

  // Peak of N_b random-phase cosines ~ A·√(2·N_b·ln N); compensate for the
  // IFFT's 1/N so that full-scale magnitudes land near ±1, and genuine
  // volume information survives downstream instead of being flattened
  // by peak-normalization.
  const scale = N / (2 * Math.sqrt(2 * numBins * Math.log(N)));

  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    out[i] = Number(recovered[i] ?? 0) * scale;
  }
  return out;
}

/**
 * butterchurn's AudioLevels falls back to val=att=1.0 once longAvg<0.001
 * (a divide-by-zero guard at butterchurn.js:3292). That hands presets a
 * "moderate activity" signal during real silence and makes the visual keep
 * animating. Wrap updateAudioLevels so the original runs first, then zero
 * val/att for any frame our silence check holds.
 */
export const installSignalRGBSilenceGuard = (
  visualizer: VisualizerLike,
): void => {
  const { audioLevels } = visualizer.renderer;
  const origUpdate = audioLevels.updateAudioLevels.bind(audioLevels);
  audioLevels.updateAudioLevels = (fps: number, frame: number) => {
    origUpdate(fps, frame);
    if (isSilent()) {
      audioLevels.val.fill(0);
      audioLevels.att.fill(0);
    }
  };
};

export const createSignalRGBAnalyser = (
  _audioContext: AudioContext,
): Pick<AnalyserNode, "getByteTimeDomainData"> => {
  const fakeAnalyser = {
    getByteTimeDomainData(out: Uint8Array) {
      // butterchurn subtracts 128 from each byte before its FFT,
      // so 128 → 0 → empty spectrum.
      if (isSilent()) {
        out.fill(128);
        return;
      }

      const { Amplify } = window;
      const timeDomain = magsToTimeDomainIFFT(
        engine.audio.freq,
        out.length,
        10 / Amplify,
      );

      for (let i = 0; i < out.length; i++) {
        out[i] = Math.round(128 + 127 * clamp01(timeDomain[i]));
      }
    },
  };

  return fakeAnalyser as unknown as AnalyserNode;
};

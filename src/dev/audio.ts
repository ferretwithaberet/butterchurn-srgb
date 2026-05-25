import { generateRandomInt } from '@/dev/utils';

export type AudioMockType = null | 'random' | 'system';

type EngineAudio = {
  level: number;
  rawlevel: number;
  density: number;
  freq: number[];
};

const FREQ_BINS = 200;
const RANDOM_INTERVAL_MS = 500;
const noop = () => {};

const setEngineAudio = (audio: EngineAudio) => {
  (window as any).engine = { audio };
};

const zeroedAudio = (): EngineAudio => ({
  level: -100,
  rawlevel: -100,
  density: 0,
  freq: Array.from({ length: FREQ_BINS }, () => 0),
});

const randomAudio = (): EngineAudio => {
  const level = -generateRandomInt(0, 101);
  return {
    level,
    rawlevel: level,
    density: Math.random(),
    freq: Array.from({ length: FREQ_BINS }, () => generateRandomInt(0, 255)),
  };
};

const once = (fn: () => void) => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    fn();
  };
};

const startRandomLoop = () => {
  setEngineAudio(randomAudio());
  let last = 0;
  let frameId = 0;
  const tick: FrameRequestCallback = (now) => {
    if (last === 0) last = now;
    if (now - last >= RANDOM_INTERVAL_MS) {
      setEngineAudio(randomAudio());
      last = now;
    }
    frameId = requestAnimationFrame(tick);
  };
  frameId = requestAnimationFrame(tick);
  return once(() => cancelAnimationFrame(frameId));
};

const startSystemLoop = (track: MediaStreamTrack) => {
  const ctx = new AudioContext();
  void ctx.resume();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;
  const source = ctx.createMediaStreamSource(new MediaStream([track]));
  source.connect(analyser);

  const freqBytes = new Uint8Array(analyser.frequencyBinCount);
  const timeBytes = new Uint8Array(analyser.fftSize);
  const audio = zeroedAudio();
  setEngineAudio(audio);

  let frameId = 0;
  const tick = () => {
    analyser.getByteFrequencyData(freqBytes);
    analyser.getByteTimeDomainData(timeBytes);

    for (let i = 0; i < FREQ_BINS; i += 1) audio.freq[i] = freqBytes[i] ?? 0;

    let sumSq = 0;
    for (let i = 0; i < timeBytes.length; i += 1) {
      const v = ((timeBytes[i] ?? 128) - 128) / 128;
      sumSq += v * v;
    }
    const rms = Math.sqrt(sumSq / timeBytes.length);
    audio.rawlevel = rms > 0 ? Math.max(-100, 20 * Math.log10(rms)) : -100;
    audio.level = audio.rawlevel;

    let sum = 0;
    for (let i = 0; i < freqBytes.length; i += 1) sum += freqBytes[i] ?? 0;
    audio.density = sum / (freqBytes.length * 255);

    frameId = requestAnimationFrame(tick);
  };
  frameId = requestAnimationFrame(tick);

  return once(() => {
    cancelAnimationFrame(frameId);
    source.disconnect();
    void ctx.close();
  });
};

const stopStream = (stream: MediaStream) => {
  stream.getTracks().forEach((t) => t.stop());
};

const acquireSystemStream = async () => {
  const captureMediaStream = await navigator.mediaDevices.getDisplayMedia({ audio: true });
  const [audioTrack] = captureMediaStream.getAudioTracks();
  if (!audioTrack) {
    stopStream(captureMediaStream);
    throw new Error('No audio track captured. Enable "Share audio" in the picker.');
  }
  return { captureMediaStream, audioTrack };
};

let unmount: () => void = noop;

const mockAudioEngine = async (type: AudioMockType = null) => {
  unmount();
  unmount = noop;

  if (type === 'system') {
    const { captureMediaStream, audioTrack } = await acquireSystemStream();
    const stopLoop = startSystemLoop(audioTrack);
    unmount = once(() => {
      stopLoop();
      stopStream(captureMediaStream);
    });
  } else if (type === 'random') {
    unmount = startRandomLoop();
  } else {
    setEngineAudio(zeroedAudio());
  }

  return unmount;
};

export default mockAudioEngine;

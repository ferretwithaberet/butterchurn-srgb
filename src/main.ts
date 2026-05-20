import '@/style.css';

import butterchurn from 'butterchurn';

import { getRandomPresetName, getFullPresetName, getPresetByName } from '@/utils/presets';
import {
  createSignalRGBAnalyser,
  installSignalRGBSilenceGuard,
} from '@/utils/createSignalRGBAnalyser';
import { setupDev } from '@/utils/dev';
import { parseSRGBBoolean } from './utils/srgb';

if (import.meta.env.DEV) setupDev();

// Constants
const RANDOM_PREST_NAME = '# Random';

// Variables
const { Preset } = window;
let lastPreset: string = Preset !== RANDOM_PREST_NAME ? Preset : getRandomPresetName();
let randomInterval: number | null = null;

// Setup
const audioContext = new AudioContext({ sampleRate: 22050 });
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: 320,
  height: 200,
});

const dummySource = audioContext.createGain();
visualizer.connectAudio(dummySource);

const analyser = createSignalRGBAnalyser(audioContext);
visualizer.audio.analyser = analyser;
installSignalRGBSilenceGuard(visualizer);

// Methods
const loadPreset = (preset: string, force?: boolean) => {
  if (!force && lastPreset && lastPreset === preset) return;
  lastPreset = preset;

  const { BlendSeconds, ShowPresetTitle } = window;
  const presetName = preset ?? getRandomPresetName();
  visualizer.loadPreset(getPresetByName(presetName), BlendSeconds);

  const fullName = getFullPresetName(preset);
  if (parseSRGBBoolean(ShowPresetTitle)) visualizer.launchSongTitleAnim(fullName);
  console.info('Preset changed:', fullName);
};

const loadRandomPreset = () => loadPreset(getRandomPresetName());

const setupRandomInterval = () => {
  if (randomInterval) return;

  const { RandomSeconds } = window;
  randomInterval = setInterval(() => loadRandomPreset(), 1000 * RandomSeconds);
};

const cleanupRandomInterval = () => {
  if (!randomInterval) return;
  clearInterval(randomInterval);
  randomInterval = null;
};

// Change handlers
window.onPresetChanged = () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow -- re-read latest value from window; same identifier intentional
  const { Preset } = window;
  const preset = Preset !== RANDOM_PREST_NAME ? Preset : null;

  if (!preset) {
    setupRandomInterval();
  } else {
    cleanupRandomInterval();
    loadPreset(preset);
  }
};

window.onRandomSecondsChanged = () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow -- re-read latest value from window; same identifier intentional
  const { Preset } = window;
  if (Preset !== RANDOM_PREST_NAME) return;

  cleanupRandomInterval();
  setupRandomInterval();
};

window.onBlendSecondsChanged = () => {
  if (!lastPreset) return;
  loadPreset(lastPreset, true);
};

// Load initial preset
loadPreset(lastPreset);

// Update loop
const renderFrame = () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow -- re-read latest values from window each frame; same identifiers intentional
  const { Preset, PauseMode, HueShift, Saturation, Contrast, RGBMode, RGBModeSpeed } = window;

  canvas.classList.toggle('rgb-mode', parseSRGBBoolean(RGBMode));
  canvas.style.animationDuration = `${5.5 - (RGBModeSpeed / 10) * 5}s`;

  canvas.style.setProperty('--hue-shift', `${HueShift}deg`);
  canvas.style.setProperty('--saturate', `${Saturation + 100}%`);
  canvas.style.setProperty('--contrast', `${Contrast + 100}%`);

  if (engine.audio.level === -100 && PauseMode === 'Pause canvas') return;

  try {
    visualizer.render();
  } catch (error) {
    console.error(error);
    if (Preset === RANDOM_PREST_NAME) loadRandomPreset();
  }
};

const update = () => {
  renderFrame();
  window.requestAnimationFrame(update);
};
update();

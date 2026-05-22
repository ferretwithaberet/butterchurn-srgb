import '@/style.css';

import butterchurn from 'butterchurn';

import { getRandomPresetName, getFullPresetName, getPresetByName } from '@/utils/presets';
import {
  createSignalRGBAnalyser,
  installSignalRGBSilenceGuard,
  isSilent,
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
const wrapper = document.getElementById('wrapper') as HTMLDivElement;
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
const loadPreset = async (preset: string, force?: boolean) => {
  if (!force && lastPreset && lastPreset === preset) return;
  lastPreset = preset;

  const { BlendSeconds, ShowPresetTitle } = window;
  visualizer.loadPreset(await getPresetByName(preset), BlendSeconds);

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
  const {
    // eslint-disable-next-line @typescript-eslint/no-shadow -- re-read latest values from window each frame; same identifiers intentional
    Preset,
    PauseMode,
    HueShift,
    Saturation,
    Contrast,
    RGBModeEnabled,
    RGBModeSpeed,
    BlendMode,
    BlendColor,
  } = window;

  // RGB mode
  wrapper.classList.toggle('rgb-mode', parseSRGBBoolean(RGBModeEnabled));
  wrapper.style.animationDuration = `${5.5 - (RGBModeSpeed / 10) * 5}s`;

  // Color blending
  // TODO: Support blending using image mask
  const blendModeEnabled = BlendMode !== 'None';
  wrapper.classList.toggle('enable-blend-mode', blendModeEnabled);
  wrapper.style.setProperty('--blend-mode', blendModeEnabled ? BlendMode : 'unset');
  wrapper.style.setProperty('--blend-color', BlendColor);

  // Filters
  wrapper.style.setProperty('--hue-shift', `${HueShift}deg`);
  wrapper.style.setProperty('--saturate', `${Saturation + 100}%`);
  wrapper.style.setProperty('--contrast', `${Contrast + 100}%`);

  if (isSilent() && PauseMode === 'Pause canvas') return;

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

import '@/style.css';

import butterchurn from 'butterchurn';

import {
  getRandomPresetName,
  getFullPresetName,
  getPresetByName,
  resolvePresets,
  getNextPreset,
} from '@/utils/presets';
import {
  createSignalRGBAnalyser,
  installSignalRGBSilenceGuard,
  isSilent,
} from '@/utils/createSignalRGBAnalyser';
import { setupDev } from '@/utils/dev';
import { parseSRGBBoolean } from '@/utils/srgb';
import { ALL_VALUE, NONE_VALUE } from '@/utils/constants';

if (import.meta.env.DEV) setupDev();

// Variables
const presets = resolvePresets();
let lastPreset: string = presets[0] ?? getRandomPresetName();
let modeInterval: number | null = null;

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

type LoadPresetOptions = {
  force?: boolean;
  overrideBlendSeconds?: number;
};

// Methods
const loadPreset = async (preset: string, options: LoadPresetOptions = {}) => {
  const { force, overrideBlendSeconds } = options;

  if (!force && lastPreset && lastPreset === preset) return;
  lastPreset = preset;

  const { BlendSeconds, ShowPresetTitle } = window;
  visualizer.loadPreset(await getPresetByName(preset), overrideBlendSeconds ?? BlendSeconds);
  console.info('Preset changed:', preset);

  const fullName = getFullPresetName(preset);
  if (fullName && parseSRGBBoolean(ShowPresetTitle)) visualizer.launchSongTitleAnim(fullName);
};

const loadNextPreset = () => {
  const preset = getNextPreset(lastPreset);
  if (!preset) return;
  loadPreset(preset);
};

const setupModeInterval = () => {
  if (modeInterval) return;

  const { ModeSeconds } = window;
  modeInterval = setInterval(() => loadNextPreset(), 1000 * ModeSeconds);
};

const cleanupModeInterval = () => {
  if (!modeInterval) return;
  clearInterval(modeInterval);
  modeInterval = null;
};

// Change handlers
const handlePresetCountChange = () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow -- re-read latest value from window; same identifier intentional
  const presets = resolvePresets();

  if (presets.length >= 2) {
    setupModeInterval();
  } else {
    const preset = presets[0];
    cleanupModeInterval();
    if (preset) loadPreset(preset);
  }
};

window.onPresetChanged = handlePresetCountChange;
window.onPresetRangesChanged = handlePresetCountChange;
window.onExtraPresetsChanged = handlePresetCountChange;

window.onModeSecondsChanged = () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow -- re-read latest value from window; same identifier intentional
  const presets = resolvePresets();
  if (presets.length < 2) return;

  cleanupModeInterval();
  setupModeInterval();
};

window.onBlendSecondsChanged = () => {
  if (!lastPreset) return;
  loadPreset(lastPreset, { force: true });
};

// Load initial preset
loadPreset(lastPreset, {
  force: true,
  overrideBlendSeconds: 0,
});

// Update loop
const renderFrame = () => {
  const {
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
  const blendModeEnabled = BlendMode !== NONE_VALUE;
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
    if (Preset === ALL_VALUE) loadNextPreset();
  }
};

const update = () => {
  renderFrame();
  window.requestAnimationFrame(update);
};
update();

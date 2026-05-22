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
const blendColor = document.getElementById('blend-color') as HTMLDivElement;
const blendImage = document.getElementById('blend-image') as HTMLImageElement;

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

window.onBlendImageChanged = () => {
  const { BlendImage } = window;

  if (BlendImage) blendImage.src = BlendImage;
  else blendImage.removeAttribute('src');
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
    BlendColorMode,
    BlendColor,
    BlendImageMode,
  } = window;

  // RGB mode
  wrapper.classList.toggle('rgb-mode', parseSRGBBoolean(RGBModeEnabled));
  wrapper.style.animationDuration = `${5.5 - (RGBModeSpeed / 10) * 5}s`;

  // Color blending
  const colorBlendModeEnabled = BlendColorMode !== NONE_VALUE;
  wrapper.classList.toggle('enable-blend-mode', colorBlendModeEnabled);
  blendColor.style.setProperty('--blend-mode', colorBlendModeEnabled ? BlendColorMode : 'unset');
  blendColor.style.setProperty('--blend-color', BlendColor);

  // Image blending
  const imageBlendModeEnabled = BlendImageMode !== NONE_VALUE;
  wrapper.classList.toggle('enable-image-blend-mode', imageBlendModeEnabled);
  blendImage.style.setProperty('--blend-mode', imageBlendModeEnabled ? BlendImageMode : 'unset');

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

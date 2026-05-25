import setupDev from '@/dev';
import '@/style.css';
import { ALL_VALUE, NONE_VALUE } from '@/utils/constants';
import {
  createSignalRGBAnalyser,
  installSignalRGBSilenceGuard,
  isSilent,
} from '@/utils/createSignalRGBAnalyser';
import { getFullPresetName, getPresetByName, resolvePresets, getNextPreset } from '@/utils/presets';
import { parseSRGBBoolean } from '@/utils/srgb';
import butterchurn from 'butterchurn';

if (import.meta.env.DEV) setupDev();

// Variables
let lastPreset: string = getNextPreset(null);
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
  const presets = resolvePresets();
  if (presets.length < 2) return;

  cleanupModeInterval();
  setupModeInterval();
};

window.onBlendSecondsChanged = () => {
  if (!lastPreset) return;
  loadPreset(lastPreset, { force: true });
};

// RGB Mode
window.onRGBModeEnabledChanged = () => {
  const { RGBModeEnabled } = window;
  wrapper.classList.toggle('rgb-mode', parseSRGBBoolean(RGBModeEnabled));
};

window.onRGBModeSpeedChanged = () => {
  const { RGBModeSpeed } = window;
  wrapper.style.animationDuration = `${5.5 - (RGBModeSpeed / 10) * 5}s`;
};

// Color blend
window.onBlendColorModeChanged = () => {
  const { BlendColorMode } = window;
  const colorBlendModeEnabled = BlendColorMode !== NONE_VALUE;
  wrapper.classList.toggle('enable-blend-mode', colorBlendModeEnabled);
  blendColor.style.setProperty('--blend-mode', colorBlendModeEnabled ? BlendColorMode : 'unset');
};

window.onBlendColorChanged = () => {
  const { BlendColor } = window;
  blendColor.style.setProperty('--blend-color', BlendColor);
};

// Image blending
window.onBlendImageModeChanged = () => {
  const { BlendImageMode } = window;
  const imageBlendModeEnabled = BlendImageMode !== NONE_VALUE;
  wrapper.classList.toggle('enable-image-blend-mode', imageBlendModeEnabled);
  blendImage.style.setProperty('--blend-mode', imageBlendModeEnabled ? BlendImageMode : 'unset');
};

window.onBlendImageChanged = () => {
  const { BlendImage } = window;

  if (BlendImage) blendImage.src = BlendImage;
  else blendImage.removeAttribute('src');
};

// Filters
window.onHueShiftChanged = () => {
  const { HueShift } = window;
  wrapper.style.setProperty('--hue-shift', `${HueShift}deg`);
};

window.onSaturationChanged = () => {
  const { Saturation } = window;
  wrapper.style.setProperty('--saturate', `${Saturation + 100}%`);
};

window.onContrastChanged = () => {
  const { Contrast } = window;
  wrapper.style.setProperty('--contrast', `${Contrast + 100}%`);
};

// Window events API
window.addEventListener('nextpreset', loadNextPreset);

// Load initial preset
loadPreset(lastPreset, {
  force: true,
  overrideBlendSeconds: 0,
});

// Update loop
const renderFrame = () => {
  const { Preset, PauseMode } = window;

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

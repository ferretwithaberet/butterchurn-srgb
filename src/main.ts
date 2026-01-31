import "@/style.css";

import butterchurn from "butterchurn";

import {
  getRandomPresetName,
  getFullPresetName,
  getPresetByName,
} from "@/utils/presets";
import { createSignalRGBAnalyser } from "@/utils/createSignalRGBAnalyser";

// Constants
const RANDOM_PREST_NAME = "# Random";

// Variables
const { Preset } = window;
let lastPreset: string =
  Preset !== RANDOM_PREST_NAME ? Preset : getRandomPresetName();
let randomInterval: number | null = null;

// Setup
const audioContext = new AudioContext();
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: 320,
  height: 200,
});

const dummySource = audioContext.createGain();
visualizer.connectAudio(dummySource);
visualizer.audio.analyser = createSignalRGBAnalyser(audioContext) as any;

// Methods
const loadPreset = (preset: string, force?: boolean) => {
  if (!force && lastPreset && lastPreset === preset) return;
  lastPreset = preset;

  const { BlendSeconds } = window;
  const presetName = preset ?? getRandomPresetName();
  visualizer.loadPreset(getPresetByName(presetName), BlendSeconds);

  console.log("Preset changed:", getFullPresetName(preset));
};

const setupRandomInterval = () => {
  if (randomInterval) return;

  const { RandomSeconds } = window;
  randomInterval = setInterval(() => {
    loadPreset(getRandomPresetName());
  }, 1000 * RandomSeconds);
};

const cleanupRandomInterval = () => {
  if (!randomInterval) return;
  clearInterval(randomInterval);
  randomInterval = null;
};

// Change handlers
window.onPresetChanged = () => {
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
  const { PauseMode } = window;
  if (engine.audio.level === -100 && PauseMode === "Pause canvas") return;

  try {
    visualizer.render();
  } catch (error) {
    console.error(error);
  }
};

const update = () => {
  renderFrame();
  window.requestAnimationFrame(update);
};
update();

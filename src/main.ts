import "@/style.css";

import butterchurn from "butterchurn";
import butterchurnPresets from "butterchurn-presets";

import presetsMap from "@/presetsMap.json" with { type: "json" };
import { trackMetaProperty } from "@/utils/meta";
import { getRandomPresetName } from "@/utils/presets";
import { createSignalRGBAnalyser } from "@/utils/createSignalRGBAnalyser";

// Variables
let lastPreset: string | null = null;
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

  const { blendSeconds } = window;
  const presetName = preset ?? getRandomPresetName();
  visualizer.loadPreset(butterchurnPresets.default[presetName], blendSeconds);

  console.log("Preset changed:", preset);
};

const setupRandomInterval = () => {
  if (randomInterval) return;

  const { randomSeconds } = window;
  randomInterval = setInterval(() => {
    loadPreset(getRandomPresetName());
  }, 1000 * randomSeconds);
};

const cleanupRandomInterval = () => {
  if (!randomInterval) return;
  clearInterval(randomInterval);
  randomInterval = null;
};

// Change handlers
const RANDOM_VALUE = "# Random";
const handlePresetChange = (value: string) => {
  const preset = value !== RANDOM_VALUE ? value : null;

  if (!preset) {
    setupRandomInterval();
  } else {
    const presetName = (presetsMap as any)[preset];
    cleanupRandomInterval();
    loadPreset(presetName);
  }
};

const handleRandomSecondsChange = () => {
  cleanupRandomInterval();
  setupRandomInterval();
};

const handleBlendSecondsChange = () => {
  if (!lastPreset) return;
  loadPreset(lastPreset, true);
};

// Update loop
const update = () => {
  trackMetaProperty("preset", handlePresetChange);
  trackMetaProperty("randomSeconds", handleRandomSecondsChange);
  trackMetaProperty("blendSeconds", handleBlendSecondsChange);

  try {
    if (engine.audio.level !== -100) visualizer.render();
  } catch (error) {
    console.error(error);
  }

  window.requestAnimationFrame(update);
};
update();

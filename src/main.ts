import butterchurn from "butterchurn";
import butterchurnPresets from "butterchurn-presets";

import "./style.css";
import { createAnalyserFromSignalRGB } from "./createAnalyserFromSignalRGB";

const audioContext = new AudioContext();
const canvas = document.getElementById("canvas");

const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: 320,
  height: 200,
});

const presets = butterchurnPresets.default;
const preset =
  presets["Flexi, martin + geiss - dedicated to the sherwin maxawow"];
visualizer.loadPreset(preset, 0.0);

const analyser = createAnalyserFromSignalRGB(audioContext);
visualizer.connectAudio(analyser);

const update = () => {
  visualizer.render();
};

if (import.meta.env.DEV) {
  setInterval(update, 1000 / 60);
}

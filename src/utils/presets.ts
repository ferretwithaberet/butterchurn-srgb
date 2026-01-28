import butterchurnPresets from "butterchurn-presets";

export const getRandomPresetName = () => {
  const presets = butterchurnPresets.default;
  const presetNames = Object.keys(presets);
  const randomIndex = Math.floor(Math.random() * presetNames.length);

  return presetNames[randomIndex];
};

import presetsMap from '@/presetsMap.json' with { type: 'json' };
import presets from '@/presets';

export const getRandomPresetName = () => {
  const presetNames = Object.keys(presetsMap);
  const randomIndex = Math.floor(Math.random() * presetNames.length);

  return presetNames[randomIndex];
};

export const getFullPresetName = (name: string) => (presetsMap as any)[name] as string;

export const getPresetByName = (name: string) => {
  const fullPresetName = getFullPresetName(name);
  return presets.default[fullPresetName];
};

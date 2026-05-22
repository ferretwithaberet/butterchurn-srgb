import presetsMap from '@/presetsMap.json' with { type: 'json' };

const BASE_PRESET_URL =
  'https://raw.githubusercontent.com/jberg/butterchurn-presets/refs/heads/master/presets/converted/';

export const getRandomPresetName = () => {
  const presetNames = Object.keys(presetsMap);
  const randomIndex = Math.floor(Math.random() * presetNames.length);

  return presetNames[randomIndex];
};

export const getFullPresetName = (name: string) => (presetsMap as any)[name] as string;

export const getPresetByName = (name: string) => {
  const fullPresetName = getFullPresetName(name);

  const url = new URL(BASE_PRESET_URL);
  url.pathname += `${encodeURIComponent(fullPresetName)}.json`;

  return fetch(url.toString(), { cache: 'force-cache' }).then((res) => res.json());
};

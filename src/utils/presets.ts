import presetsMap from '@/presetsMap.json' with { type: 'json' };
import { ALL_VALUE, NONE_VALUE, RANGES_VALUE } from '@/utils/constants';
import { resolveRanges } from '@/utils/array';

const ALL_PRESETS = Object.keys(presetsMap);
const BASE_PRESET_URL =
  'https://raw.githubusercontent.com/jberg/butterchurn-presets/refs/heads/master/presets/converted/';

export const resolvePresets = () => {
  const { Preset, PresetRanges, ExtraPresets } = window;

  let presets: string[] = [];
  if (Preset !== NONE_VALUE) {
    if (Preset === ALL_VALUE) presets = [...presets, ...ALL_PRESETS];
    else if (Preset === RANGES_VALUE)
      presets = [...presets, ...resolveRanges(ALL_PRESETS, PresetRanges)];
    else presets = [...presets, Preset];
  }

  const extraPresets = ExtraPresets.split('||')
    .filter(Boolean)
    .map((extraPreset) => extraPreset.trim());
  return [...presets, ...extraPresets];
};

export const getRandomPresetName = () => {
  const randomIndex = Math.floor(Math.random() * ALL_PRESETS.length);

  return ALL_PRESETS[randomIndex];
};

export const getFullPresetName = (name: string) => (presetsMap as any)[name] as string;

export const getPresetByName = (name: string) => {
  let fetchUrl: string;

  if (/^https?:\/\//.test(name)) {
    fetchUrl = name;
  } else {
    const fullPresetName = getFullPresetName(name);
    const url = new URL(BASE_PRESET_URL);
    url.pathname += `${encodeURIComponent(fullPresetName)}.json`;
    fetchUrl = url.toString();
  }
  return fetch(fetchUrl, { cache: 'force-cache' }).then((res) => res.json());
};

export const getNextPreset = (lastPreset: string) => {
  const { Mode } = window;
  const presets = resolvePresets();

  if (Mode === 'Cycle') {
    const lastIndex = presets.indexOf(lastPreset);
    return presets[(lastIndex + 1) % presets.length];
  }

  const randomIndex = Math.floor(Math.random() * presets.length);
  return presets[randomIndex];
};

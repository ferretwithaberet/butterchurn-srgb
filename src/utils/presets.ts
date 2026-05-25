import presetsMap from '@/presetsMap.json' with { type: 'json' };
import { RANGES_REGEX, resolveRanges } from '@/utils/array';
import { ALL_VALUE, NONE_VALUE, RANGES_VALUE } from '@/utils/constants';

const ALL_PRESETS = Object.keys(presetsMap);
const BASE_PRESET_URL =
  'https://raw.githubusercontent.com/jberg/butterchurn-presets/refs/heads/master/presets/converted/';

export const resolvePresets = () => {
  const { Preset, PresetRanges, ExtraPresets } = window;

  let presets: string[] = [...ALL_PRESETS];
  if (Preset === NONE_VALUE) presets = [];
  else if (Preset === RANGES_VALUE && RANGES_REGEX.test(PresetRanges))
    presets = resolveRanges(ALL_PRESETS, PresetRanges);
  else if (Preset !== ALL_VALUE && !Preset.startsWith('#')) presets = [Preset];

  const extraPresets = ExtraPresets.split('||')
    .filter(Boolean)
    .map((extraPreset) => extraPreset.trim());
  return [...presets, ...extraPresets];
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

export const getNextPreset = (lastPreset: string | null) => {
  const { Mode } = window;
  const presets = resolvePresets();
  if (presets.length === 0) return undefined;

  if (Mode === 'Cycle') {
    const lastIndex = lastPreset ? presets.indexOf(lastPreset) : -1;
    const nextIndex = lastIndex + 1;
    if (nextIndex >= presets.length) return presets[0];
    return presets[nextIndex];
  }

  const randomIndex = Math.floor(Math.random() * presets.length);
  return presets[randomIndex];
};

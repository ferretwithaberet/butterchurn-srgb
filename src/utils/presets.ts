import presetsMap from '@/presetsMap.json' with { type: 'json' };
import { RANGES_REGEX, resolveRanges } from '@/utils/array';
import { ALL_VALUE, NONE_VALUE, RECOMMENDED_VALUE } from '@/utils/constants';

const ALL_PRESETS = Object.keys(presetsMap);
const RECOMMENDED_RANGES =
  '3-4,9,11,17-20,43,50,53-54,60,64-67,112-113,117,122,149-150,185,189,197-198,225,275,283,289,300,372,374,390,450,459,463';
const BASE_PRESET_URL =
  'https://raw.githubusercontent.com/jberg/butterchurn-presets/refs/heads/master/presets/converted/';

export const resolvePresets = () => {
  const { Preset, PresetRanges, ExtraPresets } = window;

  let presets: string[] = [...ALL_PRESETS];
  if (Preset === NONE_VALUE) presets = [];
  else if (RANGES_REGEX.test(PresetRanges)) presets = resolveRanges(ALL_PRESETS, PresetRanges);
  else if (Preset === RECOMMENDED_VALUE) presets = resolveRanges(ALL_PRESETS, RECOMMENDED_RANGES);
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

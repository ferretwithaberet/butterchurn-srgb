import fs from 'fs';

const allPresetFiles = await fs.promises.readdir(
  './node_modules/butterchurn-presets/presets/converted',
);
const presets = allPresetFiles.map((preset) => preset.replace(/.json$/, ''));

const sanitizeSRGBOption = (str: string) =>
  str.replace(/,/g, ' + ').replace(/&/g, 'and').replace(/\$/g, 'S').replace(/\s+/g, ' ').trim();

const DIGITS_COUNT = presets.length.toString().length;
const cleanedPresets = presets.reduce<Record<string, string>>((acc, preset, index) => {
  const position = index + 1;
  acc[`${position.toString().padStart(DIGITS_COUNT, '0')}. ${sanitizeSRGBOption(preset)}`] = preset;
  return acc;
}, {});

await fs.promises.writeFile('./src/presetsMap.json', JSON.stringify(cleanedPresets));
console.info('Generated map file!');

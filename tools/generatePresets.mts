import fs from 'fs';

const allPresetFiles = await fs.promises.readdir(
  './node_modules/butterchurn-presets/presets/converted',
);
const allPresets = allPresetFiles.map((preset) => preset.replace(/.json$/, ''));
const presets = allPresets.filter((preset) => !preset.includes('#'));

const sanitizeSRGBOption = (str: string) =>
  str.replace(/,/g, '٬').replace(/&/g, '＆').replace(/\$/g, '＄').replace(/\s+/g, ' ').trim();

const DIGITS_COUNT = presets.length.toString().length;
const cleanedPresets = presets.reduce<Record<string, string>>((acc, preset, index) => {
  const position = index + 1;
  acc[`${position.toString().padStart(DIGITS_COUNT, '0')}. ${sanitizeSRGBOption(preset)}`] = preset;
  return acc;
}, {});

// Presets JSON map
const mapPromise = fs.promises.writeFile('./src/presetsMap.json', JSON.stringify(cleanedPresets));

// HTML File
const options = ['# All', '# Ranges', '# None', ...Object.keys(cleanedPresets)].join(',');
const html = await fs.promises.readFile('./butterchurn-srgb.html', {
  encoding: 'utf8',
});
const htmlPromise = fs.promises.writeFile(
  './butterchurn-srgb.html',
  html.replace(/values="# All,.*?"/, `values="${options}"`),
);

await Promise.all([mapPromise, htmlPromise]);

console.info('Generated map file and updated html entry!');

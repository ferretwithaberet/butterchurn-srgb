import fs from 'fs';

// Commented presets are disabled, they either do not react to sound or they do not fit the scope of this project
const IGNORED_PRESETS = [
  '_Geiss - Desert Rose 2',
  '_Mig_049',
  '_Rovastar + Geiss - Hurricane Nightmare (Posterize Mix)',
  'AdamFx 2 Geiss, Zylot and Flexi - Reaction Diffusion 3 (Overload Mix 2) EATIT4 hypno',
  'Aderrasi + Geiss - Airhandler (Kali Mix) - Canvas Mix',
  'cope + martin - mother-of-pearl',
  'Eo.S. + Zylot - skylight (Stained Glass Majesty mix)',
  'Flexi - alien fish pond',
  'Flexi - area 51',
  'flexi - bouncing balls [double mindblob neon mix]',
  'Flexi - infused with the spiral',
  'Flexi - mindblob [shiny mix]',
  'Flexi - mindblob mix',
  'flexi - mom, why the sky looks different today',
  'flexi - patternton, district of media, capitol of the united abstractions of fractopia',
  'Flexi - predator-prey-spirals',
  'Flexi - smashing fractals [acid etching mix]',
  'flexi - swing out on the spiral',
  'Flexi - truly soft piece of software - this is generic texturing (Jelly) ',
  'flexi - what is the matrix',
  'flexi + amandio c - organic [random mashup]',
  'flexi + amandio c - organic12-3d-2',
  'Flexi + amandio c - piercing 05 - Kopie (2) - Kopie',
  'flexi + fishbrain - neon mindblob grafitti',
  'flexi + geiss - pogo cubes vs. tokamak vs. game of life [stahls jelly 4.5 finish]',
  'Flexi + Martin - astral projection',
  'Flexi + Martin - cascading decay swing',
  'Flexi + stahlregen - jelly showoff parade',
  'Fumbling_Foo + En D & Martin - Mandelverse',
  'Geiss - Cauldron - painterly 2 (saturation remix)',
  'Geiss + Flexi + Martin - disconnected',
  'Halfbreak - Light of Breakers',
  'high-altitude basket unraveling - singh grooves nitrogen argon nz+',
  'martin - castle in the air',
  'martin - chain breaker',
  'martin - glass corridor',
  'Martin - liquid arrows',
  'martin - mandelbox explorer - high speed demo version',
  'MilkDrop2077.R002',
  'Phat+fiShbRaiN+Eo.S_Mandala_Chasers_remix',
  'shifter - dark tides bdrv mix 2',
  'shifter - liquid circuitry - conjugoth',
  'suksma - Hexcollie - Julian Carnival - shimmy dumb grid',
  'yin - 191 - Temporal singularities',
];

const allPresetFiles = await fs.promises.readdir(
  './node_modules/butterchurn-presets/presets/converted',
);
const allPresets = allPresetFiles.map((preset) => preset.replace(/.json$/, ''));
const presets = allPresets.filter(
  (preset) => !IGNORED_PRESETS.includes(preset) && !preset.includes('#'),
);

const sanitizeSRGBOption = (str: string) =>
  str.replace(/,/g, '٬').replace(/&/g, '＆').replace(/\$/g, '＄').replace(/\s+/g, ' ').trim();

const cleanedPresets = presets.reduce<Record<string, string>>((acc, preset) => {
  acc[sanitizeSRGBOption(preset)] = preset;
  return acc;
}, {});

// Presets TS file
let tsFileContent = presets.reduce(
  (result, preset, index) =>
    `${result}import preset${index} from 'butterchurn-presets/presets/converted/${preset.replace(/'/g, String.raw`\'`)}.json';\n`,
  '',
);
tsFileContent += '\nconst presets = {\n';
tsFileContent = presets.reduce(
  (result, preset, index) =>
    `${result}  '${preset.replace(/'/g, String.raw`\'`)}': preset${index},\n`,
  tsFileContent,
);
tsFileContent += '} as const;\n';
tsFileContent += `\nexport default presets;\n`;
const tsFilePromise = fs.promises.writeFile('./src/presets.ts', tsFileContent);

// Presets JSON map
const mapPromise = fs.promises.writeFile('./src/presetsMap.json', JSON.stringify(cleanedPresets));

// HTML File
const options = ['# Random', ...Object.keys(cleanedPresets)].join(',');
const html = await fs.promises.readFile('./butterchurn-srgb.html', {
  encoding: 'utf8',
});
const htmlPromise = fs.promises.writeFile(
  './butterchurn-srgb.html',
  html.replace(/values="# Random,.*?"/, `values="${options}"`),
);

await Promise.all([tsFilePromise, mapPromise, htmlPromise]);

console.info('Generated map file and updated html entry!');

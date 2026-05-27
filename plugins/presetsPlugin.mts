import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

const PRESETS_PLACEHOLDER = '{{INSERT_PRESETS}}';
const presetsPlugin = (): Plugin => ({
  name: 'inject-presets',
  transformIndexHtml(html) {
    const presets = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), './src/presetsMap.json'), 'utf8'),
    ) as Record<string, string>;
    const values = Object.keys(presets).join(',');
    return html.replaceAll(PRESETS_PLACEHOLDER, values);
  },
});

export default presetsPlugin;

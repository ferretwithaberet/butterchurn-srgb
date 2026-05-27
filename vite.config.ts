import devLinkPlugin from './plugins/devLinkPlugin.mts';
import presetsPlugin from './plugins/presetsPlugin.mts';
import inline from '@zhoumutou/vite-plugin-inline';
import path from 'path';
import type { UserConfig } from 'vite';

export default {
  plugins: [presetsPlugin(), inline(), devLinkPlugin()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      input: './butterchurn-srgb.html',
    },
  },
} satisfies UserConfig;

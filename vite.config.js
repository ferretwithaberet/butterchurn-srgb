import inline from '@zhoumutou/vite-plugin-inline';
import path from 'path';
import { defineConfig } from 'vite';

const ENTRY_HTML = 'butterchurn-srgb.html';

/** @returns {import('vite').Plugin} */
const appendEntryToPrintedUrls = () => ({
  name: 'append-entry-to-printed-urls',
  configureServer(server) {
    const originalPrintUrls = server.printUrls.bind(server);
    // eslint-disable-next-line no-param-reassign
    server.printUrls = () => {
      const urls = server.resolvedUrls;
      if (urls) {
        /** @param {string} u */
        const append = (u) => u.replace(/\/?$/, '/') + ENTRY_HTML;
        urls.local = urls.local.map(append);
        urls.network = urls.network.map(append);
      }
      originalPrintUrls();
    };
  },
});

export default defineConfig({
  plugins: [inline(), appendEntryToPrintedUrls()],

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
});

import type { Plugin } from 'vite';

const ENTRY_HTML = 'butterchurn-srgb.html';
const devLinkPlugin = (): Plugin => ({
  name: 'dev-link-plugin',
  configureServer(server) {
    const originalPrintUrls = server.printUrls.bind(server);
    // eslint-disable-next-line no-param-reassign
    server.printUrls = () => {
      const urls = server.resolvedUrls;
      if (urls) {
        const append = (u: string) => u.replace(/\/?$/, '/') + ENTRY_HTML;
        urls.local = urls.local.map(append);
        urls.network = urls.network.map(append);
      }
      originalPrintUrls();
    };
  },
});

export default devLinkPlugin;

import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    server: {
      allowedHosts: ['4321-i83ah5zqsjcy9uxzkehsq-bdd9aba5.us4.manus.computer'],
    },
  },
});

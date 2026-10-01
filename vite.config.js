import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['5173-i83ah5zqsjcy9uxzkehsq-bdd9aba5.us4.manus.computer'],
  },
});

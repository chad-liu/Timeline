import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { timelinesPlugin } from './vite-plugin-timelines';

export default defineConfig({
  base: './',
  plugins: [react(), timelinesPlugin(fileURLToPath(new URL('./Data', import.meta.url)), 'https://chad-liu.github.io/Timeline/')],
});

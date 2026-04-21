// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000
//   }
// })
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  preview: {
    port: 3000,
    strictPort: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    origin: 'http://0.0.0.0:3000',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

// base: Base public path when served in development or production.
// plugins: Array of plugins to use.
// preview: An object for the Build preview options
// server: An object for the Server options
// port: Specify server port. Note if the port is already being used, Vite will automatically try the next available port so this may not be the actual port the server ends up listening on.
// strictPort: Set to true to exit if the port is already in use, instead of automatically trying the next available port.
// host: Specify which IP addresses the server should listen on. Set this to 0.0.0.0 or true to listen to all addresses, including LAN and public addresses.
// origin: Defines the origin of the generated asset URLs during development.

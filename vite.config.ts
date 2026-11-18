import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { appConfigPlugin } from './config/appConfigPlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), appConfigPlugin()],
})

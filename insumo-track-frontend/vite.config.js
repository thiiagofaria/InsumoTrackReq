import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",  // Certifique-se de usar "/api/auth/login" no front
    },
  },
});


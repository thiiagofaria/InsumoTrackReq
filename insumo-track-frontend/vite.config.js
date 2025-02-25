import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      "/api": "${API_URL}",  // Certifique-se de usar "/api/auth/login" no front
    },
  },
});


import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        therapy: resolve(__dirname, 'therapy.html'),
        company: resolve(__dirname, 'company.html'),
        contact: resolve(__dirname, 'contact.html'),
      }
    }
  }
})
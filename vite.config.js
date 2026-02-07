import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// jsPDF optionally imports canvg, html2canvas, and dompurify for features
// we don't use (SVG-to-PDF, HTML-to-PDF, sanitization). Stub them out.
const stubJspdfOptionalDeps = () => ({
  name: 'stub-jspdf-optional-deps',
  resolveId(id) {
    if (['canvg', 'html2canvas', 'dompurify'].includes(id)) {
      return `\0stub:${id}`
    }
  },
  load(id) {
    if (id.startsWith('\0stub:')) {
      return 'export default null;'
    }
  }
})

export default defineConfig({
  plugins: [react(), tailwindcss(), stubJspdfOptionalDeps()],
  optimizeDeps: {
    esbuildOptions: {
      external: ['canvg', 'html2canvas', 'dompurify']
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api/send-email': {
        target: 'https://api.resend.com',
        changeOrigin: true,
        rewrite: () => '/emails'
      }
    }
  }
})

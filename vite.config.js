import { defineConfig, loadEnv } from 'vite'
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

// Dev middleware to handle /api/send-email by calling Resend directly
const resendEmailPlugin = (resendApiKey) => ({
  name: 'resend-email-handler',
  configureServer(server) {
    server.middlewares.use('/api/send-email', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      // Parse request body
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const body = JSON.parse(Buffer.concat(chunks).toString())

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: body.from || 'LinkedIn EP Agent <onboarding@resend.dev>',
            to: Array.isArray(body.to) ? body.to : [body.to],
            subject: body.subject,
            text: body.text
          })
        })

        const data = await response.json()
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = response.ok ? 200 : response.status
        res.end(JSON.stringify(data))
      } catch (err) {
        console.error('Resend API error:', err)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Failed to send email' }))
      }
    })
  }
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      stubJspdfOptionalDeps(),
      resendEmailPlugin(env.RESEND_API_KEY)
    ],
    test: {
      environment: 'node',
    },
    optimizeDeps: {
      esbuildOptions: {
        external: ['canvg', 'html2canvas', 'dompurify']
      }
    },
    server: {
      port: 5174,
    }
  }
})

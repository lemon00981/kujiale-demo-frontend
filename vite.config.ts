import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 修复 http-proxy 对「快速完成的 SSE 响应」丢 body 的问题：
        // 收到上游响应头就立即 flush 给下游，避免流式 body 被缓冲/丢失
        configure(proxy) {
          proxy.on('proxyRes', (proxyRes, _req, res) => {
            if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
              res.flushHeaders()
            }
          })
        },
      },
    },
  },
})

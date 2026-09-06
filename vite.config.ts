import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API 代理：前端用相对路径 /api，由 Vite 转发给网关 8080
const apiProxy = {
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
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // 0.0.0.0，允许公网访问
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    host: true, // 0.0.0.0，允许公网访问
    proxy: apiProxy,
  },
})

import axios from 'axios'

export const http = axios.create({
  baseURL: '/api',
  timeout: 120000, // agent 多步调用 DeepSeek 较慢，给足 2 分钟
})

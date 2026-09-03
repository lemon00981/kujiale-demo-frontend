import type { ChatMsg } from '../types'

/**
 * 用 fetch 流式读取 SSE（POST 不能走 EventSource，这里手动解析）。
 */
export async function streamChat(
  messages: ChatMsg[],
  onDelta: (text: string) => void,
): Promise<void> {
  const res = await fetch('/api/ai/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: null, messages }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`对话请求失败：${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      for (const line of event.split('\n')) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload) continue
        try {
          const obj = JSON.parse(payload)
          if (obj.delta) onDelta(obj.delta)
        } catch {
          // 忽略无法解析的行
        }
      }
    }
  }
}

import type { Advice, DesignPlan, FloorPlanResult } from '../types'
import { http } from './client'

export async function generateDesign(
  description: string,
  area: number,
  style?: string,
): Promise<DesignPlan> {
  const { data } = await http.post('/ai/design/generate', { description, area, style })
  return data
}

export async function recognizeFloorPlan(file: File): Promise<FloorPlanResult> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post('/ai/floorplan/recognize', form)
  return data
}

export async function getAdvice(roomType: string): Promise<Advice> {
  const { data } = await http.get(`/ai/advice/${encodeURIComponent(roomType)}`)
  return data
}

/** agent 流式生成过程中的事件 */
export type DesignStreamEvent =
  | { type: 'step'; step: number }
  | { type: 'tool_call'; name: string; args: string }
  | { type: 'tool_result'; name: string }
  | { type: 'done'; plan: DesignPlan }
  | { type: 'error'; message: string }

/** 流式生成设计方案：实时推送 agent 的每一步（步骤/工具调用/最终方案） */
export async function streamGenerateDesign(
  payload: { description: string; area: number; style?: string },
  onEvent: (event: DesignStreamEvent) => void,
): Promise<void> {
  const res = await fetch('/api/ai/design/generate/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok || !res.body) {
    throw new Error(`生成请求失败：${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    buffer = buffer.replace(/\r\n/g, '\n') // 兼容 sse-starlette 的 \r\n\r\n 分隔符

    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''
    for (const event of events) {
      for (const line of event.split('\n')) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload) continue
        try {
          onEvent(JSON.parse(payload) as DesignStreamEvent)
        } catch {
          // 忽略无法解析的行
        }
      }
    }
  }
}

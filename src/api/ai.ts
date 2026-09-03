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

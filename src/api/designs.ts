import type { Design, DesignMessage, HouseType } from '../types'
import { http } from './client'

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

export async function listHouseTypes(): Promise<HouseType[]> {
  const { data } = await http.get<ApiEnvelope<HouseType[]>>('/house-types')
  return data.data
}

export async function listDesigns(): Promise<Design[]> {
  const { data } = await http.get<ApiEnvelope<Design[]>>('/designs')
  return data.data
}

// 新增方案
export async function saveDesign(payload: {
  userId?: number
  houseTypeId?: number | null
  title: string
  style: string
  prompt: string
  planJson: string
  thumbnail?: string
}): Promise<Design> {
  const { data } = await http.post<ApiEnvelope<Design>>('/designs', {
    userId: payload.userId ?? 1,
    houseTypeId: payload.houseTypeId ?? null,
    ...payload,
  })
  return data.data
}

export async function deleteDesign(id: number): Promise<void> {
  await http.delete(`/designs/${id}`)
}

// 更新方案
export async function updateDesign(
  id: number,
  payload: Partial<Pick<Design, 'title' | 'style' | 'prompt' | 'planJson' | 'thumbnail'>>,
): Promise<Design> {
  const { data } = await http.put<ApiEnvelope<Design>>(`/designs/${id}`, payload)
  return data.data
}

export async function updateHouseType(
  id: number,
  payload: { name?: string; area?: number; layoutJson?: string },
): Promise<HouseType> {
  const { data } = await http.put<ApiEnvelope<HouseType>>(`/house-types/${id}`, payload)
  return data.data
}

export async function deleteHouseType(id: number): Promise<void> {
  await http.delete(`/house-types/${id}`)
}

export async function listDesignMessages(sessionId: string): Promise<DesignMessage[]> {
  const { data } = await http.get<ApiEnvelope<DesignMessage[]>>('/design-messages', {
    params: { sessionId },
  })
  return data.data
}

export async function saveDesignMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  await http.post('/design-messages', { sessionId, role, content })
}

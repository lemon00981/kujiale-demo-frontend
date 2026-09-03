import type { Design, HouseType } from '../types'
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

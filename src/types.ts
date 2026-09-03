export interface Furniture {
  id: string
  name: string
  category: string
  room: string
  x: number
  z: number
  w: number
  d: number
  h: number
  color: string
  /** 离地高度（米），用于挂壁电视/吊灯等，默认 0 */
  y?: number
  /** 绕 Y 轴旋转角（弧度），AI 数据无此字段，渲染时兜底 0 */
  rot?: number
}

export interface Room {
  name: string
  x: number
  z: number
  w: number
  d: number
}

export interface Palette {
  wall: string
  floor: string
  accent: string
  text: string
}

export interface Material {
  area: string
  name: string
  color?: string
  note?: string
}

export interface Lighting {
  type: string
  name: string
  note: string
}

export interface DesignPlan {
  title: string
  style: string
  area: number
  description: string
  room_bounds: { w: number; d: number }
  rooms: Room[]
  furniture: Furniture[]
  palette: Palette
  materials: Material[]
  lighting: Lighting[]
  summary: string
}

export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

export interface FloorPlanResult {
  area: number
  rooms: Room[]
  note: string
}

export interface Advice {
  room_type: string
  lighting: Lighting[]
  materials: Material[]
  tips: string
}

export interface HouseType {
  id: number
  name: string
  area: number
  layoutJson: string
  createdAt: string
}

export interface Design {
  id: number
  userId: number
  houseTypeId: number | null
  title: string
  style: string
  prompt: string
  planJson: string
  thumbnail: string
  status: string
  createdAt: string
}

export type ViewMode = '2d' | '3d'

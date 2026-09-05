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
  name: string   // 房间名，如“客厅”
  x: number      // 左上角 x 坐标（米）
  z: number      // 左上角 z 坐标（米）
  w: number      // 宽度（米）
  d: number      // 深度（米）
}

/** 一段墙：起点 (x1,z1) → 终点 (x2,z2)，绝对坐标（米），水平或垂直 */
export interface Wall {
  x1: number
  z1: number
  x2: number
  z2: number
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
  /** 独立墙段；undefined 表示「未提供、请按房间边界自动推断」，[] 表示「显式无墙（开放式）」 */
  walls?: Wall[]
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

export interface DesignMessage {
  id: number
  sessionId: string
  role: string
  content: string
  createdAt: string
}

export type ViewMode = '2d' | '3d'

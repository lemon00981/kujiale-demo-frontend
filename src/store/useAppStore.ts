import { create } from 'zustand'
import * as aiApi from '../api/ai'
import * as designApi from '../api/designs'
import { streamChat } from '../api/stream'
import { getFurniture } from '../furniture'
import type {
  Advice,
  ChatMsg,
  Design,
  DesignPlan,
  FloorPlanResult,
  Furniture,
  HouseType,
  Room,
  ViewMode,
} from '../types'

/** 会话 ID：持久化到 localStorage，刷新后能恢复同一段对话历史 */
function getSessionId(): string {
  let id = localStorage.getItem('kujiale_session_id')
  if (!id) {
    id = `s${Date.now()}${Math.floor(Math.random() * 1000)}`
    localStorage.setItem('kujiale_session_id', id)
  }
  return id
}

/** 空白画布的默认方案（未命名、无房间、无家具） */
function blankPlan(): DesignPlan {
  return {
    title: '未命名方案',              // 标题
    style: '现代简约',                // 风格
    area: 48,                        // 面积㎡（8×6=48）
    description: '自由设计',          // 描述/AI prompt
    room_bounds: { w: 8, d: 6 },  // 整个画布尺寸：宽8米、深6米（这是“房子”外框）
    // rooms: [],                    // 房间列表——空数组 = 没有任何房间分区
    rooms: [
      // 每个房间只画 右边一面 和 下边一面 墙
      // {name: '客厅', x: 0, z: 0, w: 4, d: 3},
      // {name: '厨房', x: 4, z: 0, w: 2, d: 3},
      // {name: '卫生间', x: 6, z: 0, w: 2, d: 3},
      // {name: '主卧', x: 0, z: 3, w: 2.7, d: 3},
      // {name: '次卧', x: 2.7, z: 3, w: 2.7, d: 3},
      // {name: '书房', x: 5.4, z: 3, w: 2.6, d: 3},


      // {name: '客厅', x: 0, z: 0, w: 4, d: 3},
      {name: '厨房', x: 4, z: 0, w: 2, d: 3},
      // {name: '卫生间', x: 6, z: 0, w: 2, d: 3},
      {name: '主卧', x: 0, z: 3, w: 2.7, d: 3},
      // {name: '次卧', x: 2.7, z: 3, w: 2.7, d: 3},
      // {name: '书房', x: 5.4, z: 3, w: 2.6, d: 3},
    ],
    furniture: [],                // 家具列表——空 = 没家具
    palette: { wall: '#f5f0e8', floor: '#d9c7a7', accent: '#b89b6a', text: '#2f2a26' }, // 配色：墙/地板/点缀/文字色
    materials: [],   // 材质建议
    lighting: [],    // 灯光建议
    summary: '空白画布，从左侧拖拽家具开始自由设计。',  // 方案总结文字
  }
}

/** 户型房间的 3×2 网格布局（8m×6m 地板，最多 6 个房间，按顺序排布） */
const ROOM_CELLS = [
  { x: 0, z: 0, w: 3, d: 3 },
  { x: 3, z: 0, w: 2.5, d: 3 },
  { x: 5.5, z: 0, w: 2.5, d: 3 },
  { x: 0, z: 3, w: 3, d: 3 },
  { x: 3, z: 3, w: 2.5, d: 3 },
  { x: 5.5, z: 3, w: 2.5, d: 3 },
]

interface AppState {
  plan: DesignPlan | null
  floorplan: FloorPlanResult | null
  advice: Advice | null
  chat: ChatMsg[]
  chatBusy: boolean
  sessionId: string
  generating: boolean
  view: ViewMode
  selectedFurniture: string | null
  houseTypes: HouseType[]
  designs: Design[]
  editingDesignId: number | null
  toast: string | null

  setView: (v: ViewMode) => void
  setSelectedFurniture: (id: string | null) => void
  applyPlan: (plan: DesignPlan, designId?: number) => void
  updateFurniture: (id: string, patch: Partial<Furniture>) => void
  removeFurniture: (id: string) => void
  addFurniture: (type: string, x?: number, z?: number) => void
  newCanvas: () => void
  applyHouseType: (ht: HouseType) => void
  showToast: (msg: string) => void

  generateDesign: (description: string, area: number, style?: string) => Promise<void>
  sendChat: (text: string) => Promise<void>
  loadChatHistory: () => Promise<void>
  recognizeFloorPlan: (file: File) => Promise<void>
  getAdvice: (room: string) => Promise<void>
  saveDesign: () => Promise<void>
  loadHouseTypes: () => Promise<void>
  loadDesigns: () => Promise<void>
  updateHouseType: (id: number, payload: { name?: string; area?: number; layoutJson?: string }) => Promise<void>
  deleteHouseType: (id: number) => Promise<void>
  updateDesign: (id: number, payload: { title?: string; style?: string }) => Promise<void>
  deleteDesign: (id: number) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  plan: null,
  floorplan: null,
  advice: null,
  chat: [],
  chatBusy: false,
  sessionId: getSessionId(),
  generating: false,
  view: '3d',
  selectedFurniture: null,
  houseTypes: [],
  designs: [],
  editingDesignId: null,
  toast: null,

  setView: (v) => set({ view: v }),
  setSelectedFurniture: (id) => set({ selectedFurniture: id }),
  applyPlan: (plan, designId) =>
    set({ plan, selectedFurniture: null, editingDesignId: designId ?? null }),

  updateFurniture: (id, patch) => {
    const plan = get().plan
    if (!plan) return
    set({
      plan: {
        ...plan,
        furniture: plan.furniture.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      },
    })
  },

  removeFurniture: (id) => {
    const plan = get().plan
    if (!plan) return
    set({
      plan: {
        ...plan,
        furniture: plan.furniture.filter((f) => f.id !== id),
      },
      selectedFurniture: get().selectedFurniture === id ? null : get().selectedFurniture,
    })
  },

  addFurniture: (type, x, z) => {
    // 没有画布时先建一张空白画布，方便直接拖拽设计
    const plan = get().plan ?? blankPlan()
    const def = getFurniture(type)
    const W = plan.room_bounds.w
    const D = plan.room_bounds.d
    const id = `f${Date.now()}${Math.floor(Math.random() * 1000)}`
    const newF: Furniture = {
      id,
      name: def.name,
      category: def.type,
      room: '自定义',
      x: x ?? W / 2,
      z: z ?? D / 2,
      w: def.defaultSize.w,
      d: def.defaultSize.d,
      h: def.defaultSize.h,
      color: def.defaultColor,
      y: def.defaultY ?? 0,
      rot: 0,
    }
    // 限制在画布范围内
    newF.x = Math.min(Math.max(newF.x, newF.w / 2), W - newF.w / 2)
    newF.z = Math.min(Math.max(newF.z, newF.d / 2), D - newF.d / 2)
    set({
      plan: { ...plan, furniture: [...plan.furniture, newF] },
      selectedFurniture: id,
    })
  },

  newCanvas: () => {
    set({ plan: blankPlan(), selectedFurniture: null, editingDesignId: null })
    get().showToast('已新建空白画布，拖拽左侧家具开始设计')
  },

  applyHouseType: (ht) => {
    console.log("========= 应用房屋类型 =========")
    let rawRooms: unknown[] = []
    try {
      const layout = JSON.parse(ht.layoutJson)
      if (Array.isArray(layout.rooms)) rawRooms = layout.rooms
    } catch {
      rawRooms = []
    }
    // 兼容两种 layoutJson：新格式是 [{name,x,z,w,d}]，旧格式是 ["客厅",...] 字符串数组
    const rooms: Room[] = rawRooms.map((r, i) => {
      const cell = ROOM_CELLS[i] ?? { x: 0, z: 0, w: 2, d: 2 }
      if (typeof r === 'object' && r !== null) {
        const o = r as Record<string, unknown>
        return {
          name: typeof o.name === 'string' ? o.name : `房间${i + 1}`,
          x: typeof o.x === 'number' ? o.x : cell.x,
          z: typeof o.z === 'number' ? o.z : cell.z,
          w: typeof o.w === 'number' ? o.w : cell.w,
          d: typeof o.d === 'number' ? o.d : cell.d,
        }
      }
      return { name: String(r), ...cell }
    })
    const plan: DesignPlan = {
      title: `${ht.name} · 空户型`,
      style: '现代简约',
      area: ht.area,
      description: `户型：${ht.name}`,
      room_bounds: { w: 8, d: 6 },
      rooms,
      furniture: [],
      palette: { wall: '#f5f0e8', floor: '#d9c7a7', accent: '#b89b6a', text: '#2f2a26' },
      materials: [],
      lighting: [],
      summary: `${ht.name} 空户型，从左侧拖拽家具开始设计。`,
    }
    set({ plan, selectedFurniture: null, editingDesignId: null })
    get().showToast(`已载入户型「${ht.name}」`)
  },

  showToast: (msg) => {
    set({ toast: msg })
    setTimeout(() => {
      if (get().toast === msg) set({ toast: null })
    }, 3000)
  },

  generateDesign: async (description, area, style) => {
    set({ generating: true })
    try {
      const plan = await aiApi.generateDesign(description, area, style)
      set({ plan, selectedFurniture: null, editingDesignId: null })
    } catch (e) {
      get().showToast('生成失败，请确认 AI 服务已启动')
    } finally {
      set({ generating: false })
    }
  },

  sendChat: async (text) => {
    const history = get().chat
    const sessionId = get().sessionId
    const messages: ChatMsg[] = [...history, { role: 'user', content: text }]
    set({ chat: [...messages, { role: 'assistant', content: '' }], chatBusy: true })
    // 用户消息落库（后端未启动时静默失败，不影响对话）
    designApi.saveDesignMessage(sessionId, 'user', text).catch(() => {})
    try {
      await streamChat(messages, (delta) => {
        const chat = get().chat
        const last = chat[chat.length - 1]
        if (last && last.role === 'assistant') {
          const updated = [...chat.slice(0, -1), { ...last, content: last.content + delta }]
          set({ chat: updated })
        }
      })
      // AI 回复落库
      const chat = get().chat
      const last = chat[chat.length - 1]
      if (last && last.role === 'assistant' && last.content) {
        designApi.saveDesignMessage(sessionId, 'assistant', last.content).catch(() => {})
      }
    } catch (e) {
      get().showToast('对话失败，请确认 AI 服务已启动')
    } finally {
      set({ chatBusy: false })
    }
  },

  loadChatHistory: async () => {
    try {
      const history = await designApi.listDesignMessages(get().sessionId)
      if (history.length > 0) {
        set({
          chat: history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        })
      }
    } catch {
      // 后端未启动时静默
    }
  },

  recognizeFloorPlan: async (file) => {
    try {
      const floorplan = await aiApi.recognizeFloorPlan(file)
      set({ floorplan })
    } catch (e) {
      get().showToast('户型识别失败')
    }
  },

  getAdvice: async (room) => {
    try {
      const advice = await aiApi.getAdvice(room)
      set({ advice })
    } catch (e) {
      get().showToast('获取建议失败')
    }
  },

  saveDesign: async () => {
    const plan = get().plan
    if (!plan) {
      get().showToast('请先生成方案')
      return
    }
    const payload = {
      title: plan.title,
      style: plan.style,
      prompt: plan.description,
      planJson: JSON.stringify(plan),
      thumbnail: plan.palette.accent,
    }
    try {
      const editingId = get().editingDesignId
      if (editingId != null) {
        // 正在编辑已有方案 → 更新而不是新增
        await designApi.updateDesign(editingId, payload)
        get().showToast('方案已更新')
      } else {
        await designApi.saveDesign(payload)
        get().showToast('方案已保存')
      }
      await get().loadDesigns()
    } catch (e) {
      get().showToast('保存失败，请确认后端服务已启动')
    }
  },

  loadHouseTypes: async () => {
    try {
      set({ houseTypes: await designApi.listHouseTypes() })
    } catch {
      // 后端未启动时静默
    }
  },

  loadDesigns: async () => {
    try {
      set({ designs: await designApi.listDesigns() })
    } catch {
      // 后端未启动时静默
    }
  },

  updateHouseType: async (id, payload) => {
    try {
      await designApi.updateHouseType(id, payload)
      get().showToast('户型已更新')
      await get().loadHouseTypes()
    } catch {
      get().showToast('更新户型失败')
    }
  },

  deleteHouseType: async (id) => {
    try {
      await designApi.deleteHouseType(id)
      get().showToast('户型已删除')
      await get().loadHouseTypes()
    } catch {
      get().showToast('删除户型失败')
    }
  },

  updateDesign: async (id, payload) => {
    try {
      await designApi.updateDesign(id, payload)
      get().showToast('方案已更新')
      await get().loadDesigns()
    } catch {
      get().showToast('更新方案失败')
    }
  },

  deleteDesign: async (id) => {
    try {
      await designApi.deleteDesign(id)
      if (get().editingDesignId === id) set({ editingDesignId: null })
      get().showToast('方案已删除')
      await get().loadDesigns()
    } catch {
      get().showToast('删除方案失败')
    }
  },
}))

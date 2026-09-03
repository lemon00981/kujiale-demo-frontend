import { create } from 'zustand'
import * as aiApi from '../api/ai'
import * as designApi from '../api/designs'
import { streamChat } from '../api/stream'
import type {
  Advice,
  ChatMsg,
  Design,
  DesignPlan,
  FloorPlanResult,
  HouseType,
  ViewMode,
} from '../types'

interface AppState {
  plan: DesignPlan | null
  floorplan: FloorPlanResult | null
  advice: Advice | null
  chat: ChatMsg[]
  chatBusy: boolean
  generating: boolean
  view: ViewMode
  selectedFurniture: string | null
  houseTypes: HouseType[]
  designs: Design[]
  toast: string | null

  setView: (v: ViewMode) => void
  setSelectedFurniture: (id: string | null) => void
  applyPlan: (plan: DesignPlan) => void
  showToast: (msg: string) => void

  generateDesign: (description: string, area: number, style?: string) => Promise<void>
  sendChat: (text: string) => Promise<void>
  recognizeFloorPlan: (file: File) => Promise<void>
  getAdvice: (room: string) => Promise<void>
  saveDesign: () => Promise<void>
  loadHouseTypes: () => Promise<void>
  loadDesigns: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  plan: null,
  floorplan: null,
  advice: null,
  chat: [],
  chatBusy: false,
  generating: false,
  view: '3d',
  selectedFurniture: null,
  houseTypes: [],
  designs: [],
  toast: null,

  setView: (v) => set({ view: v }),
  setSelectedFurniture: (id) => set({ selectedFurniture: id }),
  applyPlan: (plan) => set({ plan, selectedFurniture: null }),
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
      set({ plan, selectedFurniture: null })
    } catch (e) {
      get().showToast('生成失败，请确认 AI 服务已启动')
    } finally {
      set({ generating: false })
    }
  },

  sendChat: async (text) => {
    const history = get().chat
    const messages: ChatMsg[] = [...history, { role: 'user', content: text }]
    set({ chat: [...messages, { role: 'assistant', content: '' }], chatBusy: true })
    try {
      await streamChat(messages, (delta) => {
        const chat = get().chat
        const last = chat[chat.length - 1]
        if (last && last.role === 'assistant') {
          const updated = [...chat.slice(0, -1), { ...last, content: last.content + delta }]
          set({ chat: updated })
        }
      })
    } catch (e) {
      get().showToast('对话失败，请确认 AI 服务已启动')
    } finally {
      set({ chatBusy: false })
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
    try {
      await designApi.saveDesign({
        title: plan.title,
        style: plan.style,
        prompt: plan.description,
        planJson: JSON.stringify(plan),
        thumbnail: plan.palette.accent,
      })
      get().showToast('方案已保存')
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
}))

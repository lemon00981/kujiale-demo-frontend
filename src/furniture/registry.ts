import type { FurnitureComponentDef } from './types'
import Fallback from './fallback'

const registry = new Map<string, FurnitureComponentDef>()

/** 注册一个家具组件（在 index.ts 里调用） */
export function registerFurniture(def: FurnitureComponentDef) {
  registry.set(def.type, def)
}

/** 获取组件定义，取不到时返回基础方块兜底 */
export function getFurniture(type: string): FurnitureComponentDef {
  return registry.get(type) ?? Fallback
}

/** 列出全部组件（家具库用），按分组排 */
export function listFurniture(): FurnitureComponentDef[] {
  return Array.from(registry.values())
}

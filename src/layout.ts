import type { DesignPlan, Room, Wall } from './types'

/**
 * 从房间边界自动推断墙：四面外墙 + 内部隔墙（每个房间的右/下边，不贴外墙）。
 * 这是「房间即墙」的兜底逻辑——当 plan.walls 未提供时使用。
 */
export function inferWalls(rooms: Room[], bounds: { w: number; d: number }): Wall[] {
  const W = bounds.w
  const D = bounds.d
  const walls: Wall[] = []
  // 四面外墙
  walls.push({ x1: 0, z1: 0, x2: W, z2: 0 })
  walls.push({ x1: 0, z1: D, x2: W, z2: D })
  walls.push({ x1: 0, z1: 0, x2: 0, z2: D })
  walls.push({ x1: W, z1: 0, x2: W, z2: D })
  // 内部隔墙：只画不贴外墙的右/下边，避免相邻房间重复画
  for (const r of rooms) {
    if (r.x + r.w < W - 0.01) {
      walls.push({ x1: r.x + r.w, z1: r.z, x2: r.x + r.w, z2: r.z + r.d })
    }
    if (r.z + r.d < D - 0.01) {
      walls.push({ x1: r.x, z1: r.z + r.d, x2: r.x + r.w, z2: r.z + r.d })
    }
  }
  return walls
}

/**
 * 取墙列表：优先用显式 walls，否则按房间边界自动推断。
 * 注意用 `??` 而非 `||`——walls 为 [] 表示「显式无墙（开放式）」，不能被推断兜底覆盖。
 */
export function getWalls(plan: DesignPlan): Wall[] {
  return plan.walls ?? inferWalls(plan.rooms, plan.room_bounds)
}

/**
 * 家具拖拽（HTML5 Drag & Drop）的共享工具：
 * 左侧家具库 dragstart 时写入类型，画布 drop 时读回类型。
 */

/** 自定义 MIME 类型，标识「这是一次家具拖拽」 */
export const FURNITURE_DND_TYPE = 'application/x-kujiale-furniture'

/** 从拖拽事件里读回家具 type，读不到返回 null */
export function readFurnitureType(dt: DataTransfer | null): string | null {
  if (!dt) return null
  return dt.getData(FURNITURE_DND_TYPE) || null
}

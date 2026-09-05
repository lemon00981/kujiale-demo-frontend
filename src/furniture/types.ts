import type { Furniture } from '../types'

/**
 * 家具组件渲染入参。组件只需关注「长什么样」，不需要管「摆在哪」。
 * - Three：在局部原点画，地面 y=0 朝上，用 f.w / f.d / f.h 决定尺寸。
 * - Plan2D：在局部原点 (0,0) 画俯视轮廓，用 f.w / f.d。
 * 位置 (f.x, f.z) 与旋转 (f.rot) 由父级 group / g 统一处理。
 */
export interface FurnitureRenderProps {
  f: Furniture
  selected?: boolean
}

/**
 * 家具组件定义：一个文件 = 一个组件，导出这样一个对象。
 */
export interface FurnitureComponentDef {
  /** 唯一标识，对齐 AI 端返回的 category，如 'sofa' */
  type: string
  /** 中文名，展示在家具库 */
  name: string
  /** 分组：坐具 / 桌几 / 柜体 / 床 / 灯饰 / 装饰 / 卫浴 */
  category: string
  /** 默认尺寸（米） */
  defaultSize: { w: number; d: number; h: number }
  /** 默认颜色 */
  defaultColor: string
  /** 默认离地高度（米），挂壁/吊装家具用，普通落地家具默认 0 */
  defaultY?: number
  /** 是否可上下升降（3D 平移时显示 Y 轴手柄），挂壁电视等用，默认 false */
  wallMountable?: boolean
  /** 3D 渲染（用几何体拼装） */
  Three: React.FC<FurnitureRenderProps>
  /** 2D 俯视图（SVG） */
  Plan2D: React.FC<FurnitureRenderProps>
}

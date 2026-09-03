import { useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { BoxGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * 写组件用的公共工具：
 * - color helpers：从主色派生出木色/深色/浅色/金属色
 * - 3D 材质 helpers：标准 MeshStandardMaterial 封装
 * - 2D 样式 helpers
 */

/** 把十六进制颜色调暗（factor: 0~1，越小越暗） */
export function darken(hex: string, factor = 0.6): string {
  const n = hex.replace('#', '')
  const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n
  const num = parseInt(full, 16)
  const r = Math.round(((num >> 16) & 0xff) * factor)
  const g = Math.round(((num >> 8) & 0xff) * factor)
  const b = Math.round((num & 0xff) * factor)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** 把十六进制颜色调亮（factor: 1~2） */
export function lighten(hex: string, factor = 1.3): string {
  const n = hex.replace('#', '')
  const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n
  const num = parseInt(full, 16)
  const r = Math.min(255, Math.round(((num >> 16) & 0xff) * factor))
  const g = Math.min(255, Math.round(((num >> 8) & 0xff) * factor))
  const b = Math.min(255, Math.round((num & 0xff) * factor))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** 木色（常用于桌腿、柜门） */
export const WOOD = '#c8a97a'
/** 金属深色（灯杆、椅腿） */
export const METAL = '#3a3f4a'
/** 米白（床垫、靠垫） */
export const OFFWHITE = '#f2efe8'
/** 绿植色 */
export const GREEN = '#5a7d5a'

/**
 * 材质定义：一组 PBR 参数，控制物体的粗糙度 / 金属感 / 透明度。
 * 内置了常用材质，也可以直接传一个自定义对象（见 README「材质」一节）。
 */
export interface MaterialDef {
  roughness: number
  metalness: number
  transparent?: boolean
  opacity?: number
}

export const MATERIALS: Record<string, MaterialDef> = {
  fabric: { roughness: 0.9, metalness: 0 }, // 布艺 / 绒面
  leather: { roughness: 0.45, metalness: 0.1 }, // 皮革
  wood: { roughness: 0.55, metalness: 0.05 }, // 木质
  metal: { roughness: 0.25, metalness: 0.9 }, // 金属
  glass: { roughness: 0.05, metalness: 0, transparent: true, opacity: 0.35 }, // 玻璃
  ceramic: { roughness: 0.2, metalness: 0 }, // 陶瓷 / 洁具
  plastic: { roughness: 0.4, metalness: 0 }, // 塑料 / 烤漆
  matte: { roughness: 0.7, metalness: 0.05 }, // 默认哑光（旧样式）
}

export type MaterialKey = keyof typeof MATERIALS

/** 材质入参：可以是内置 key，也可以直接传自定义参数对象 */
export type MaterialInput = MaterialKey | MaterialDef

function resolveMaterial(m?: MaterialInput): MaterialDef {
  if (!m) return MATERIALS.matte
  return typeof m === 'string' ? MATERIALS[m] : m
}

/**
 * 一个小 helper：生成一个盒子的 JSX，减少组件里重复的 <mesh>。
 * 位置约定：pos 是盒子中心点（y 已含高度一半）。
 */
export function Box({
  pos,
  size,
  color,
  material,
  radius = 0,
  selected = false,
}: {
  pos: [number, number, number]
  size: [number, number, number]
  color: string
  material?: MaterialInput
  /** 圆角半径（米），>0 时边缘变圆润，0 为直角 */
  radius?: number
  selected?: boolean
}) {
  const m = resolveMaterial(material)
  const [w, h, d] = size
  const geometry = useMemo(
    () => (radius > 0 ? new RoundedBoxGeometry(w, h, d, 3, radius) : new BoxGeometry(w, h, d)),
    [w, h, d, radius],
  )
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh position={pos} castShadow receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color={selected ? '#ff9500' : color}
        roughness={m.roughness}
        metalness={m.metalness}
        transparent={m.transparent}
        opacity={m.opacity}
      />
    </mesh>
  )
}

/** 圆柱体（桌腿、灯杆、花盆） */
export function Cylinder({
  pos,
  radiusTop,
  radiusBottom,
  height,
  color,
  material,
  selected = false,
}: {
  pos: [number, number, number]
  radiusTop: number
  radiusBottom: number
  height: number
  color: string
  material?: MaterialInput
  selected?: boolean
}) {
  const m = resolveMaterial(material)
  return (
    <mesh position={pos} castShadow receiveShadow>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, 24]} />
      <meshStandardMaterial
        color={selected ? '#ff9500' : color}
        roughness={m.roughness}
        metalness={m.metalness}
        transparent={m.transparent}
        opacity={m.opacity}
      />
    </mesh>
  )
}

/** 2D 俯视样式 */
export function planFill(color: string, selected?: boolean): CSSProperties {
  return {
    fill: selected ? '#ff9500' : color,
    stroke: 'none',
  }
}

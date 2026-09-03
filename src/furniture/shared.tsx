import type { CSSProperties } from 'react'

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
 * 一个小 helper：生成一个盒子的 JSX，减少组件里重复的 <mesh>。
 * 位置约定：pos 是盒子中心点（y 已含高度一半）。
 */
export function Box({
  pos,
  size,
  color,
  selected = false,
}: {
  pos: [number, number, number]
  size: [number, number, number]
  color: string
  selected?: boolean
}) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={selected ? '#ff9500' : color}
        roughness={0.7}
        metalness={0.05}
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
  selected = false,
}: {
  pos: [number, number, number]
  radiusTop: number
  radiusBottom: number
  height: number
  color: string
  selected?: boolean
}) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, 24]} />
      <meshStandardMaterial
        color={selected ? '#ff9500' : color}
        roughness={0.7}
        metalness={0.05}
      />
    </mesh>
  )
}

/** 2D 俯视样式 */
export function planFill(color: string, selected?: boolean): CSSProperties {
  return {
    fill: selected ? '#ff9500' : color,
    stroke: 'rgba(0,0,0,0.25)',
    strokeWidth: 1,
  }
}

import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, darken, planFill, WOOD } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  const t = 0.05
  const shelfCount = 4
  return (
    <group>
      {/* 左右侧板 */}
      <Box pos={[-w / 2 + t / 2, h / 2, 0]} size={[t, h, d]} color={WOOD} />
      <Box pos={[w / 2 - t / 2, h / 2, 0]} size={[t, h, d]} color={WOOD} />
      {/* 顶底板 */}
      <Box pos={[0, h - t / 2, 0]} size={[w, t, d]} color={WOOD} />
      <Box pos={[0, t / 2, 0]} size={[w, t, d]} color={WOOD} />
      {/* 隔板 */}
      {Array.from({ length: shelfCount }).map((_, i) => {
        const y = ((i + 1) / (shelfCount + 1)) * h
        return <Box key={i} pos={[0, y, 0]} size={[w - t * 2, 0.03, d]} color={darken(WOOD, 0.9)} />
      })}
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} style={planFill(WOOD)} />
      <rect x={-w / 2 + 0.04} y={-d / 2 + 0.04} width={w - 0.08} height={d - 0.08} style={{ fill: darken(WOOD, 0.85) }} />
    </g>
  )
}

const bookshelf: FurnitureComponentDef = {
  type: 'bookshelf',
  name: '书架',
  category: '柜体',
  defaultSize: { w: 1.2, d: 0.35, h: 2.0 },
  defaultColor: WOOD,
  Three,
  Plan2D,
}

export default bookshelf

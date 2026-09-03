import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, darken, OFFWHITE, planFill, WOOD } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      {/* 床架 */}
      <Box pos={[0, h * 0.28, 0]} size={[w, h * 0.56, d]} color={darken(f.color, 0.7)} material="fabric" radius={0.04} />
      {/* 床垫 */}
      <Box pos={[0, h * 0.52, 0.04]} size={[w - 0.08, h * 0.3, d - 0.12]} color={OFFWHITE} material="fabric" radius={0.05} />
      {/* 床头板 */}
      <Box pos={[0, h * 0.7, -d / 2 + 0.05]} size={[w, h * 1.2, 0.1]} color={WOOD} material="wood" radius={0.04} />
      {/* 枕头 */}
      <Box pos={[w * 0.16, h * 0.68, -d / 2 + 0.28]} size={[0.5, 0.1, 0.38]} color={OFFWHITE} material="fabric" radius={0.04} />
      <Box pos={[-w * 0.16, h * 0.68, -d / 2 + 0.28]} size={[0.5, 0.1, 0.38]} color={OFFWHITE} material="fabric" radius={0.04} />
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.04} style={planFill(f.color)} />
      {/* 床头板 */}
      <rect
        x={-w / 2}
        y={-d / 2}
        width={w}
        height={0.1}
        style={{ fill: WOOD }}
      />
      {/* 枕头 */}
      <rect x={-0.42} y={-d / 2 + 0.16} width={0.4} height={0.34} rx={0.05} style={{ fill: OFFWHITE }} />
      <rect x={0.02} y={-d / 2 + 0.16} width={0.4} height={0.34} rx={0.05} style={{ fill: OFFWHITE }} />
    </g>
  )
}

const bed: FurnitureComponentDef = {
  type: 'bed',
  name: '双人床',
  category: '床',
  defaultSize: { w: 1.8, d: 2.0, h: 0.55 },
  defaultColor: '#e9e2d6',
  Three,
  Plan2D,
}

export default bed

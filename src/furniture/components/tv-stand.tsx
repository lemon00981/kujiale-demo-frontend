import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, darken, planFill, WOOD } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      {/* 柜体 */}
      <Box pos={[0, h * 0.55, 0]} size={[w, h * 0.7, d]} color={WOOD} material="wood" />
      {/* 台面 */}
      <Box pos={[0, h - 0.02, 0]} size={[w + 0.06, 0.04, d + 0.06]} color={darken(WOOD, 0.85)} material="wood" radius={0.02} />
      {/* 柜门线 */}
      <Box pos={[0, h * 0.55, d / 2 + 0.005]} size={[0.02, h * 0.6, 0.01]} color={darken(WOOD, 0.6)} material="wood" />
      <Box pos={[-w / 4, h * 0.55, d / 2 + 0.005]} size={[w * 0.42, 0.06, 0.01]} color={darken(WOOD, 0.6)} material="wood" />
      <Box pos={[w / 4, h * 0.55, d / 2 + 0.005]} size={[w * 0.42, 0.06, 0.01]} color={darken(WOOD, 0.6)} material="wood" />
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.04} style={planFill(WOOD)} />
      <line x1={0} y1={-d / 2} x2={0} y2={d / 2} stroke={darken(WOOD, 0.6)} strokeWidth={0.03} />
    </g>
  )
}

const tvStand: FurnitureComponentDef = {
  type: 'tv_stand',
  name: '电视柜',
  category: '柜体',
  defaultSize: { w: 1.8, d: 0.45, h: 0.5 },
  defaultColor: WOOD,
  Three,
  Plan2D,
}

export default tvStand

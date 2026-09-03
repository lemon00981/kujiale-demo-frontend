import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, darken, planFill, WOOD } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      {/* 柜体 */}
      <Box pos={[0, (h - 0.05) / 2, 0]} size={[w, h - 0.05, d]} color={f.color} material="plastic" />
      {/* 台面 */}
      <Box pos={[0, h - 0.025, 0]} size={[w + 0.05, 0.05, d + 0.05]} color={darken(WOOD, 0.85)} material="wood" radius={0.02} />
      {/* 柜门线 */}
      <Box pos={[0, (h - 0.05) / 2, d / 2 + 0.005]} size={[w * 0.9, 0.1, 0.01]} color={darken(f.color, 0.75)} material="plastic" />
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.03} style={planFill(f.color)} />
      <rect x={-w / 2} y={-d / 2} width={w} height={0.05} style={{ fill: darken(WOOD, 0.85) }} />
    </g>
  )
}

const kitchenCounter: FurnitureComponentDef = {
  type: 'kitchen_counter',
  name: '橱柜',
  category: '柜体',
  defaultSize: { w: 2.4, d: 0.6, h: 0.85 },
  defaultColor: '#7a9bb0',
  Three,
  Plan2D,
}

export default kitchenCounter

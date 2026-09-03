import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, Cylinder, darken, OFFWHITE, planFill } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      {/* 柜体 */}
      <Box pos={[0, h * 0.42, 0]} size={[w, h * 0.8, d]} color={f.color} material="ceramic" />
      {/* 台面 */}
      <Box pos={[0, h - 0.02, 0]} size={[w + 0.05, 0.04, d + 0.05]} color={darken(f.color, 0.7)} material="ceramic" radius={0.02} />
      {/* 水盆 */}
      <Cylinder pos={[0, h - 0.06, -d * 0.1]} radiusTop={0.16} radiusBottom={0.12} height={0.08} color={OFFWHITE} material="ceramic" />
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.04} style={planFill(f.color)} />
      <circle cx={0} cy={-d * 0.1} r={0.15} style={{ fill: OFFWHITE }} />
    </g>
  )
}

const sink: FurnitureComponentDef = {
  type: 'sink',
  name: '洗手台',
  category: '卫浴',
  defaultSize: { w: 0.6, d: 0.5, h: 0.85 },
  defaultColor: '#7a9bb0',
  Three,
  Plan2D,
}

export default sink

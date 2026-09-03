import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, OFFWHITE, planFill } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      {/* 底座 */}
      <Box pos={[0, h * 0.3, 0]} size={[w, h * 0.5, d * 0.75]} color={OFFWHITE} material="ceramic" radius={0.03} />
      {/* 水箱 */}
      <Box pos={[0, h * 0.75, -d / 2 + 0.12]} size={[w * 0.85, h * 0.6, 0.24]} color={OFFWHITE} material="ceramic" radius={0.03} />
      {/* 座圈 */}
      <Box pos={[0, h * 0.56, d * 0.2]} size={[w * 0.85, 0.04, d * 0.4]} color={OFFWHITE} material="ceramic" radius={0.015} />
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d * 0.35} width={w} height={d * 0.7} rx={0.06} style={planFill(OFFWHITE)} />
      <rect x={-w * 0.42} y={-d / 2} width={w * 0.85} height={0.22} rx={0.04} style={{ fill: OFFWHITE, stroke: 'rgba(0,0,0,0.25)', strokeWidth: 1 }} />
    </g>
  )
}

const toilet: FurnitureComponentDef = {
  type: 'toilet',
  name: '马桶',
  category: '卫浴',
  defaultSize: { w: 0.4, d: 0.7, h: 0.75 },
  defaultColor: OFFWHITE,
  Three,
  Plan2D,
}

export default toilet

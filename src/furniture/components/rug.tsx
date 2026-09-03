import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, darken, planFill } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <group>
      <Box pos={[0, 0.015, 0]} size={[w, 0.03, d]} color={f.color} material="fabric" radius={0.012} />
      {/* 内圈描边 */}
      <Box pos={[0, 0.032, 0]} size={[w - 0.16, 0.005, d - 0.16]} color={darken(f.color, 0.8)} material="fabric" />
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.1} style={planFill(f.color)} />
      <rect
        x={-w / 2 + 0.08}
        y={-d / 2 + 0.08}
        width={w - 0.16}
        height={d - 0.16}
        rx={0.06}
        style={{ fill: 'none', stroke: darken(f.color, 0.8), strokeWidth: 0.04 }}
      />
    </g>
  )
}

const rug: FurnitureComponentDef = {
  type: 'rug',
  name: '地毯',
  category: '装饰',
  defaultSize: { w: 2.0, d: 1.4, h: 0.03 },
  defaultColor: '#d9cfc0',
  Three,
  Plan2D,
}

export default rug

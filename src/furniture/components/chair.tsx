import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, Cylinder, darken, METAL, planFill } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  const seatY = h * 0.5
  return (
    <group>
      {/* 座面 */}
      <Box pos={[0, seatY, 0]} size={[w, 0.05, d]} color={f.color} material="fabric" radius={0.02} />
      {/* 靠背 */}
      <Box pos={[0, seatY + h * 0.22, -d / 2 + 0.03]} size={[w, h * 0.5, 0.05]} color={darken(f.color, 0.9)} material="fabric" radius={0.02} />
      {/* 4 条腿 */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Cylinder
          key={i}
          pos={[sx * (w / 2 - 0.03), seatY / 2, sz * (d / 2 - 0.03)]}
          radiusTop={0.02}
          radiusBottom={0.02}
          height={seatY}
          color={METAL}
          material="metal"
        />
      ))}
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.06} style={planFill(f.color)} />
      <rect
        x={-w / 2}
        y={-d / 2}
        width={w}
        height={d * 0.18}
        rx={0.04}
        style={{ fill: darken(f.color, 0.9) }}
      />
    </g>
  )
}

const chair: FurnitureComponentDef = {
  type: 'chair',
  name: '餐椅',
  category: '坐具',
  defaultSize: { w: 0.45, d: 0.45, h: 0.9 },
  defaultColor: '#6f6a63',
  Three,
  Plan2D,
}

export default chair

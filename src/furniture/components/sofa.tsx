import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, Cylinder, darken, METAL, planFill } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  const c = f.color
  const seatH = h * 0.38
  const backH = h * 0.8
  const armW = w * 0.09
  return (
    <group>
      {/* 底座 / 坐垫 */}
      <Box pos={[0, seatH / 2, 0]} size={[w - armW * 2, seatH, d]} color={c} material="fabric" radius={0.06} />
      {/* 靠背 */}
      <Box pos={[0, seatH + backH / 2, -d / 2 + 0.09]} size={[w, backH, 0.18]} color={darken(c, 0.85)} material="fabric" radius={0.05} />
      {/* 双扶手 */}
      <Box pos={[w / 2 - armW / 2, seatH + h * 0.1, 0]} size={[armW, h * 0.5, d]} color={darken(c, 0.9)} material="fabric" radius={0.04} />
      <Box pos={[-w / 2 + armW / 2, seatH + h * 0.1, 0]} size={[armW, h * 0.5, d]} color={darken(c, 0.9)} material="fabric" radius={0.04} />
      {/* 4 条腿 */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Cylinder
          key={i}
          pos={[sx * (w / 2 - armW - 0.03), 0.07, sz * (d / 2 - 0.08)]}
          radiusTop={0.028}
          radiusBottom={0.028}
          height={0.14}
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
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.09} style={planFill(f.color)} />
      <rect
        x={-w / 2}
        y={-d / 2}
        width={w}
        height={d * 0.2}
        rx={0.06}
        style={{ fill: darken(f.color, 0.85) }}
      />
      <rect
        x={-w / 2 + 0.05}
        y={-d / 2 + 0.05}
        width={0.08}
        height={d - 0.1}
        style={{ fill: darken(f.color, 0.9), opacity: 0.8 }}
      />
      <rect
        x={w / 2 - 0.13}
        y={-d / 2 + 0.05}
        width={0.08}
        height={d - 0.1}
        style={{ fill: darken(f.color, 0.9), opacity: 0.8 }}
      />
    </g>
  )
}

const sofa: FurnitureComponentDef = {
  type: 'sofa',
  name: '三人沙发',
  category: '坐具',
  defaultSize: { w: 2.2, d: 0.9, h: 0.8 },
  defaultColor: '#8a9bb0',
  Three,
  Plan2D,
}

export default sofa

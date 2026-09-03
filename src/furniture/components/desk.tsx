import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, Cylinder, darken, planFill, WOOD } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      {/* 桌面 */}
      <Box pos={[0, h - 0.03, 0]} size={[w, 0.06, d]} color={WOOD} material="wood" radius={0.02} />
      {/* 抽屉 */}
      <Box pos={[0, h - 0.16, -d / 2 + 0.15]} size={[w * 0.5, 0.2, 0.3]} color={darken(WOOD, 0.85)} material="wood" radius={0.02} />
      {/* 4 条腿 */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Cylinder
          key={i}
          pos={[sx * (w / 2 - 0.04), (h - 0.06) / 2, sz * (d / 2 - 0.04)]}
          radiusTop={0.025}
          radiusBottom={0.025}
          height={h - 0.06}
          color={darken(WOOD, 0.8)}
          material="wood"
        />
      ))}
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.04} style={planFill(WOOD)} />
      <rect
        x={-w / 4}
        y={-d / 2 + 0.1}
        width={w / 2}
        height={d - 0.2}
        rx={0.02}
        style={{ fill: darken(WOOD, 0.85) }}
      />
    </g>
  )
}

const desk: FurnitureComponentDef = {
  type: 'desk',
  name: '书桌',
  category: '桌几',
  defaultSize: { w: 1.2, d: 0.6, h: 0.75 },
  defaultColor: WOOD,
  Three,
  Plan2D,
}

export default desk

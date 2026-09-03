import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, Cylinder, darken, planFill, WOOD } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      <Box pos={[0, h * 0.42, 0]} size={[w, h * 0.64, d]} color={WOOD} material="wood" radius={0.02} />
      {/* 抽屉线 */}
      <Box pos={[0, h * 0.62, -d / 2 + 0.005]} size={[w * 0.7, 0.06, 0.005]} color={darken(WOOD, 0.7)} material="wood" />
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Cylinder
          key={i}
          pos={[sx * (w / 2 - 0.06), h * 0.08, sz * (d / 2 - 0.06)]}
          radiusTop={0.02}
          radiusBottom={0.02}
          height={h * 0.16}
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
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.05} style={planFill(WOOD)} />
      <rect x={-w * 0.3} y={-d / 2 + 0.04} width={w * 0.6} height={0.04} style={{ fill: darken(WOOD, 0.7) }} />
    </g>
  )
}

const nightstand: FurnitureComponentDef = {
  type: 'nightstand',
  name: '床头柜',
  category: '柜体',
  defaultSize: { w: 0.5, d: 0.4, h: 0.5 },
  defaultColor: WOOD,
  Three,
  Plan2D,
}

export default nightstand

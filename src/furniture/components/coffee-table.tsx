import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, Cylinder, planFill, WOOD } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      <Box pos={[0, h - 0.04, 0]} size={[w, 0.08, d]} color={WOOD} material="wood" radius={0.03} />
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Cylinder
          key={i}
          pos={[sx * (w / 2 - 0.08), (h - 0.08) / 2, sz * (d / 2 - 0.08)]}
          radiusTop={0.03}
          radiusBottom={0.03}
          height={h - 0.08}
          color={WOOD}
          material="metal"
        />
      ))}
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.08} style={planFill(WOOD)} />
}

const coffeeTable: FurnitureComponentDef = {
  type: 'coffee_table',
  name: '茶几',
  category: '桌几',
  defaultSize: { w: 1.2, d: 0.6, h: 0.45 },
  defaultColor: WOOD,
  Three,
  Plan2D,
}

export default coffeeTable

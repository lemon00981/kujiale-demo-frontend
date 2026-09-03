import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, Cylinder, darken, METAL, planFill, WOOD } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      {/* 柜体 */}
      <Box pos={[0, h / 2, 0]} size={[w, h, d]} color={WOOD} />
      {/* 中间门缝 */}
      <Box pos={[0, h / 2, d / 2 + 0.005]} size={[0.02, h - 0.05, 0.01]} color={darken(WOOD, 0.6)} />
      {/* 两个把手 */}
      <Cylinder pos={[-w / 4, h * 0.5, d / 2 + 0.03]} radiusTop={0.015} radiusBottom={0.015} height={0.05} color={METAL} />
      <Cylinder pos={[w / 4, h * 0.5, d / 2 + 0.03]} radiusTop={0.015} radiusBottom={0.015} height={0.05} color={METAL} />
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.02} style={planFill(WOOD)} />
      <line x1={0} y1={-d / 2} x2={0} y2={d / 2} stroke={darken(WOOD, 0.6)} strokeWidth={0.03} />
    </g>
  )
}

const wardrobe: FurnitureComponentDef = {
  type: 'wardrobe',
  name: '衣柜',
  category: '柜体',
  defaultSize: { w: 1.6, d: 0.6, h: 2.2 },
  defaultColor: WOOD,
  Three,
  Plan2D,
}

export default wardrobe

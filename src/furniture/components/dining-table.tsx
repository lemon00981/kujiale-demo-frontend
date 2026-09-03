import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Cylinder, planFill, WOOD } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  const r = Math.min(w, d) / 2
  return (
    <group>
      {/* 圆形桌面 */}
      <Cylinder pos={[0, h - 0.03, 0]} radiusTop={r} radiusBottom={r} height={0.06} color={WOOD} />
      {/* 中心柱 */}
      <Cylinder pos={[0, (h - 0.06) / 2, 0]} radiusTop={0.05} radiusBottom={0.05} height={h - 0.1} color={WOOD} />
      {/* 底座 */}
      <Cylinder pos={[0, 0.03, 0]} radiusTop={r * 0.45} radiusBottom={r * 0.5} height={0.06} color={WOOD} />
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const r = Math.min(f.w, f.d) / 2
  return <circle cx={0} cy={0} r={r} style={planFill(WOOD)} />
}

const diningTable: FurnitureComponentDef = {
  type: 'dining_table',
  name: '餐桌',
  category: '桌几',
  defaultSize: { w: 1.6, d: 0.9, h: 0.75 },
  defaultColor: WOOD,
  Three,
  Plan2D,
}

export default diningTable

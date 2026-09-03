import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Cylinder, METAL, planFill } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { h } = f
  const shadeH = h * 0.22
  return (
    <group>
      {/* 底座 */}
      <Cylinder pos={[0, 0.02, 0]} radiusTop={0.12} radiusBottom={0.14} height={0.04} color={METAL} material="metal" />
      {/* 灯杆 */}
      <Cylinder pos={[0, 0.04 + (h - shadeH) / 2, 0]} radiusTop={0.016} radiusBottom={0.016} height={h - shadeH} color={METAL} material="metal" />
      {/* 灯罩（倒梯形） */}
      <Cylinder pos={[0, h - shadeH / 2, 0]} radiusTop={0.07} radiusBottom={0.16} height={shadeH} color={f.color} material="fabric" />
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  return (
    <g>
      <circle cx={0} cy={0} r={0.14} style={planFill(METAL)} />
      <circle cx={0} cy={0} r={0.09} style={{ fill: f.color }} />
    </g>
  )
}

const floorLamp: FurnitureComponentDef = {
  type: 'floor_lamp',
  name: '落地灯',
  category: '灯饰',
  defaultSize: { w: 0.35, d: 0.35, h: 1.5 },
  defaultColor: '#f2e6c8',
  Three,
  Plan2D,
}

export default floorLamp

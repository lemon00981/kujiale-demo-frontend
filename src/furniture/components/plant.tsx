import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Cylinder, GREEN, planFill } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { h } = f
  const potH = h * 0.3
  return (
    <group>
      {/* 花盆 */}
      <Cylinder pos={[0, potH / 2, 0]} radiusTop={0.15} radiusBottom={0.11} height={potH} color="#c97b52" />
      {/* 树干 */}
      <Cylinder pos={[0, potH + 0.15, 0]} radiusTop={0.03} radiusBottom={0.04} height={0.3} color="#7a5b43" />
      {/* 树冠 */}
      <mesh position={[0, potH + 0.42, 0]} castShadow>
        <sphereGeometry args={[0.24, 20, 16]} />
        <meshStandardMaterial color={GREEN} roughness={0.9} />
      </mesh>
      <mesh position={[0.12, potH + 0.3, 0.08]} castShadow>
        <sphereGeometry args={[0.15, 16, 12]} />
        <meshStandardMaterial color={GREEN} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  return (
    <g>
      <circle cx={0} cy={0} r={0.15} style={{ fill: '#c97b52' }} />
      <circle cx={0} cy={0} r={0.26} style={{ fill: GREEN }} />
    </g>
  )
}

const plant: FurnitureComponentDef = {
  type: 'plant',
  name: '绿植',
  category: '装饰',
  defaultSize: { w: 0.45, d: 0.45, h: 1.2 },
  defaultColor: GREEN,
  Three,
  Plan2D,
}

export default plant

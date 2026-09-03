import type { FurnitureComponentDef } from './types'
import { Box, planFill } from './shared'

/**
 * 兜底组件：当 AI 返回了尚未实现的 category 时使用，
 * 保证任何家具都能渲染成一个基础方块而不报错。
 */
const Fallback: FurnitureComponentDef = {
  type: '__fallback__',
  name: '基础方块',
  category: '其他',
  defaultSize: { w: 1, d: 1, h: 0.8 },
  defaultColor: '#cccccc',
  Three: ({ f, selected }) => (
    <group>
      <Box pos={[0, f.h / 2, 0]} size={[f.w, f.h, f.d]} color={f.color} selected={selected} />
    </group>
  ),
  Plan2D: ({ f, selected }) => (
    <rect
      x={-f.w / 2}
      y={-f.d / 2}
      width={f.w}
      height={f.d}
      rx={0.05}
      style={planFill(f.color, selected)}
    />
  ),
}

export default Fallback

import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, darken, METAL, planFill } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  // const standH = h * 0.28            // 底座 + 立柱的高度
  const panelH = h            // 屏幕面板高度
  const panelY = panelH / 2 // 屏幕面板中心高度
  return (
    <group>
      {/* 屏幕面板（机身） */}
      <Box pos={[0, panelY, 0]} size={[w, panelH, d]} color={f.color} material="plastic"/>
      {/* 屏幕显示区（正面稍凸出） */}
      <Box pos={[0, panelY, d / 2 + 0.012]} size={[w * 0.9, panelH * 0.88, 0.02]} color={darken(f.color, 0.35)} material="glass"/>
      {/* 立柱 */}
      {/* <Box pos={[0, standH * 0.45, 0]} size={[0.05, standH * 0.8, 0.05]} color={METAL} /> */}
      {/* 底座 */}
      {/* <Box pos={[0, 0.03, 0]} size={[w * 0.55, 0.06, d * 5]} color={METAL} /> */}
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      {/* 屏幕面板俯视（一条窄矩形） */}
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.01} style={planFill(f.color)} />
      {/* 底座俯视 */}
      {/* <rect x={-w * 0.275} y={-d * 2.5} width={w * 0.55} height={d * 5} rx={0.02} style={planFill(METAL)} /> */}
    </g>
  )
}

const televisionWall: FurnitureComponentDef = {
  type: 'televisionWall',            // 唯一标识，别和已有组件重复
  name: '挂壁电视',
  category: '家电',
  defaultSize: { w: 1.2, d: 0.08, h: 0.7 },
  defaultColor: '#2b2f36',
  defaultY: 1.2, // 挂壁：屏幕中心离地 1.2m
  wallMountable: true, // 挂壁电视可上下升降
  Three,
  Plan2D,
}

export default televisionWall

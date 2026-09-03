# 如何自定义一个家具组件

本目录实现了一套「家具组件系统」：**一个文件 = 一个家具组件**，同一个组件同时提供 **3D 渲染**（three.js 几何体拼装）和 **2D 俯视图**（SVG）。

写组件只需回答一个问题：**「这个家具长什么样？」** —— 位置、旋转、选中高亮都由系统统一处理。

---

## 一、组件长什么样

每个组件导出一个 `FurnitureComponentDef` 对象（见 `types.ts`）：

```ts
export interface FurnitureComponentDef {
  type: string      // 唯一标识，如 'sofa'
  name: string      // 中文名，家具库里显示
  category: string  // 分组：坐具 / 桌几 / 柜体 / 床 / 灯饰 / 装饰 / 卫浴
  defaultSize: { w: number; d: number; h: number }  // 默认尺寸（米）
  defaultColor: string
  Three: React.FC<FurnitureRenderProps>   // 3D 渲染
  Plan2D: React.FC<FurnitureRenderProps>  // 2D 俯视图
}

export interface FurnitureRenderProps {
  f: Furniture   // 家具数据：w/d/h 尺寸、color 颜色
  selected?: boolean
}
```

## 二、坐标系约定（最重要）

- **3D（`Three`）**：在**局部原点**画，地面 `y = 0` 朝上。用 `f.w`（宽/X 轴）、`f.d`（深/Z 轴）、`f.h`（高/Y 轴）。父级 `<group position={[x,0,z]} rotation={[0,rot,0]}>` 负责摆放。
- **2D（`Plan2D`）**：在**局部原点 (0,0)** 画俯视轮廓，范围 `[-w/2, w/2] × [-d/2, d/2]`。父级 `<g transform="translate(x,z) rotate(rot)">` 负责摆放。

> 你**不要**在组件里写位置或旋转，只用尺寸和颜色画形状。

## 三、从 0 写一个组件的 4 步

1. 在 `components/` 新建一个 `.tsx`，`export default` 一个 `FurnitureComponentDef`。
2. 实现 `Three`：用 `Box` / `Cylinder` 等 helper 拼几何体。
3. 实现 `Plan2D`：用 SVG 的 `rect/circle/line` 画俯视轮廓。
4. 在 `index.ts` 里 `import` 并加入 `builtin` 数组（或 `registerFurniture(...)`）。

## 四、最小可抄示例（单人沙发 `armchair`）

```tsx
import type { FurnitureComponentDef, FurnitureRenderProps } from '../types'
import { Box, Cylinder, darken, METAL, planFill } from '../shared'

function Three({ f }: FurnitureRenderProps) {
  const { w, d, h } = f
  return (
    <group>
      {/* 底座坐垫 */}
      <Box pos={[0, h * 0.3, 0]} size={[w, h * 0.5, d]} color={f.color} />
      {/* 靠背 */}
      <Box pos={[0, h * 0.6, -d / 2 + 0.07]} size={[w, h * 0.6, 0.14]} color={darken(f.color, 0.85)} />
      {/* 双扶手 */}
      <Box pos={[w / 2 - 0.05, h * 0.4, 0]} size={[0.1, h * 0.6, d]} color={darken(f.color, 0.9)} />
      <Box pos={[-w / 2 + 0.05, h * 0.4, 0]} size={[0.1, h * 0.6, d]} color={darken(f.color, 0.9)} />
      {/* 4 条腿 */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <Cylinder key={i} pos={[sx * (w / 2 - 0.06), 0.06, sz * (d / 2 - 0.06)]}
          radiusTop={0.02} radiusBottom={0.02} height={0.12} color={METAL} />
      ))}
    </group>
  )
}

function Plan2D({ f }: FurnitureRenderProps) {
  const { w, d } = f
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.08} style={planFill(f.color)} />
      <rect x={-w / 2} y={-d / 2} width={w} height={d * 0.2} rx={0.06}
        style={{ fill: darken(f.color, 0.85) }} />
    </g>
  )
}

const armchair: FurnitureComponentDef = {
  type: 'armchair',            // 唯一标识，别和已有组件重复
  name: '单人沙发',
  category: '坐具',
  defaultSize: { w: 0.9, d: 0.85, h: 0.85 },
  defaultColor: '#a8b8c8',
  Three,
  Plan2D,
}

export default armchair
```

然后在 `index.ts` 里：

```ts
import armchair from './components/armchair'
// ... 加到 builtin 数组里即可
```

## 五、可用的 helper（`shared.tsx`）

| helper | 用途 |
|--------|------|
| `<Box pos size color />` | 一个盒子（pos=中心点，size=[w,h,d]） |
| `<Cylinder pos radiusTop radiusBottom height color />` | 圆柱/圆锥（桌腿、灯杆、花盆） |
| `darken(hex, factor)` / `lighten(hex, factor)` | 颜色调暗/调亮（派生色） |
| `planFill(color)` | 2D 俯视图的填充样式 |
| `WOOD` / `METAL` / `OFFWHITE` / `GREEN` | 常用颜色常量 |

## 六、练习建议（面试常考，建议亲手写 3 个）

1. **电视 TV**：超薄机身 + 底座/挂架（`type: 'tv'`，尺寸如 1.5×0.1×0.8）。
2. **冰箱 fridge**：大柜体 + 上下门缝线 + 把手（`type: 'fridge'`）。
3. **单人沙发 armchair**：照上面的示例做（或换成别的，如 `stool` 吧台凳）。

写完在 `index.ts` 注册，家具库里就能看到、能拖进场景了。

import { useAppStore } from '../store/useAppStore'
import { listFurniture } from '../furniture'
import type { FurnitureComponentDef } from '../furniture'
import type { Design } from '../types'

export default function LeftPanel() {
  const houseTypes = useAppStore((s) => s.houseTypes)
  const designs = useAppStore((s) => s.designs)
  const plan = useAppStore((s) => s.plan)
  const applyPlan = useAppStore((s) => s.applyPlan)
  const addFurniture = useAppStore((s) => s.addFurniture)
  const showToast = useAppStore((s) => s.showToast)

  const loadDesign = (d: Design) => {
    try {
      applyPlan(JSON.parse(d.planJson))
    } catch {
      showToast('方案数据无法解析')
    }
  }

  const onAdd = (type: string) => {
    if (!plan) {
      showToast('请先在右侧生成一个方案')
      return
    }
    addFurniture(type)
  }

  // 按分组聚合家具库
  const furnitureByCategory = listFurniture().reduce<Record<string, FurnitureComponentDef[]>>(
    (acc, def) => {
      ;(acc[def.category] ||= []).push(def)
      return acc
    },
    {},
  )

  return (
    <aside className="left-panel">
      <section>
        <h3>家具库（点击添加）</h3>
        {Object.entries(furnitureByCategory).map(([cat, items]) => (
          <div key={cat} className="furniture-group">
            <div className="furniture-group-title">{cat}</div>
            <div className="furniture-list">
              {items.map((def) => (
                <button
                  key={def.type}
                  className="furniture-chip lib"
                  onClick={() => onAdd(def.type)}
                >
                  {def.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h3>户型库</h3>
        <ul className="side-list">
          {houseTypes.length === 0 && <li className="empty">后端未连接</li>}
          {houseTypes.map((h) => (
            <li key={h.id}>
              <span>{h.name}</span>
              <em>{h.area}㎡</em>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>我的方案</h3>
        <ul className="side-list">
          {designs.length === 0 && <li className="empty">暂无已保存方案</li>}
          {designs.map((d) => (
            <li key={d.id} className="clickable" onClick={() => loadDesign(d)}>
              <span>{d.title}</span>
              <em>{d.style}</em>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

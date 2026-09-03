import { useAppStore } from '../store/useAppStore'
import type { Design } from '../types'

export default function LeftPanel() {
  const houseTypes = useAppStore((s) => s.houseTypes)
  const designs = useAppStore((s) => s.designs)
  const applyPlan = useAppStore((s) => s.applyPlan)
  const showToast = useAppStore((s) => s.showToast)

  const loadDesign = (d: Design) => {
    try {
      applyPlan(JSON.parse(d.planJson))
    } catch {
      showToast('方案数据无法解析')
    }
  }

  return (
    <aside className="left-panel">
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

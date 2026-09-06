import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { listFurniture } from '../furniture'
import type { FurnitureComponentDef } from '../furniture'
import type { Design, HouseType } from '../types'
import { FURNITURE_DND_TYPE } from '../dnd'

export default function LeftPanel() {
  const [open, setOpen] = useState(false)
  const houseTypes = useAppStore((s) => s.houseTypes)
  const designs = useAppStore((s) => s.designs)
  const applyPlan = useAppStore((s) => s.applyPlan)
  const addFurniture = useAppStore((s) => s.addFurniture)
  const applyHouseType = useAppStore((s) => s.applyHouseType)
  const updateHouseType = useAppStore((s) => s.updateHouseType)
  const deleteHouseType = useAppStore((s) => s.deleteHouseType)
  const updateDesign = useAppStore((s) => s.updateDesign)
  const deleteDesign = useAppStore((s) => s.deleteDesign)
  const showToast = useAppStore((s) => s.showToast)

  const loadDesign = (d: Design) => {
    try {
      applyPlan(JSON.parse(d.planJson), d.id)
    } catch {
      showToast('方案数据无法解析')
    }
  }

  const onAdd = (type: string) => addFurniture(type)

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData(FURNITURE_DND_TYPE, type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const onEditHouseType = (h: HouseType) => {
    const name = window.prompt('户型名称', h.name)
    if (name && name.trim() && name.trim() !== h.name) updateHouseType(h.id, { name: name.trim() })
  }

  const onRemoveHouseType = (id: number) => {
    if (window.confirm('确认删除该户型？')) deleteHouseType(id)
  }

  const onEditDesign = (d: Design) => {
    const title = window.prompt('方案标题', d.title)
    if (title && title.trim() && title.trim() !== d.title) updateDesign(d.id, { title: title.trim() })
  }

  const onRemoveDesign = (id: number) => {
    if (window.confirm('确认删除该方案？')) deleteDesign(id)
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
    <aside className={`left-panel${open ? ' open' : ''}`}>
      <button className="panel-toggle" onClick={() => setOpen(!open)}>
        {open ? '‹' : '›'}
      </button>
      <div className="left-panel-body">
      <section>
        <h3>家具库（拖拽或点击添加）</h3>
        {Object.entries(furnitureByCategory).map(([cat, items]) => (
          <div key={cat} className="furniture-group">
            <div className="furniture-group-title">{cat}</div>
            <div className="furniture-list">
              {items.map((def) => (
                <button
                  key={def.type}
                  className="furniture-chip lib"
                  draggable
                  onDragStart={(e) => onDragStart(e, def.type)}
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
            <li key={h.id} className="clickable" onClick={() => applyHouseType(h)}>
              <span title={h.name}>{h.name}</span>
              <em>{h.area}㎡</em>
              <div className="side-actions" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" title="编辑" onClick={() => onEditHouseType(h)}>
                  ✎
                </button>
                <button className="icon-btn danger" title="删除" onClick={() => onRemoveHouseType(h.id)}>
                  🗑
                </button>
              </div>
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
              <span title={d.title}>{d.title}</span>
              <em>{d.style}</em>
              <div className="side-actions" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" title="编辑" onClick={() => onEditDesign(d)}>
                  ✎
                </button>
                <button className="icon-btn danger" title="删除" onClick={() => onRemoveDesign(d.id)}>
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </aside>
  )
}

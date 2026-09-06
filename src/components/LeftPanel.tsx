import { useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { listFurniture } from '../furniture'
import type { FurnitureComponentDef } from '../furniture'
import type { Design, HouseType } from '../types'
import { FURNITURE_DND_TYPE } from '../dnd'

export default function LeftPanel() {
  const [open, setOpen] = useState(false)
  const [editingHouseType, setEditingHouseType] = useState<number | null>(null)
  const [editingDesign, setEditingDesign] = useState<number | null>(null)
  const houseTypeTapRef = useRef<{ id: number; time: number; timer: number } | null>(null)
  const designTapRef = useRef<{ id: number; time: number; timer: number } | null>(null)
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

  const commitHouseTypeName = (id: number, name: string) => {
    const trimmed = name.trim()
    if (trimmed) updateHouseType(id, { name: trimmed })
    setEditingHouseType(null)
  }

  const commitDesignTitle = (id: number, title: string) => {
    const trimmed = title.trim()
    if (trimmed) updateDesign(id, { title: trimmed })
    setEditingDesign(null)
  }

  // 单击/双击区分：单击延迟加载，双击原地编辑（避免 stopPropagation 挡住 li 的加载）
  const onHouseTypeNameClick = (e: React.MouseEvent, h: HouseType) => {
    e.stopPropagation()
    const now = Date.now()
    const last = houseTypeTapRef.current
    if (last && last.id === h.id && now - last.time < 350) {
      clearTimeout(last.timer)
      houseTypeTapRef.current = null
      setEditingHouseType(h.id)
    } else {
      const timer = window.setTimeout(() => {
        applyHouseType(h)
        houseTypeTapRef.current = null
      }, 350)
      houseTypeTapRef.current = { id: h.id, time: now, timer }
    }
  }

  const onDesignTitleClick = (e: React.MouseEvent, d: Design) => {
    e.stopPropagation()
    const now = Date.now()
    const last = designTapRef.current
    if (last && last.id === d.id && now - last.time < 350) {
      clearTimeout(last.timer)
      designTapRef.current = null
      setEditingDesign(d.id)
    } else {
      const timer = window.setTimeout(() => {
        loadDesign(d)
        designTapRef.current = null
      }, 350)
      designTapRef.current = { id: d.id, time: now, timer }
    }
  }

  const onRemoveHouseType = (id: number) => {
    if (window.confirm('确认删除该户型？')) deleteHouseType(id)
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
              {editingHouseType === h.id ? (
                <input
                  autoFocus
                  defaultValue={h.name}
                  style={{ flex: 1, minWidth: 0, fontSize: 13, padding: '2px 6px' }}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onBlur={(e) => commitHouseTypeName(h.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    if (e.key === 'Escape') setEditingHouseType(null)
                  }}
                />
              ) : (
                <span title={h.name} onClick={(e) => onHouseTypeNameClick(e, h)}>
                  {h.name}
                </span>
              )}
              <em>{h.area}㎡</em>
              <div className="side-actions" onClick={(e) => e.stopPropagation()}>
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
              {editingDesign === d.id ? (
                <input
                  autoFocus
                  defaultValue={d.title}
                  style={{ flex: 1, minWidth: 0, fontSize: 13, padding: '2px 6px' }}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onBlur={(e) => commitDesignTitle(d.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    if (e.key === 'Escape') setEditingDesign(null)
                  }}
                />
              ) : (
                <span title={d.title} onClick={(e) => onDesignTitleClick(e, d)}>
                  {d.title}
                </span>
              )}
              <em>{d.style}</em>
              <div className="side-actions" onClick={(e) => e.stopPropagation()}>
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

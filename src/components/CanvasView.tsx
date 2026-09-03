import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getFurniture } from '../furniture'
import type { Furniture } from '../types'
import Scene3D from './Scene3D'

const SCALE = 60 // 1 米 = 60 像素

interface DragState {
  id: string
  startMouseX: number
  startMouseY: number
  startX: number
  startZ: number
}

function Plan2D() {
  const plan = useAppStore((s) => s.plan)!
  const selected = useAppStore((s) => s.selectedFurniture)
  const onSelect = useAppStore((s) => s.setSelectedFurniture)
  const updateFurniture = useAppStore((s) => s.updateFurniture)
  const [drag, setDrag] = useState<DragState | null>(null)

  const W = plan.room_bounds.w
  const D = plan.room_bounds.d
  const rotDeg = (f: Furniture) => ((f.rot ?? 0) * 180) / Math.PI

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drag) return
    const dx = (e.clientX - drag.startMouseX) / SCALE
    const dz = (e.clientY - drag.startMouseY) / SCALE
    updateFurniture(drag.id, { x: drag.startX + dx, z: drag.startZ + dz })
  }

  const handleMouseUp = () => setDrag(null)

  return (
    <svg
      width={W * SCALE}
      height={D * SCALE}
      className="plan-2d"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <g transform={`scale(${SCALE})`}>
        <rect x={0} y={0} width={W} height={D} fill={plan.palette.floor} />
        {plan.rooms.map((r, i) => (
          <rect
            key={i}
            x={r.x}
            y={r.z}
            width={r.w}
            height={r.d}
            fill="none"
            stroke="#b9b0a2"
            strokeWidth={0.03}
            strokeDasharray="0.15 0.1"
          />
        ))}
        {plan.furniture.map((f) => {
          const Plan = getFurniture(f.category).Plan2D
          const isSel = selected === f.id
          return (
            <g
              key={f.id}
              transform={`translate(${f.x} ${f.z}) rotate(${rotDeg(f)})`}
              style={{ cursor: 'move' }}
              onMouseDown={(e) => {
                e.stopPropagation()
                onSelect(f.id)
                setDrag({
                  id: f.id,
                  startMouseX: e.clientX,
                  startMouseY: e.clientY,
                  startX: f.x,
                  startZ: f.z,
                })
              }}
            >
              <Plan f={f} selected={isSel} />
              {isSel && (
                <rect
                  x={-f.w / 2}
                  y={-f.d / 2}
                  width={f.w}
                  height={f.d}
                  fill="none"
                  stroke="#ff9500"
                  strokeWidth={0.06}
                />
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default function CanvasView() {
  const plan = useAppStore((s) => s.plan)
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const selected = useAppStore((s) => s.selectedFurniture)
  const onSelect = useAppStore((s) => s.setSelectedFurniture)
  const updateFurniture = useAppStore((s) => s.updateFurniture)
  const removeFurniture = useAppStore((s) => s.removeFurniture)
  const generating = useAppStore((s) => s.generating)

  const rotateSelected = (deltaDeg: number) => {
    if (!plan || !selected) return
    const f = plan.furniture.find((x) => x.id === selected)
    if (!f) return
    updateFurniture(selected, { rot: (f.rot ?? 0) + (deltaDeg * Math.PI) / 180 })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        const tag = (document.activeElement?.tagName || '').toLowerCase()
        if (tag === 'input' || tag === 'textarea') return
        removeFurniture(selected)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, removeFurniture])

  return (
    <div className="canvas-view">
      <div className="canvas-toolbar">
        <div className="view-switch">
          <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>
            2D 俯视
          </button>
          <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>
            3D 视图
          </button>
        </div>

        {plan && view === '2d' && selected && (
          <div className="edit-tools">
            <button onClick={() => rotateSelected(-45)}>↺ 左转45°</button>
            <button onClick={() => rotateSelected(45)}>↻ 右转45°</button>
            <button className="danger" onClick={() => removeFurniture(selected)}>
              删除
            </button>
          </div>
        )}

        {plan && (
          <div className="canvas-info">
            <span className="style-tag">{plan.style}</span>
            <span>{plan.area}㎡</span>
            <span>{plan.furniture.length} 件家具</span>
            {selected && <span className="hint-tag">已选中，可拖拽/旋转/删除</span>}
          </div>
        )}
      </div>

      <div className="canvas-stage">
        {generating && (
          <div className="canvas-loading">
            <div className="spinner" />
            <span>AI 正在生成方案…</span>
          </div>
        )}
        {!plan && !generating && (
          <div className="canvas-empty">
            <div className="empty-icon">🛋️</div>
            <p>在右侧输入描述，让 AI 为你生成一套设计方案</p>
            <p className="empty-hint">支持：现代简约 / 北欧 / 新中式 / 轻奢</p>
          </div>
        )}
        {plan && view === '3d' && <Scene3D plan={plan} selected={selected} onSelect={onSelect} />}
        {plan && view === '2d' && (
          <div className="plan-2d-wrap">
            <Plan2D />
          </div>
        )}
      </div>
    </div>
  )
}

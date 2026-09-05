import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getFurniture } from '../furniture'
import type { Furniture } from '../types'
import Scene3D from './Scene3D'
import LayoutEditor from './LayoutEditor'
import { readFurnitureType } from '../dnd'

const SCALE = 60 // 1 米 = 60 像素

interface DragState {
  id: string
  startMouseX: number
  startMouseY: number
  startX: number
  startZ: number
}

interface RotateState {
  id: string
  cx: number
  cz: number
  startAngle: number
  startRot: number
}

function Plan2D() {
  const plan = useAppStore((s) => s.plan)!
  const selected = useAppStore((s) => s.selectedFurniture)
  const onSelect = useAppStore((s) => s.setSelectedFurniture)
  const updateFurniture = useAppStore((s) => s.updateFurniture)
  const addFurniture = useAppStore((s) => s.addFurniture)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [rotating, setRotating] = useState<RotateState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = plan.room_bounds.w
  const D = plan.room_bounds.d
  // 2D 俯视 SVG 的 y 轴向下，与 three.js 的 Z 轴方向相反，旋转取负以对齐 3D
  const rotDeg = (f: Furniture) => -((f.rot ?? 0) * 180) / Math.PI
  // 按高度升序排序：地毯等矮的地面装饰先画，避免遮住上面的家具
  const sortedFurniture = [...plan.furniture].sort((a, b) => (a.h ?? 0) - (b.h ?? 0))

  const handleMouseMove = (e: React.MouseEvent) => {
    if (drag) {
      const dx = (e.clientX - drag.startMouseX) / SCALE
      const dz = (e.clientY - drag.startMouseY) / SCALE
      updateFurniture(drag.id, { x: drag.startX + dx, z: drag.startZ + dz })
    } else if (rotating) {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const angle = Math.atan2(
        e.clientY - rect.top - rotating.cz,
        e.clientX - rect.left - rotating.cx,
      )
      let delta = angle - rotating.startAngle
      if (delta > Math.PI) delta -= 2 * Math.PI
      if (delta < -Math.PI) delta += 2 * Math.PI
      updateFurniture(rotating.id, { rot: rotating.startRot - delta })
    }
  }

  const handleMouseUp = () => {
    setDrag(null)
    setRotating(null)
  }

  const startRotate = (e: React.MouseEvent, f: Furniture) => {
    e.stopPropagation()
    onSelect(f.id)
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const cx = f.x * SCALE
    const cz = f.z * SCALE
    const angle = Math.atan2(e.clientY - rect.top - cz, e.clientX - rect.left - cx)
    setRotating({ id: f.id, cx, cz, startAngle: angle, startRot: f.rot ?? 0 })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const type = readFurnitureType(e.dataTransfer)
    if (!type) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / SCALE
    const z = (e.clientY - rect.top) / SCALE
    addFurniture(type, x, z)
  }

  return (
    <svg
      ref={svgRef}
      width={W * SCALE}
      height={D * SCALE}
      className="plan-2d"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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
        {sortedFurniture.map((f) => {
          const Plan = getFurniture(f.category).Plan2D
          const isSel = selected === f.id
          return (
            // 外层 <g> 负责[放在哪]，内层 <Plan> 负责[长什么样]
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
                <>
                  <rect
                    x={-f.w / 2}
                    y={-f.d / 2}
                    width={f.w}
                    height={f.d}
                    fill="none"
                    stroke="#ff9500"
                    strokeWidth={0.06}
                  />
                  <circle
                    cx={0}
                    cy={-f.d / 2 - 0.35}
                    r={0.14}
                    fill="#ff9500"
                    stroke="#fff"
                    strokeWidth={0.04}
                    style={{ cursor: 'grab' }}
                    onMouseDown={(e) => startRotate(e, f)}
                  />
                </>
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
  const addFurniture = useAppStore((s) => s.addFurniture)
  const newCanvas = useAppStore((s) => s.newCanvas)
  const generating = useAppStore((s) => s.generating)
  const editingLayout = useAppStore((s) => s.editingLayout)
  const editingHouseTypeId = useAppStore((s) => s.editingHouseTypeId)
  const setEditingLayout = useAppStore((s) => s.setEditingLayout)
  const [dragOver, setDragOver] = useState(false)

  const handleStageDragOver = (e: React.DragEvent) => {
    if (!readFurnitureType(e.dataTransfer)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOver(true)
  }
  const handleStageDragLeave = () => setDragOver(false)
  const handleStageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const type = readFurnitureType(e.dataTransfer)
    if (!type) return
    addFurniture(type) // 兜底：放中心（2D/3D 的精确落点由各自视图处理）
  }

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

        {editingHouseTypeId != null && (
          <button
            className={editingLayout ? 'btn primary' : 'btn'}
            onClick={() => setEditingLayout(!editingLayout)}
          >
            {editingLayout ? '退出编辑户型' : '编辑户型'}
          </button>
        )}

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

      <div
        className={`canvas-stage${dragOver ? ' drag-over' : ''}`}
        onDragOver={handleStageDragOver}
        onDragLeave={handleStageDragLeave}
        onDrop={handleStageDrop}
      >
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
            <button className="btn primary" onClick={newCanvas}>
              新建空白画布
            </button>
            <p className="empty-hint">或从左侧拖拽家具到画布，直接开始设计</p>
          </div>
        )}
        {plan && view === '3d' && <Scene3D plan={plan} selected={selected} onSelect={onSelect} />}
        {plan && view === '2d' && editingLayout && <LayoutEditor />}
        {plan && view === '2d' && !editingLayout && (
          <div className="plan-2d-wrap">
            <Plan2D />
          </div>
        )}
      </div>
    </div>
  )
}

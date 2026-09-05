import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getWalls } from '../layout'
import type { Wall } from '../types'

const SCALE = 60 // 1 米 = 60 像素

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

/** 户型编辑器：在 2D 里拖动房间、调房间大小、增删墙、画墙，保存回数据库 */
export default function LayoutEditor() {
  const plan = useAppStore((s) => s.plan)!
  const updateRoom = useAppStore((s) => s.updateRoom)
  const removeRoom = useAppStore((s) => s.removeRoom)
  const addRoom = useAppStore((s) => s.addRoom)
  const addWall = useAppStore((s) => s.addWall)
  const removeWall = useAppStore((s) => s.removeWall)
  const saveHouseType = useAppStore((s) => s.saveHouseType)
  const setEditingLayout = useAppStore((s) => s.setEditingLayout)

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [selectedWall, setSelectedWall] = useState<number | null>(null)
  const [drawMode, setDrawMode] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; z: number } | null>(null)
  const [dragRoom, setDragRoom] = useState<{ i: number; rx: number; rz: number; sx: number; sz: number } | null>(null)
  const [resizeRoom, setResizeRoom] = useState<{ i: number; rw: number; rd: number; sx: number; sz: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = plan.room_bounds.w
  const D = plan.room_bounds.d
  const walls = getWalls(plan)

  const toMeters = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return { x: (clientX - rect.left) / SCALE, z: (clientY - rect.top) / SCALE }
  }

  // 点击空白：画墙模式下落点；否则取消选中
  const onSvgMouseDown = (e: React.MouseEvent) => {
    const { x, z } = toMeters(e.clientX, e.clientY)
    if (drawMode) {
      if (!drawStart) {
        setDrawStart({ x, z })
      } else {
        // 画墙：吸附成水平或垂直
        const { x: x1, z: z1 } = drawStart
        if (Math.abs(x - x1) >= Math.abs(z - z1)) {
          addWall({ x1: Math.min(x, x1), z1, x2: Math.max(x, x1), z2: z1 })
        } else {
          addWall({ x1, z1: Math.min(z, z1), x2: x1, z2: Math.max(z, z1) })
        }
        setDrawStart(null)
        setDrawMode(false)
      }
    } else {
      setSelectedRoom(null)
      setSelectedWall(null)
    }
  }

  const onSvgMouseMove = (e: React.MouseEvent) => {
    const { x, z } = toMeters(e.clientX, e.clientY)
    if (dragRoom) {
      const r = plan.rooms[dragRoom.i]
      updateRoom(dragRoom.i, {
        x: clamp(dragRoom.rx + (x - dragRoom.sx), 0, W - r.w),
        z: clamp(dragRoom.rz + (z - dragRoom.sz), 0, D - r.d),
      })
    } else if (resizeRoom) {
      const r = plan.rooms[resizeRoom.i]
      updateRoom(resizeRoom.i, {
        w: clamp(resizeRoom.rw + (x - resizeRoom.sx), 0.5, W - r.x),
        d: clamp(resizeRoom.rd + (z - resizeRoom.sz), 0.5, D - r.z),
      })
    }
  }

  const onMouseUp = () => {
    setDragRoom(null)
    setResizeRoom(null)
  }

  const onRoomDown = (e: React.MouseEvent, i: number) => {
    if (drawMode) return
    e.stopPropagation()
    setSelectedRoom(i)
    setSelectedWall(null)
    const r = plan.rooms[i]
    const { x, z } = toMeters(e.clientX, e.clientY)
    setDragRoom({ i, rx: r.x, rz: r.z, sx: x, sz: z })
  }

  const onResizeDown = (e: React.MouseEvent, i: number) => {
    if (drawMode) return
    e.stopPropagation()
    setSelectedRoom(i)
    setSelectedWall(null)
    const r = plan.rooms[i]
    const { x, z } = toMeters(e.clientX, e.clientY)
    setResizeRoom({ i, rw: r.w, rd: r.d, sx: x, sz: z })
  }

  const onWallClick = (i: number) => {
    if (drawMode) return
    setSelectedWall(i)
    setSelectedRoom(null)
  }

  const onDelete = () => {
    if (selectedWall != null) {
      removeWall(selectedWall)
      setSelectedWall(null)
    } else if (selectedRoom != null) {
      removeRoom(selectedRoom)
      setSelectedRoom(null)
    }
  }

  const onRenameRoom = (i: number) => {
    const r = plan.rooms[i]
    const name = window.prompt('房间名称', r.name)
    if (name && name.trim()) updateRoom(i, { name: name.trim() })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      onDelete()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="layout-editor">
      <div className="layout-toolbar">
        <button onClick={addRoom}>+ 房间</button>
        <button
          className={drawMode ? 'active' : ''}
          onClick={() => {
            setDrawMode(!drawMode)
            setDrawStart(null)
            setSelectedRoom(null)
            setSelectedWall(null)
          }}
        >
          画墙
        </button>
        <button className="danger" onClick={onDelete}>
          删除选中
        </button>
        {selectedRoom != null && (
          <button onClick={() => onRenameRoom(selectedRoom)}>改名</button>
        )}
        <button className="primary" onClick={saveHouseType}>
          保存户型
        </button>
        <button onClick={() => setEditingLayout(false)}>退出编辑</button>
      </div>
      <div className="layout-stage">
        <svg
          ref={svgRef}
          width={W * SCALE}
          height={D * SCALE}
          className="plan-2d"
          onMouseMove={onSvgMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onMouseDown={onSvgMouseDown}
        >
          <g transform={`scale(${SCALE})`}>
            <rect x={0} y={0} width={W} height={D} fill={plan.palette.floor} />

            {/* 墙：实线（可点选删除） */}
            {walls.map((w: Wall, i: number) => (
              <g key={i}>
                <line x1={w.x1} y1={w.z1} x2={w.x2} y2={w.z2} stroke="#5a5248" strokeWidth={0.08} />
                <line
                  x1={w.x1}
                  y1={w.z1}
                  x2={w.x2}
                  y2={w.z2}
                  stroke={selectedWall === i ? '#ff9500' : 'transparent'}
                  strokeWidth={0.22}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onWallClick(i)
                  }}
                />
              </g>
            ))}

            {/* 房间：虚线矩形（可拖动）+ 右下角手柄（调大小） */}
            {plan.rooms.map((r, i) => {
              const sel = selectedRoom === i
              return (
                <g key={i}>
                  <rect
                    x={r.x}
                    y={r.z}
                    width={r.w}
                    height={r.d}
                    fill={sel ? 'rgba(47,111,237,0.08)' : 'none'}
                    stroke={sel ? '#2f6fed' : '#b9b0a2'}
                    strokeWidth={0.04}
                    strokeDasharray="0.15 0.1"
                    style={{ cursor: 'move' }}
                    onMouseDown={(e) => onRoomDown(e, i)}
                  />
                  <text
                    x={r.x + 0.12}
                    y={r.z + 0.32}
                    fontSize={0.3}
                    fill="#6b6356"
                    style={{ cursor: 'text' }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onDoubleClick={() => onRenameRoom(i)}
                  >
                    {r.name}
                  </text>
                  <rect
                    x={r.x + r.w - 0.18}
                    y={r.z + r.d - 0.18}
                    width={0.36}
                    height={0.36}
                    fill="#fff"
                    stroke="#2f6fed"
                    strokeWidth={0.03}
                    style={{ cursor: 'nwse-resize' }}
                    onMouseDown={(e) => onResizeDown(e, i)}
                  />
                </g>
              )
            })}

            {/* 画墙起点标记 */}
            {drawStart && <circle cx={drawStart.x} cy={drawStart.z} r={0.15} fill="#ff9500" />}
          </g>
        </svg>
      </div>
    </div>
  )
}

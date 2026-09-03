import { useAppStore } from '../store/useAppStore'
import Scene3D from './Scene3D'

function Plan2D() {
  const plan = useAppStore((s) => s.plan)!
  const selected = useAppStore((s) => s.selectedFurniture)
  const onSelect = useAppStore((s) => s.setSelectedFurniture)
  const scale = 60
  const W = plan.room_bounds.w * scale
  const D = plan.room_bounds.d * scale

  return (
    <svg width={W} height={D} className="plan-2d">
      <rect x={0} y={0} width={W} height={D} fill={plan.palette.floor} />
      {plan.rooms.map((r, i) => (
        <rect
          key={i}
          x={r.x * scale}
          y={r.z * scale}
          width={r.w * scale}
          height={r.d * scale}
          fill="none"
          stroke="#b9b0a2"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
      ))}
      {plan.furniture.map((f) => {
        const isSel = selected === f.id
        return (
          <g key={f.id} onClick={() => onSelect(isSel ? null : f.id)} style={{ cursor: 'pointer' }}>
            <rect
              x={(f.x - f.w / 2) * scale}
              y={(f.z - f.d / 2) * scale}
              width={f.w * scale}
              height={f.d * scale}
              fill={isSel ? '#ff9500' : f.color}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={1}
              rx={3}
            />
            <text
              x={f.x * scale}
              y={f.z * scale}
              fontSize={10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#3a3a3a"
            >
              {f.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function CanvasView() {
  const plan = useAppStore((s) => s.plan)
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const selected = useAppStore((s) => s.selectedFurniture)
  const onSelect = useAppStore((s) => s.setSelectedFurniture)
  const generating = useAppStore((s) => s.generating)

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
        {plan && (
          <div className="canvas-info">
            <span className="style-tag">{plan.style}</span>
            <span>{plan.area}㎡</span>
            <span>{plan.furniture.length} 件家具</span>
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

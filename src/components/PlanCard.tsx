import type { DesignPlan } from '../types'

export default function PlanCard({ plan }: { plan: DesignPlan }) {
  return (
    <div className="plan-card">
      <div className="plan-card-head">
        <strong>{plan.title}</strong>
        <span className="style-tag">{plan.style}</span>
      </div>
      <p className="plan-summary">{plan.summary}</p>

      <div className="plan-section">
        <div className="plan-section-title">配色方案</div>
        <div className="palette-row">
          {[
            { k: '墙面', c: plan.palette.wall },
            { k: '地面', c: plan.palette.floor },
            { k: '点缀', c: plan.palette.accent },
            { k: '文字', c: plan.palette.text },
          ].map((p) => (
            <div className="palette-swatch" key={p.k}>
              <span className="swatch-dot" style={{ background: p.c }} />
              <span className="swatch-label">{p.k}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="plan-section">
        <div className="plan-section-title">材质</div>
        {plan.materials.map((m, i) => (
          <div className="kv-row" key={i}>
            <span className="kv-k">{m.area}</span>
            <span className="kv-v">
              {m.name}
              {m.color && <span className="swatch-dot inline" style={{ background: m.color }} />}
            </span>
          </div>
        ))}
      </div>

      <div className="plan-section">
        <div className="plan-section-title">灯光</div>
        {plan.lighting.map((l, i) => (
          <div className="kv-row" key={i}>
            <span className="kv-k">{l.type}</span>
            <span className="kv-v">
              {l.name}
              <span className="kv-note">{l.note}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="plan-section">
        <div className="plan-section-title">家具清单（{plan.furniture.length}）</div>
        <div className="furniture-list">
          {plan.furniture.map((f) => (
            <span className="furniture-chip" key={f.id} title={`${f.room} · ${f.name}`}>
              {f.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

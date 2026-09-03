import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import PlanCard from './PlanCard'

type Tab = 'generate' | 'chat' | 'floorplan' | 'advice'

const TABS: [Tab, string][] = [
  ['generate', '文生设计'],
  ['chat', 'AI 对话'],
  ['floorplan', '户型识别'],
  ['advice', '灯光材质'],
]

export default function RightPanel() {
  const [tab, setTab] = useState<Tab>('generate')

  return (
    <aside className="right-panel">
      <div className="tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="tab-body">
        {tab === 'generate' && <GenerateTab />}
        {tab === 'chat' && <ChatTab />}
        {tab === 'floorplan' && <FloorPlanTab />}
        {tab === 'advice' && <AdviceTab />}
      </div>
    </aside>
  )
}

function GenerateTab() {
  const generating = useAppStore((s) => s.generating)
  const generateDesign = useAppStore((s) => s.generateDesign)
  const plan = useAppStore((s) => s.plan)
  const [desc, setDesc] = useState('帮我设计一个 90㎡ 现代简约风的三室两厅')
  const [area, setArea] = useState(90)
  const [style, setStyle] = useState('')

  const submit = () => generateDesign(desc, area, style || undefined)

  return (
    <div className="tab-content">
      <label className="field">
        <span>设计描述</span>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          placeholder="例如：帮我设计一个 90㎡ 现代简约风客厅…"
        />
      </label>
      <div className="field-row">
        <label className="field">
          <span>面积（㎡）</span>
          <input type="number" value={area} onChange={(e) => setArea(Number(e.target.value))} />
        </label>
        <label className="field">
          <span>风格</span>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="">自动判断</option>
            <option>现代简约</option>
            <option>北欧</option>
            <option>新中式</option>
            <option>轻奢</option>
          </select>
        </label>
      </div>
      <button className="btn primary block" disabled={generating || !desc.trim()} onClick={submit}>
        {generating ? '生成中…' : '生成方案'}
      </button>
      {plan && <PlanCard plan={plan} />}
    </div>
  )
}

function ChatTab() {
  const chat = useAppStore((s) => s.chat)
  const chatBusy = useAppStore((s) => s.chatBusy)
  const sendChat = useAppStore((s) => s.sendChat)
  const [input, setInput] = useState('')

  const send = () => {
    if (!input.trim() || chatBusy) return
    sendChat(input.trim())
    setInput('')
  }

  return (
    <div className="chat">
      <div className="chat-messages">
        {chat.length === 0 && (
          <div className="chat-hint">向 AI 助手提问：帮我换成北欧风格 / 客厅灯光怎么配？</div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-bubble">{m.content || (chatBusy ? '…' : '')}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          placeholder="输入你的问题…"
        />
        <button className="btn primary" disabled={chatBusy} onClick={send}>
          发送
        </button>
      </div>
    </div>
  )
}

function FloorPlanTab() {
  const recognizeFloorPlan = useAppStore((s) => s.recognizeFloorPlan)
  const floorplan = useAppStore((s) => s.floorplan)
  const [busy, setBusy] = useState(false)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setBusy(true)
    await recognizeFloorPlan(f)
    setBusy(false)
  }

  return (
    <div className="tab-content">
      <p className="hint">上传户型图，AI 识别房间结构（演示为规则模拟）</p>
      <input type="file" accept="image/*" onChange={onFile} />
      {busy && <p>识别中…</p>}
      {floorplan && (
        <div className="floorplan-result">
          <p>{floorplan.note}</p>
          <p className="muted">
            面积约 {floorplan.area}㎡，识别出 {floorplan.rooms.length} 个房间：
          </p>
          <div className="furniture-list">
            {floorplan.rooms.map((r, i) => (
              <span className="furniture-chip" key={i}>
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AdviceTab() {
  const getAdvice = useAppStore((s) => s.getAdvice)
  const advice = useAppStore((s) => s.advice)
  const rooms = ['客厅', '卧室', '厨房', '书房']

  return (
    <div className="tab-content">
      <div className="furniture-list">
        {rooms.map((r) => (
          <button key={r} className="chip-btn" onClick={() => getAdvice(r)}>
            {r}
          </button>
        ))}
      </div>
      {advice && (
        <div className="advice">
          <h4>{advice.room_type} · 灯光与材质建议</h4>
          <div className="plan-section-title">灯光</div>
          {advice.lighting.map((l, i) => (
            <div className="kv-row" key={i}>
              <span className="kv-k">{l.type}</span>
              <span className="kv-v">
                {l.name}
                <span className="kv-note">{l.note}</span>
              </span>
            </div>
          ))}
          <div className="plan-section-title">材质</div>
          {advice.materials.map((m, i) => (
            <div className="kv-row" key={i}>
              <span className="kv-k">{m.area}</span>
              <span className="kv-v">
                {m.name}
                <span className="kv-note">{m.note}</span>
              </span>
            </div>
          ))}
          <p className="advice-tips">{advice.tips}</p>
        </div>
      )}
    </div>
  )
}

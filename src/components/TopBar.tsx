import { useAppStore } from '../store/useAppStore'

export default function TopBar() {
  const saveDesign = useAppStore((s) => s.saveDesign)
  const newCanvas = useAppStore((s) => s.newCanvas)
  const toast = useAppStore((s) => s.toast)

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-logo">K</span>
        <span className="brand-name">酷家乐</span>
        <span className="brand-sub">AI 云设计 Demo</span>
      </div>
      <div className="topbar-actions">
        <button className="btn" onClick={newCanvas}>
          新建画布
        </button>
        <button className="btn primary" onClick={saveDesign}>
          保存方案
        </button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </header>
  )
}

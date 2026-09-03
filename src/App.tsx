import { useEffect } from 'react'
import TopBar from './components/TopBar'
import LeftPanel from './components/LeftPanel'
import CanvasView from './components/CanvasView'
import RightPanel from './components/RightPanel'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const loadHouseTypes = useAppStore((s) => s.loadHouseTypes)
  const loadDesigns = useAppStore((s) => s.loadDesigns)

  useEffect(() => {
    loadHouseTypes()
    loadDesigns()
  }, [loadHouseTypes, loadDesigns])

  return (
    <div className="app">
      <TopBar />
      <div className="app-body">
        <LeftPanel />
        <CanvasView />
        <RightPanel />
      </div>
    </div>
  )
}

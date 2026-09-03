import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Group } from 'three'
import type { DesignPlan, Furniture } from '../types'
import { getFurniture } from '../furniture'
import { useAppStore } from '../store/useAppStore'
import { readFurnitureType } from '../dnd'

type TransformMode = 'translate' | 'rotate'

function RoomShell({ plan }: { plan: DesignPlan }) {
  const W = plan.room_bounds.w
  const D = plan.room_bounds.d
  const wallH = 2.8
  const t = 0.12
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={plan.palette.floor} />
      </mesh>
      <mesh position={[0, wallH / 2, -D / 2]}>
        <boxGeometry args={[W, wallH, t]} />
        <meshStandardMaterial color={plan.palette.wall} transparent opacity={0.22} />
      </mesh>
      <mesh position={[0, wallH / 2, D / 2]}>
        <boxGeometry args={[W, wallH, t]} />
        <meshStandardMaterial color={plan.palette.wall} transparent opacity={0.22} />
      </mesh>
      <mesh position={[-W / 2, wallH / 2, 0]}>
        <boxGeometry args={[t, wallH, D]} />
        <meshStandardMaterial color={plan.palette.wall} transparent opacity={0.22} />
      </mesh>
      <mesh position={[W / 2, wallH / 2, 0]}>
        <boxGeometry args={[t, wallH, D]} />
        <meshStandardMaterial color={plan.palette.wall} transparent opacity={0.22} />
      </mesh>
      {/* 内部房间隔墙：只画不贴外墙的右/下边，避免相邻房间重复画 */}
      {plan.rooms.map((r, i) => (
        <group key={i}>
          {r.x + r.w < W - 0.01 && (
            <mesh position={[r.x + r.w - W / 2, wallH / 2, r.z + r.d / 2 - D / 2]}>
              <boxGeometry args={[t, wallH, r.d]} />
              <meshStandardMaterial color={plan.palette.wall} transparent opacity={0.22} />
            </mesh>
          )}
          {r.z + r.d < D - 0.01 && (
            <mesh position={[r.x + r.w / 2 - W / 2, wallH / 2, r.z + r.d - D / 2]}>
              <boxGeometry args={[r.w, wallH, t]} />
              <meshStandardMaterial color={plan.palette.wall} transparent opacity={0.22} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/** 选中指示：一个橙色线框包围盒 */
function SelectionBox({ f }: { f: Furniture }) {
  return (
    <mesh position={[0, f.h / 2, 0]}>
      <boxGeometry args={[f.w, f.h, f.d]} />
      <meshBasicMaterial color="#ff9500" wireframe transparent opacity={0.9} />
    </mesh>
  )
}

export default function Scene3D({
  plan,
  selected,
  onSelect,
}: {
  plan: DesignPlan
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const updateFurniture = useAppStore((s) => s.updateFurniture)
  const removeFurniture = useAppStore((s) => s.removeFurniture)
  const addFurniture = useAppStore((s) => s.addFurniture)
  const [mode, setMode] = useState<TransformMode>('translate')
  const [orbitEnabled, setOrbitEnabled] = useState(true)
  const refs = useRef<Record<string, Group | null>>({})
  const stateRef = useRef<RootState | null>(null)

  const W = plan.room_bounds.w
  const D = plan.room_bounds.d

  // 把屏幕坐标投射到地面平面，返回画布坐标（米）
  const projectToFloor = (clientX: number, clientY: number) => {
    const st = stateRef.current
    if (!st) return null
    const rect = st.gl.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    st.raycaster.setFromCamera(ndc, st.camera)
    const pt = new THREE.Vector3()
    if (st.raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pt)) {
      return { x: pt.x + W / 2, z: pt.z + D / 2 }
    }
    return null
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
    const pos = projectToFloor(e.clientX, e.clientY)
    if (pos) addFurniture(type, pos.x, pos.z)
    else addFurniture(type)
  }

  // 拖动结束才提交，拖动过程中由 TransformControls 直接改 object，避免高频 setState 导致的卡顿
  const commitTransform = () => {
    if (!selected) return
    const obj = refs.current[selected]
    if (!obj) return
    updateFurniture(selected, {
      x: obj.position.x + W / 2,
      y: obj.position.y,
      z: obj.position.z + D / 2,
      rot: obj.rotation.y,
    })
  }

  return (
    <div className="scene3d-wrap" onDragOver={handleDragOver} onDrop={handleDrop}>
      <Canvas
        shadows
        camera={{ position: [6, 6, 9], fov: 45 }}
        onPointerMissed={() => onSelect(null)}
        onCreated={(st) => {
          stateRef.current = st
        }}
      >
        <color attach="background" args={['#eef1f5']} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 9, 5]} intensity={1.4} castShadow />
        <RoomShell plan={plan} />

        {plan.furniture.map((f) => {
          const Three = getFurniture(f.category).Three
          return (
            <group
              key={f.id}
              ref={(el) => {
                refs.current[f.id] = el
              }}
              position={[f.x - W / 2, f.y ?? 0, f.z - D / 2]}
              rotation={[0, f.rot ?? 0, 0]}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(f.id)
              }}
            >
              <Three f={f} />
              {selected === f.id && <SelectionBox f={f} />}
            </group>
          )
        })}

        {selected && refs.current[selected] && (
          <TransformControls
            object={refs.current[selected]}
            mode={mode}
            onMouseDown={() => setOrbitEnabled(false)}
            onMouseUp={() => {
              setOrbitEnabled(true)
              commitTransform()
            }}
          />
        )}

        <OrbitControls
          makeDefault
          enabled={orbitEnabled}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={2}
          maxDistance={22}
        />
      </Canvas>

      <div className="scene3d-tools">
        <button
          className={mode === 'translate' ? 'active' : ''}
          onClick={() => setMode('translate')}
        >
          平移
        </button>
        <button className={mode === 'rotate' ? 'active' : ''} onClick={() => setMode('rotate')}>
          旋转
        </button>
        {selected && (
          <button className="danger" onClick={() => removeFurniture(selected)}>
            删除选中
          </button>
        )}
      </div>
    </div>
  )
}

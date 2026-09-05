import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Group } from 'three'
import type { DesignPlan, Furniture } from '../types'
import { getFurniture } from '../furniture'
import { useAppStore } from '../store/useAppStore'
import { getWalls } from '../layout'
import { readFurnitureType } from '../dnd'

type TransformMode = 'translate' | 'rotate'

function RoomShell({ plan }: { plan: DesignPlan }) {
  const W = plan.room_bounds.w
  const D = plan.room_bounds.d
  const wallH = 2.8
  const t = 0.12
  // 显式墙（编辑户型）或按房间边界推断墙（AI 生成/旧数据）
  const walls = getWalls(plan)
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={plan.palette.floor} />
      </mesh>
      {/* 每段墙：水平/垂直线段 → 立起来的薄墙（画布坐标转场景中心坐标） */}
      {walls.map((w, i) => {
        const horizontal = Math.abs(w.z1 - w.z2) < 0.01
        const length = horizontal ? Math.abs(w.x2 - w.x1) : Math.abs(w.z2 - w.z1)
        const cx = horizontal ? (w.x1 + w.x2) / 2 : w.x1
        const cz = horizontal ? w.z1 : (w.z1 + w.z2) / 2
        return (
          <mesh key={i} position={[cx - W / 2, wallH / 2, cz - D / 2]}>
            <boxGeometry args={horizontal ? [length, wallH, t] : [t, wallH, length]} />
            <meshStandardMaterial color={plan.palette.wall} transparent opacity={0.22} />
          </mesh>
        )
      })}
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
  const refs = useRef<Record<string, Group | null>>({})
  const stateRef = useRef<RootState | null>(null)
  // 用 ref 直接开关 OrbitControls，避免 setState 触发重渲染打断 TransformControls 的旋转
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitRef = useRef<any>(null)
  // TransformControls 拖动过程中的最新变换（onObjectChange 时记录，onMouseUp 时提交）
  const pendingRef = useRef<{ x: number; y: number; z: number; rot: number } | null>(null)

  const W = plan.room_bounds.w
  const D = plan.room_bounds.d

  // 只有可挂壁家具（电视等）平移时才显示 Y 轴手柄，其余家具不能上下移动
  const selectedFurniture = plan.furniture.find((f) => f.id === selected)
  const canRaise = selectedFurniture
    ? getFurniture(selectedFurniture.category).wallMountable ?? false
    : false

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
  // 拖动结束提交数据
  const commitTransform = () => {
    if (!selected) return
    const obj = refs.current[selected]
    if (!obj) return
    const p = pendingRef.current
    // 优先用 onObjectChange 记录的最终值，避免 onMouseUp 时机读到的 obj 值已被 fiber 重置
    updateFurniture(selected, {
      x: (p ? p.x : obj.position.x) + W / 2,  // 中心坐标 → 左上角坐标（+W/2 映射回去）
      y: p ? p.y : obj.position.y,
      z: (p ? p.z : obj.position.z) + D / 2,
      rot: p ? p.rot : obj.rotation.y,
    })
    pendingRef.current = null
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
              position={[f.x - W / 2, f.y ?? 0, f.z - D / 2]} // 坐标映射
              rotation={[0, f.rot ?? 0, 0]}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(f.id)
              }}
            >
              {/* 调组件系统的 3D 渲染 */}
              <Three f={f} />
              {/* 选中的橙色线框 */}
              {selected === f.id && <SelectionBox f={f} />}
            </group>
          )
        })}

        {/* 3D 平移/旋转 */}  
        {selected && refs.current[selected] && (
          <TransformControls
            object={refs.current[selected]}
            mode={mode}
            showX={mode === 'translate'}
            showY={mode === 'rotate' ? true : canRaise}
            showZ={mode === 'translate'}
            onMouseDown={() => {
              pendingRef.current = null
              if (orbitRef.current) orbitRef.current.enabled = false
            }}
            onMouseUp={() => {
              if (orbitRef.current) orbitRef.current.enabled = true
              commitTransform()
            }}
            onObjectChange={() => {
              const obj = refs.current[selected]
              if (obj) {
                pendingRef.current = {
                  x: obj.position.x,
                  y: obj.position.y,
                  z: obj.position.z,
                  rot: obj.rotation.y,
                }
              }
            }}
          />
        )}

        {/* 视角控制：旋转、缩放整个场景（拖家具时 onMouseDown 临时禁用它，避免打架） */}
        <OrbitControls
          ref={orbitRef}
          makeDefault
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

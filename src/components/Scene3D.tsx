import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { DesignPlan, Furniture } from '../types'

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
    </group>
  )
}

function FurnitureMesh({
  f,
  plan,
  selected,
  onSelect,
}: {
  f: Furniture
  plan: DesignPlan
  selected: boolean
  onSelect: (id: string) => void
}) {
  const x = f.x - plan.room_bounds.w / 2
  const z = f.z - plan.room_bounds.d / 2
  return (
    <mesh
      position={[x, f.h / 2, z]}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation()
        onSelect(f.id)
      }}
    >
      <boxGeometry args={[f.w, f.h, f.d]} />
      <meshStandardMaterial
        color={selected ? '#ff9500' : f.color}
        emissive={selected ? '#ff9500' : '#000000'}
        emissiveIntensity={selected ? 0.35 : 0}
      />
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
  return (
    <Canvas
      shadows
      camera={{ position: [6, 6, 9], fov: 45 }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={['#eef1f5']} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 9, 5]} intensity={1.4} castShadow />
      <RoomShell plan={plan} />
      {plan.furniture.map((f) => (
        <FurnitureMesh
          key={f.id}
          f={f}
          plan={plan}
          selected={selected === f.id}
          onSelect={(id) => onSelect(id)}
        />
      ))}
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={2} maxDistance={22} />
    </Canvas>
  )
}

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Cycle timing constants ────────────────────────────────────────
const CYCLE = 16        // seconds per full loop
const P_GROW = 0.62      // 0 → P_GROW  : galaxy expands
const P_BREAK = 0.76      // P_GROW → P_BREAK : cube shatters
const P_HOLD = 0.84      // P_BREAK → P_HOLD : galaxy holds at max
const P_SHRINK = 0.96      // P_HOLD → P_SHRINK : galaxy implodes
// P_SHRINK → 1.0 : cube rebuilds

function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }

// ─── Glowing pulsing core ─────────────────────────────────────────
function GalacticCore({ coreRef }) {
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (coreRef.current) {
      const p = 1 + 0.4 * Math.sin(t * 4.5)
      coreRef.current.scale.setScalar(p)
      coreRef.current.material.emissiveIntensity = 0.8 + 0.6 * Math.sin(t * 3.2)
    }
  })
  return (
    <mesh ref={coreRef}>
      <sphereGeometry args={[0.18, 20, 20]} />
      <meshStandardMaterial color="#001133" emissive="#4f8fff" emissiveIntensity={1} roughness={0} metalness={1} />
    </mesh>
  )
}

// ─── Orbit rings ──────────────────────────────────────────────────
function OrbitRing({ radius, count, baseSpeed, tilt, color, size = 0.036, spdRef }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      arr[i * 3] = Math.cos(a) * radius
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.08
      arr[i * 3 + 2] = Math.sin(a) * radius
    }
    return arr
  }, [count, radius])

  useFrame((_, delta) => {
    if (ref.current) {
      // spdRef carries the current cycle multiplier from parent
      const mult = spdRef ? spdRef.current : 1
      ref.current.rotation.y += baseSpeed * mult * delta
    }
  })

  return (
    <group rotation={[tilt, 0, 0]} ref={ref}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        </bufferGeometry>
        <pointsMaterial color={color} size={size} transparent opacity={0.92} sizeAttenuation />
      </points>
    </group>
  )
}

// ─── Star field (bouncing inside cube) ────────────────────────────
function StarField() {
  const posAttr = useRef()
  const count = 220
  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = []
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.8
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.8
      spd.push({ vx: (Math.random() - 0.5) * 0.022, vy: (Math.random() - 0.5) * 0.022, vz: (Math.random() - 0.5) * 0.022 })
    }
    return { positions: pos, speeds: spd }
  }, [])

  useFrame(() => {
    if (!posAttr.current) return
    const arr = posAttr.current.array
    for (let i = 0; i < count; i++) {
      arr[i * 3] += speeds[i].vx; arr[i * 3 + 1] += speeds[i].vy; arr[i * 3 + 2] += speeds[i].vz
      const B = 0.9
      if (Math.abs(arr[i * 3]) > B) speeds[i].vx *= -1
      if (Math.abs(arr[i * 3 + 1]) > B) speeds[i].vy *= -1
      if (Math.abs(arr[i * 3 + 2]) > B) speeds[i].vz *= -1
    }
    posAttr.current.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#93c5fd" size={0.028} transparent opacity={0.75} sizeAttenuation />
    </points>
  )
}

// ─── Nebula dust ──────────────────────────────────────────────────
function NebulaDust() {
  const ref = useRef()
  const count = 90
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 0.78
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.cos(phi)
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return arr
  }, [])
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.getElapsedTime() * 0.65
      ref.current.rotation.x = s.clock.getElapsedTime() * 0.32
    }
  })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} /></bufferGeometry>
      <pointsMaterial color="#6ea8ff" size={0.07} transparent opacity={0.35} sizeAttenuation />
    </points>
  )
}

// ─── Individual cube face that can shatter ────────────────────────
function CubeFace({ geo, colorIdx, faceIndex, shatterRef, opacityRef }) {
  // outward direction for each face
  const outDir = useMemo(() => {
    const dirs = [
      [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0],
    ]
    return new THREE.Vector3(...dirs[faceIndex])
  }, [faceIndex])

  const ref = useRef()
  const matRef = useRef()

  // Random spin axis for shatter tumble
  const tumble = useMemo(() => ({
    axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    speed: (Math.random() + 0.5) * 8,
  }), [])

  useFrame((_, delta) => {
    if (!ref.current || !matRef.current) return
    const s = shatterRef.current   // 0 → 1 shatter progress
    const op = opacityRef.current  // cube overall opacity

    // Fly outward
    const fly = easeInOut(s) * 3.5
    ref.current.position.set(
      outDir.x * fly,
      outDir.y * fly,
      outDir.z * fly,
    )

    // Tumble
    if (s > 0) {
      ref.current.rotateOnAxis(tumble.axis, tumble.speed * s * delta)
    }

    // Opacity: driven by parent opacityRef
    matRef.current.opacity = op
  })

  const COLORS = ['#4f8fff', '#6ea8ff', '#4f8fff', '#6ea8ff', '#4f8fff', '#6ea8ff']

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial ref={matRef} color={COLORS[colorIdx]} transparent opacity={1} />
    </lineSegments>
  )
}

// ─── Corner dots (extracted so hooks aren't called in loops) ─────
function CornerDot({ position, shatterRef, opacityRef }) {
  const meshRef = useRef()
  const matRef = useRef()
  const outDir = useMemo(
    () => new THREE.Vector3(...position).normalize(),
    [position],
  )
  useFrame((_, delta) => {
    if (!meshRef.current || !matRef.current) return
    const s = shatterRef.current
    const op = opacityRef.current
    const fly = easeInOut(s) * 3.5
    meshRef.current.position.set(
      position[0] * 1.1 + outDir.x * fly,
      position[1] * 1.1 + outDir.y * fly,
      position[2] * 1.1 + outDir.z * fly,
    )
    matRef.current.opacity = op
  })
  return (
    <mesh ref={meshRef} position={[position[0] * 1.1, position[1] * 1.1, position[2] * 1.1]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial ref={matRef} color="#93c5fd" transparent opacity={1} />
    </mesh>
  )
}


function buildFaceGrid(axis, sign, SIZE = 2.2, DIVS = 5) {
  const points = [], step = SIZE / DIVS, half = SIZE / 2
  for (let i = 0; i <= DIVS; i++) {
    const u = -half + i * step
    for (let j = 0; j <= DIVS; j++) {
      if (i < DIVS) {
        const a = axis === 'z' ? [u, -half + j * step, sign * half] : axis === 'y' ? [u, sign * half, -half + j * step] : [sign * half, u, -half + j * step]
        const b = axis === 'z' ? [u + step, -half + j * step, sign * half] : axis === 'y' ? [u + step, sign * half, -half + j * step] : [sign * half, u + step, -half + j * step]
        points.push(new THREE.Vector3(...a), new THREE.Vector3(...b))
      }
      if (j < DIVS) {
        const a = axis === 'z' ? [u, -half + j * step, sign * half] : axis === 'y' ? [u, sign * half, -half + j * step] : [sign * half, u, -half + j * step]
        const b = axis === 'z' ? [u, -half + (j + 1) * step, sign * half] : axis === 'y' ? [u, sign * half, -half + (j + 1) * step] : [sign * half, u, -half + (j + 1) * step]
        points.push(new THREE.Vector3(...a), new THREE.Vector3(...b))
      }
    }
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

// ─── Main assembly ────────────────────────────────────────────────
function GridCube() {
  const groupRef = useRef()
  const galaxyRef = useRef()   // scale of the galaxy
  const coreRef = useRef()
  const spdMult = useRef(1)
  const shatterProg = useRef(0)  // 0 → 1 shatter
  const cubeOpacity = useRef(1)  // 1 → 0 disappear
  const cubeGroupRef = useRef()

  const mouse = useRef({ x: 0, y: 0 })
  const targetRot = useRef({ x: 0.3, y: 0 })
  const currentRot = useRef({ x: 0.3, y: 0 })

  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const faceGeos = useMemo(() => [
    buildFaceGrid('z', 1), buildFaceGrid('z', -1),
    buildFaceGrid('y', 1), buildFaceGrid('y', -1),
    buildFaceGrid('x', 1), buildFaceGrid('x', -1),
  ], [])

  const cornerPos = useMemo(() => [
    [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
  ], [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // ── Cube spin (always) ──
    targetRot.current.x = -mouse.current.y * 0.65 + 0.25
    targetRot.current.y = mouse.current.x * 0.9 + t * 0.78
    currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.09
    currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.09
    if (groupRef.current) {
      groupRef.current.rotation.x = currentRot.current.x
      groupRef.current.rotation.y = currentRot.current.y
      groupRef.current.scale.setScalar(1 + 0.025 * Math.sin(t * 2.5))
    }

    const GROW_END = 10    // galaxy finishes expanding
    const BREAK_END = 12.5  // cube fully shattered & gone
    const SETTLE_END = 16   // galaxy settles to final size

    if (t < GROW_END) {
      // Galaxy grows 1 → 3.6×, cube intact
      const p = t / GROW_END
      if (galaxyRef.current) galaxyRef.current.scale.setScalar(1 + easeInOut(p) * 2.6)
      spdMult.current = 1 + p * 4
      shatterProg.current = 0
      cubeOpacity.current = 1

    } else if (t < BREAK_END) {
      // Cube shatters — faces fly out, opacity → 0
      const p = (t - GROW_END) / (BREAK_END - GROW_END)
      if (galaxyRef.current) galaxyRef.current.scale.setScalar(3.6)
      spdMult.current = 5
      shatterProg.current = easeInOut(p)
      cubeOpacity.current = 1 - easeInOut(p)

    } else if (t < SETTLE_END) {
      // Galaxy gently settles 3.6 → 1.8× — cube stays gone forever
      const p = (t - BREAK_END) / (SETTLE_END - BREAK_END)
      if (galaxyRef.current) galaxyRef.current.scale.setScalar(3.6 - easeInOut(p) * 1.8)
      spdMult.current = 5 - easeInOut(p) * 3
      shatterProg.current = 1
      cubeOpacity.current = 0

    } else {
      // Hold at 1.8× forever — cube never returns
      if (galaxyRef.current) galaxyRef.current.scale.setScalar(1.8)
      spdMult.current = 2
      shatterProg.current = 1
      cubeOpacity.current = 0
    }
  })

  return (
    <group ref={groupRef}>

      {/* ── CUBE FACES (shattering) ── */}
      <group ref={cubeGroupRef}>
        {faceGeos.map((geo, i) => (
          <CubeFace
            key={i}
            geo={geo}
            colorIdx={i}
            faceIndex={i}
            shatterRef={shatterProg}
            opacityRef={cubeOpacity}
          />
        ))}

        {/* Corner vertex dots */}
        {cornerPos.map((pos, i) => (
          <CornerDot
            key={`c${i}`}
            position={pos}
            shatterRef={shatterProg}
            opacityRef={cubeOpacity}
          />
        ))}
      </group>

      {/* ── GALACTIC INTERIOR ── */}
      <group ref={galaxyRef}>
        <GalacticCore coreRef={coreRef} />
        <NebulaDust />
        <StarField />
        <OrbitRing radius={0.55} count={60} baseSpeed={5.0} tilt={0} color="#4f8fff" size={0.04} spdRef={spdMult} />
        <OrbitRing radius={0.70} count={80} baseSpeed={-4.2} tilt={Math.PI / 3} color="#93c5fd" size={0.03} spdRef={spdMult} />
        <OrbitRing radius={0.40} count={45} baseSpeed={7.5} tilt={Math.PI / 5} color="#6ea8ff" size={0.035} spdRef={spdMult} />
        <OrbitRing radius={0.85} count={100} baseSpeed={-3.5} tilt={Math.PI / 2.5} color="#1a56db" size={0.025} spdRef={spdMult} />
        <OrbitRing radius={0.28} count={30} baseSpeed={10.0} tilt={Math.PI / 1.8} color="#e0f2fe" size={0.05} spdRef={spdMult} />
      </group>
    </group>
  )
}

export default function HeroCube() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[4, 4, 4]} intensity={2} color="#4f8fff" />
      <pointLight position={[-4, -4, -4]} intensity={1} color="#1a3aff" />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#93c5fd" />
      <GridCube />
    </Canvas>
  )
}

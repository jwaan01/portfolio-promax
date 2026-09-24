import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Deterministic PRNG so the galaxy is identical on every render (and pure for React).
function mulberry32(seed) {
    let s = seed
    return () => {
        s += 0x6d2b79f5
        let t = s
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const GALAXY = { count: 30000, radius: 5.4, branches: 4, spin: 1.25, randomness: 0.24, power: 2.8 }
const FORM_DURATION = 3.6 // seconds for the particles to assemble after the preloader

function buildGalaxy() {
    const rand = mulberry32(7)
    const { count, radius, branches, spin, randomness, power } = GALAXY
    const positions = new Float32Array(count * 3)
    const scatter = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const delays = new Float32Array(count)

    const cCore = new THREE.Color('#fff4dc')
    const cGold = new THREE.Color('#d9b56c')
    const cBlue = new THREE.Color('#4f8fff')
    const cEdge = new THREE.Color('#7c5cff')
    const c = new THREE.Color()
    const offset = (spread) => Math.pow(rand(), power) * (rand() < 0.5 ? 1 : -1) * spread

    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const r = Math.pow(rand(), 1.5) * radius
        const branch = ((i % branches) / branches) * Math.PI * 2
        const angle = branch + r * spin
        const spread = randomness * (r + 0.5)

        positions[i3] = Math.cos(angle) * r + offset(spread)
        positions[i3 + 1] = offset(spread * 0.45)
        positions[i3 + 2] = Math.sin(angle) * r + offset(spread)

        // Start scattered across a wide shell around the camera.
        const theta = rand() * Math.PI * 2
        const phi = Math.acos(2 * rand() - 1)
        const dist = 9 + rand() * 18
        scatter[i3] = Math.sin(phi) * Math.cos(theta) * dist
        scatter[i3 + 1] = Math.cos(phi) * dist
        scatter[i3 + 2] = Math.sin(phi) * Math.sin(theta) * dist

        const t = r / radius
        if (t < 0.22) c.copy(cCore).lerp(cGold, t / 0.22)
        else if (t < 0.6) c.copy(cGold).lerp(cBlue, (t - 0.22) / 0.38)
        else c.copy(cBlue).lerp(cEdge, (t - 0.6) / 0.4)
        colors[i3] = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b

        scales[i] = rand() < 0.015 ? 2.8 : 0.35 + rand() * 1.1
        delays[i] = rand() * 0.45
    }

    return { positions, scatter, colors, scales, delays }
}

function buildStars(count = 2600) {
    const rand = mulberry32(21)
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
        const theta = rand() * Math.PI * 2
        const phi = Math.acos(2 * rand() - 1)
        const dist = 25 + rand() * 40
        positions[i * 3] = Math.sin(phi) * Math.cos(theta) * dist
        positions[i * 3 + 1] = Math.cos(phi) * dist
        positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * dist
        seeds[i] = rand() * 100
    }
    return { positions, seeds }
}

const galaxyVertex = /* glsl */ `
    uniform float uTime;
    uniform float uForm;
    uniform float uWarp;
    uniform float uSize;
    attribute vec3 aScatter;
    attribute vec3 aColor;
    attribute float aScale;
    attribute float aDelay;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
        // Differential rotation: the core spins faster than the rim.
        float r = length(position.xz);
        float ang = atan(position.z, position.x) + uTime * 0.22 / (r + 0.7) * (1.0 + uWarp * 4.0);
        vec3 disk = vec3(cos(ang) * r, position.y, sin(ang) * r);

        // Assemble from the scattered cloud with a per-particle delay.
        float f = clamp((uForm - aDelay) / 0.55, 0.0, 1.0);
        f = 1.0 - pow(1.0 - f, 3.0);
        vec3 pos = mix(aScatter, disk, f);

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        float depth = -mv.z;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(uSize * aScale / max(depth, 0.05), 72.0);

        vColor = aColor;
        vAlpha = smoothstep(0.05, 1.0, depth) * (0.25 + 0.75 * f);
    }
`

const glowFragment = /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = pow(max(0.0, 1.0 - d * 2.0), 2.2);
        gl_FragColor = vec4(vColor * (1.0 + a * 0.6), a * vAlpha);
    }
`

const starVertex = /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    attribute float aSeed;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize / -mv.z;
        vColor = mix(vec3(0.62, 0.74, 1.0), vec3(1.0, 0.92, 0.78), fract(aSeed));
        vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.6 + aSeed));
    }
`

function useGlowTexture() {
    return useMemo(() => {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = size
        const ctx = canvas.getContext('2d')
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
        g.addColorStop(0, 'rgba(255, 246, 225, 1)')
        g.addColorStop(0.12, 'rgba(255, 226, 170, 0.75)')
        g.addColorStop(0.35, 'rgba(217, 181, 108, 0.18)')
        g.addColorStop(0.7, 'rgba(79, 143, 255, 0.05)')
        g.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, size, size)
        return new THREE.CanvasTexture(canvas)
    }, [])
}

function Galaxy({ ready, progress }) {
    const groupRef = useRef()
    const matRef = useRef()
    const starMatRef = useRef()
    const coreRef = useRef()
    const form = useRef(0)
    const mouse = useRef({ x: 0, y: 0 })
    const gl = useThree((state) => state.gl)

    const galaxy = useMemo(() => buildGalaxy(), [])
    const stars = useMemo(() => buildStars(), [])
    const glow = useGlowTexture()
    const dpr = gl.getPixelRatio()

    const uniforms = useMemo(
        () => ({ uTime: { value: 0 }, uForm: { value: 0 }, uWarp: { value: 0 }, uSize: { value: 34 * dpr } }),
        [dpr],
    )
    const starUniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: 70 * dpr } }), [dpr])

    useEffect(() => {
        const onMove = (e) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
            mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [])

    useFrame((state, delta) => {
        const { camera } = state
        const t = state.clock.getElapsedTime()
        if (ready) form.current = Math.min(1.45, form.current + delta / FORM_DURATION)

        // Scroll dives the camera through the disk into the core.
        const p = progress ? progress.get() : 0
        const warp = p * p

        if (matRef.current) {
            matRef.current.uniforms.uTime.value = t
            matRef.current.uniforms.uForm.value = form.current
            matRef.current.uniforms.uWarp.value = warp
        }
        if (starMatRef.current) starMatRef.current.uniforms.uTime.value = t

        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.03
        }
        if (coreRef.current) {
            const pulse = 1 + 0.06 * Math.sin(t * 2.2)
            const s = (2.6 + warp * 6) * pulse * Math.min(1, form.current)
            coreRef.current.scale.set(s, s, 1)
            coreRef.current.material.opacity = Math.min(1, form.current) * (0.85 + warp * 0.15)
        }

        const targetX = mouse.current.x * 0.8 * (1 - warp)
        const targetY = 0.9 + mouse.current.y * 0.5 * (1 - warp) - warp * 0.9
        camera.position.x += (targetX - camera.position.x) * 0.04
        camera.position.y += (targetY - camera.position.y) * 0.04
        // Portrait screens pull the camera back so the whole disk fits.
        const fit = Math.min(1.9, Math.max(1, 1.05 / (state.size.width / state.size.height)))
        camera.position.z = (6.4 - warp * 6.0) * (1 - warp) * fit + (6.4 - warp * 6.0) * warp
        camera.lookAt(0, 0, 0)
    })

    return (
        <>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[stars.positions, 3]} />
                    <bufferAttribute attach="attributes-aSeed" args={[stars.seeds, 1]} />
                </bufferGeometry>
                <shaderMaterial
                    ref={starMatRef}
                    uniforms={starUniforms}
                    vertexShader={starVertex}
                    fragmentShader={glowFragment}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            <group rotation={[1.05, 0, -0.38]}>
                <group ref={groupRef}>
                    <points>
                        <bufferGeometry>
                            <bufferAttribute attach="attributes-position" args={[galaxy.positions, 3]} />
                            <bufferAttribute attach="attributes-aScatter" args={[galaxy.scatter, 3]} />
                            <bufferAttribute attach="attributes-aColor" args={[galaxy.colors, 3]} />
                            <bufferAttribute attach="attributes-aScale" args={[galaxy.scales, 1]} />
                            <bufferAttribute attach="attributes-aDelay" args={[galaxy.delays, 1]} />
                        </bufferGeometry>
                        <shaderMaterial
                            ref={matRef}
                            uniforms={uniforms}
                            vertexShader={galaxyVertex}
                            fragmentShader={glowFragment}
                            transparent
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                        />
                    </points>
                </group>
            </group>

            <sprite ref={coreRef} scale={[0.001, 0.001, 1]}>
                <spriteMaterial map={glow} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
        </>
    )
}

/**
 * Hero backdrop: a spiral galaxy of glowing particles that assembles out of
 * scattered stardust once the page is ready, drifts with the mouse, and
 * swallows the camera as the prologue is scrolled.
 */
export default function HeroGalaxy({ active = true, ready = true, progress }) {
    return (
        <Canvas
            camera={{ position: [0, 0.9, 6.4], fov: 55, near: 0.05, far: 200 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.75]}
            resize={{ offsetSize: true }}
            frameloop={active ? 'always' : 'never'}
        >
            <Galaxy ready={ready} progress={progress} />
        </Canvas>
    )
}

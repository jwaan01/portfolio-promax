import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function GridBackground() {
    const mountRef = useRef(null)

    useEffect(() => {
        const el = mountRef.current
        if (!el) return

        // ── Renderer ──────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(el.clientWidth, el.clientHeight)
        renderer.setClearColor(0x000000, 0)
        el.appendChild(renderer.domElement)

        // ── Scene / Camera ────────────────────────────────────────────
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 300)
        camera.position.set(0, 10, 0)
        camera.lookAt(0, 0, 0)

        // ── Grid geometry (large flat plane subdivided) ───────────────
        const GRID_CELLS = 30
        const GRID_SIZE = 80      // world units
        const CELL_SIZE = GRID_SIZE / GRID_CELLS

        // Build grid line geometry manually so we can animate each vertex
        const positions = []
        const totalLines = (GRID_CELLS + 1) * 2  // rows + cols

        for (let i = 0; i <= GRID_CELLS; i++) {
            const x = -GRID_SIZE / 2 + i * CELL_SIZE
            positions.push(x, 0, -GRID_SIZE / 2)  // start
            positions.push(x, 0, GRID_SIZE / 2)  // end
        }
        for (let j = 0; j <= GRID_CELLS; j++) {
            const z = -GRID_SIZE / 2 + j * CELL_SIZE
            positions.push(-GRID_SIZE / 2, 0, z)
            positions.push(GRID_SIZE / 2, 0, z)
        }

        const posArr = new Float32Array(positions)
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3))

        const gridMat = new THREE.LineBasicMaterial({
            color: 0x1a56db,
            transparent: true,
            opacity: 0.45,
        })
        const grid = new THREE.LineSegments(geo, gridMat)
        scene.add(grid)

        // ── Glowing intersection dots ─────────────────────────────────
        const dotGeo = new THREE.SphereGeometry(0.12, 6, 6)
        const dotMat = new THREE.MeshBasicMaterial({ color: 0x4f8fff })
        const dots = []

        for (let i = 0; i <= GRID_CELLS; i++) {
            for (let j = 0; j <= GRID_CELLS; j++) {
                // Only create dots for every 3rd intersection to keep it light
                if (i % 3 !== 0 || j % 3 !== 0) continue
                const dot = new THREE.Mesh(dotGeo, dotMat.clone())
                const x = -GRID_SIZE / 2 + i * CELL_SIZE
                const z = -GRID_SIZE / 2 + j * CELL_SIZE
                dot.position.set(x, 0, z)
                dot.userData = { baseX: x, baseZ: z, phase: Math.random() * Math.PI * 2 }
                scene.add(dot)
                dots.push(dot)
            }
        }

        // ── Ambient light ─────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x4f8fff, 0.8))

        // ── Mouse → camera tilt ───────────────────────────────────────
        const mouse = { x: 0, y: 0 }
        const targetCam = { x: 0, z: 3 }  // horizontal pan & Z position

        const onMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
        }
        window.addEventListener('mousemove', onMouseMove, { passive: true })

        // ── Resize ───────────────────────────────────────────────────
        const onResize = () => {
            camera.aspect = el.clientWidth / el.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(el.clientWidth, el.clientHeight)
        }
        window.addEventListener('resize', onResize)

        // ── Animate ──────────────────────────────────────────────────
        let frameId
        let offset = 0   // drives the "scrolling" illusion on Z
        const SCROLL_SPEED = 0.06

        const animate = () => {
            frameId = requestAnimationFrame(animate)
            offset += SCROLL_SPEED

            // Camera glides forward (Z offset cycles the grid tiles)
            const camX = camera.position.x + (mouse.x * 3 - camera.position.x) * 0.025
            const camZ = (offset % CELL_SIZE)  // cycles 0→CELL_SIZE to fake infinite scroll
            camera.position.set(camX, 10, camZ)
            camera.lookAt(camX, -6, camZ - 22)

            // Animate dot heights for a pulsing wave
            const t = offset * 0.04
            dots.forEach((dot) => {
                const wave = Math.sin(t + dot.userData.phase + dot.userData.baseX * 0.12 + dot.userData.baseZ * 0.12) * 0.3
                dot.position.y = wave
                const glow = 0.6 + 0.4 * Math.sin(t * 1.5 + dot.userData.phase)
                dot.material.opacity = glow
                dot.material.transparent = true
            })

            // Pulse grid opacity
            gridMat.opacity = 0.3 + 0.15 * Math.sin(t * 0.5)

            renderer.render(scene, camera)
        }
        animate()

        return () => {
            cancelAnimationFrame(frameId)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
        }
    }, [])

    return (
        <div
            ref={mountRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    )
}

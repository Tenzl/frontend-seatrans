'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * three.js viewer for the SEATRANS HQ model. The GLB is quantized + webp
 * (KHR_mesh_quantization / EXT_texture_webp) which GLTFLoader reads natively —
 * no Draco/meshopt decoder, no worker, no wasm, so nothing trips the app CSP.
 *
 * Key lesson from earlier: the material is left EXACTLY as authored. A neutral
 * RoomEnvironment provides correct IBL for the metallic PBR surfaces; lighting
 * and exposure are tuned (not the material) so the captured colours show.
 */

const MODEL_URL = '/seatrans-3d/seatrans-three.glb'

// Tuning — adjust these if it looks too bright/dark, no need to touch the model.
const EXPOSURE = 0.9
const HEMI_INTENSITY = 0.9
const DIR_INTENSITY = 1.2

export default function Hero3DModel() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let disposed = false
    let frame = 0
    const width = mount.clientWidth || 1
    const height = mount.clientHeight || 1

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = EXPOSURE
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000)
    camera.position.set(4, 2.5, 6)

    // Neutral studio IBL so the metallic PBR material renders correctly (no HDR fetch).
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    scene.add(new THREE.HemisphereLight(0xffffff, 0x335577, HEMI_INTENSITY))
    const dir = new THREE.DirectionalLight(0xffffff, DIR_INTENSITY)
    dir.position.set(5, 8, 5)
    scene.add(dir)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minPolarAngle = Math.PI / 2.8
    controls.maxPolarAngle = Math.PI / 1.85
    controls.autoRotate = false

    const loader = new GLTFLoader()
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return
        const model = gltf.scene
        // Material is intentionally left as authored — do NOT override metalness/
        // emissive/env here; that was what washed the model to white before.
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        model.scale.setScalar(4.4 / maxDim)
        scene.add(model)
        controls.target.set(0, 0, 0)
        controls.update()
        setStatus('ready')
      },
      undefined,
      (err) => {
        if (disposed) return
        console.error('[Hero3DModel] failed to load GLB', err)
        setStatus('error')
      },
    )

    const renderLoop = () => {
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(renderLoop)
    }
    frame = requestAnimationFrame(renderLoop)

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(mount)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      ro.disconnect()
      controls.dispose()
      pmrem.dispose()
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        mesh.geometry?.dispose?.()
        const mat = mesh.material
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose?.()
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div ref={mountRef} className="relative h-full w-full">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/60">
          Không tải được mô hình 3D.
        </div>
      )}
    </div>
  )
}

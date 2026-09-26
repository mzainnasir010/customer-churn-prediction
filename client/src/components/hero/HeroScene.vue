<!--
  Customer Risk Sphere — the ChurnIQ hero visualization.
  ~600 customers plotted on a sphere, colored by churn risk. A small
  high-risk cohort is surfaced (pushed outward, glowing, beamed to the
  model core). Hover/tap a customer to see its risk and top driver.
  Raw Three.js, no external assets.
-->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const emit = defineEmits<{
  hover: [
    payload: {
      x: number
      y: number
      tier: 'Low' | 'Medium' | 'High'
      probability: number
      driver: string
    } | null
  ]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const reduced =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let customerGroup: THREE.Group
let points: THREE.InstancedMesh
let rafId = 0
let prevTime = 0
let elapsed = 0

const COUNT = 600
const BASE_RADIUS = 2.35
const SURFACE_COUNT = 7

const basePositions: THREE.Vector3[] = []
const baseScales: number[] = []
const risk: number[] = []
const surfaced: number[] = []
const beams: {
  line: THREE.Line
  pulse: THREE.Mesh
  target: THREE.Vector3
  offset: number
}[] = []

const DRIVERS = [
  'Month-to-month contract',
  'Fiber optic service',
  'Electronic check payment',
  'Short tenure',
  'No tech support',
  'High monthly charges',
  'Paperless billing',
]

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0

    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const dummy = new THREE.Object3D()
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2(-10, -10)

let pointerActive = false

let targetRotY = 0
let targetRotX = 0
let curRotY = 0
let curRotX = 0
let autoRot = 0

let hoveredIndex = -1
let pinnedIndex = -1

const scaleAnim = new Map<
  number,
  {
    current: number
    target: number
  }
>()

const colorAnim = new Map<number, number>()

const highlightColor = new THREE.Color(0xffffff)
const tmpColor = new THREE.Color()

function riskColor(t: number): THREE.Color {
  const low = new THREE.Color(0x2dd4bf)
  const med = new THREE.Color(0xf5a524)
  const high = new THREE.Color(0xff4d5e)

  if (t < 0.55) {
    return low.clone().lerp(med, t / 0.55)
  }

  return med.clone().lerp(high, (t - 0.55) / 0.45)
}

function tierOf(t: number): 'Low' | 'Medium' | 'High' {
  return t < 0.4 ? 'Low' : t < 0.7 ? 'Medium' : 'High'
}

function setInstanceTransform(i: number, scale: number) {
  dummy.position.copy(basePositions[i])
  dummy.rotation.set(0, 0, 0)
  dummy.scale.setScalar(scale)
  dummy.updateMatrix()

  points.setMatrixAt(i, dummy.matrix)
}

function screenPosition(i: number): { x: number; y: number } | null {
  const canvas = canvasRef.value

  if (!canvas) {
    return null
  }

  const world = basePositions[i]
    .clone()
    .applyMatrix4(customerGroup.matrixWorld)

  world.project(camera)

  if (world.z > 1) {
    return null
  }

  const rect = canvas.getBoundingClientRect()

  return {
    x: (world.x * 0.5 + 0.5) * rect.width,
    y: (-world.y * 0.5 + 0.5) * rect.height,
  }
}

function emitHover(i: number) {
  if (i < 0 || i >= COUNT) {
    emit('hover', null)
    return
  }

  const pos = screenPosition(i)

  if (!pos) {
    emit('hover', null)
    return
  }

  emit('hover', {
    ...pos,
    tier: tierOf(risk[i]),
    probability: risk[i],
    driver: DRIVERS[i % DRIVERS.length],
  })
}

function setPointerFromEvent(clientX: number, clientY: number) {
  const canvas = canvasRef.value

  if (!canvas) {
    return
  }

  const rect = canvas.getBoundingClientRect()

  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1

  pointerActive = true

  targetRotY = pointer.x * 0.22
  targetRotX = -pointer.y * 0.08
}

function onMouseMove(e: MouseEvent) {
  setPointerFromEvent(e.clientX, e.clientY)
}

function onMouseLeave() {
  pointerActive = false
  pointer.x = -10
  pointer.y = -10
  hoveredIndex = -1

  if (pinnedIndex === -1) {
    emit('hover', null)
  }
}

function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]

  if (!t) {
    return
  }

  setPointerFromEvent(t.clientX, t.clientY)

  requestAnimationFrame(() => {
    if (hoveredIndex >= 0) {
      pinnedIndex =
        pinnedIndex === hoveredIndex ? -1 : hoveredIndex
    }
  })
}

function onResize() {
  const canvas = canvasRef.value

  if (!canvas) {
    return
  }

  const w = canvas.clientWidth
  const h = canvas.clientHeight || 1

  camera.aspect = w / h
  camera.updateProjectionMatrix()

  renderer.setSize(w, h, false)
}

function animate(time: number) {
  rafId = requestAnimationFrame(animate)

  const delta = Math.min((time - prevTime) / 1000, 0.05)

  prevTime = time
  elapsed += delta

  if (!reduced) {
    autoRot += delta * 0.05

    curRotY += (targetRotY - curRotY) * 0.04
    curRotX += (targetRotX - curRotX) * 0.04

    customerGroup.rotation.y = autoRot + curRotY
    customerGroup.rotation.x = curRotX
    customerGroup.position.y = Math.sin(elapsed * 0.6) * 0.05
  }

  customerGroup.updateMatrixWorld()

  if (pointerActive) {
    raycaster.setFromCamera(pointer, camera)

    const hit = raycaster.intersectObject(points)[0]
    const idx = hit?.instanceId ?? -1

    if (idx !== hoveredIndex) {
      hoveredIndex = idx

      if (pinnedIndex === -1) {
        emitHover(idx >= 0 ? idx : -1)
      }
    }
  }

  const activeIndex =
    pinnedIndex >= 0 ? pinnedIndex : hoveredIndex

  if (pinnedIndex >= 0) {
    emitHover(pinnedIndex)
  }

  for (const [i, s] of scaleAnim) {
    s.current += (s.target - s.current) * 0.18

    setInstanceTransform(i, s.current)

    if (Math.abs(s.target - s.current) < 0.002) {
      s.current = s.target
      scaleAnim.delete(i)
    }
  }

  for (const [i, v] of colorAnim) {
    const target = i === activeIndex ? 1 : 0

    const next = v + (target - v) * 0.18

    tmpColor
      .copy(riskColor(risk[i]))
      .lerp(highlightColor, next)

    points.setColorAt(i, tmpColor)

    if (Math.abs(target - next) < 0.003) {
      colorAnim.delete(i)
      continue
    }

    colorAnim.set(i, next)
  }

  if (
    activeIndex >= 0 &&
    !colorAnim.has(activeIndex)
  ) {
    colorAnim.set(activeIndex, 0)
  }

  if (
    activeIndex >= 0 &&
    !scaleAnim.has(activeIndex)
  ) {
    scaleAnim.set(activeIndex, {
      current: baseScales[activeIndex],
      target: baseScales[activeIndex] * 1.8,
    })
  }

  points.instanceMatrix.needsUpdate = true

  if (points.instanceColor) {
    points.instanceColor.needsUpdate = true
  }

  beams.forEach((b) => {
    const t = (elapsed * 0.22 + b.offset) % 1

    b.pulse.position.lerpVectors(
      new THREE.Vector3(0, 0, 0),
      b.target,
      t,
    )

    b.pulse.scale.setScalar(
      0.5 + Math.sin(t * Math.PI) * 0.6,
    )
  })

  scene.children.forEach((child) => {
    if ((child as any).userData?.isCore) {
      child.rotation.y += delta * 0.15
    }

    if ((child as any).userData?.isShell) {
      child.rotation.y -= delta * 0.035
    }
  })

  renderer.render(scene, camera)
}

onMounted(() => {
  const canvas = canvasRef.value!

  const w = canvas.clientWidth || 600
  const h = canvas.clientHeight || 600

  const rand = mulberry32(20260926)

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2),
  )

  renderer.setSize(w, h, false)
  renderer.setClearColor(0x000000, 0)

  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  scene = new THREE.Scene()

  customerGroup = new THREE.Group()
  scene.add(customerGroup)

  camera = new THREE.PerspectiveCamera(
    42,
    w / h,
    0.1,
    100,
  )

  camera.position.set(0, 0, 7.4)
  camera.lookAt(0, 0, 0)

  scene.add(
    new THREE.AmbientLight(0x6688aa, 1.1),
  )

  const key = new THREE.DirectionalLight(
    0xe8f4ff,
    2.4,
  )

  key.position.set(2, 3, 4)
  scene.add(key)

  const coreLight = new THREE.PointLight(
    0x3b82f6,
    3,
    6,
  )

  scene.add(coreLight)

  // Customer points
  const geo = new THREE.IcosahedronGeometry(0.05, 1)

  const mat = new THREE.MeshBasicMaterial({
    toneMapped: false,
  })

  points = new THREE.InstancedMesh(
    geo,
    mat,
    COUNT,
  )

  points.instanceColor =
    new THREE.InstancedBufferAttribute(
      new Float32Array(COUNT * 3),
      3,
    )

  const golden =
    Math.PI * (3 - Math.sqrt(5))

  const riskSorted: {
    i: number
    r: number
  }[] = []

  for (let i = 0; i < COUNT; i++) {
    const y =
      1 - (i / (COUNT - 1)) * 2

    const r = Math.sqrt(1 - y * y)
    const theta = golden * i

    const pos = new THREE.Vector3(
      Math.cos(theta) * r,
      y,
      Math.sin(theta) * r,
    ).multiplyScalar(BASE_RADIUS)

    basePositions.push(pos)

    const raw = Math.pow(rand(), 2.1)

    risk.push(raw)
    riskSorted.push({
      i,
      r: raw,
    })

    baseScales.push(1)
  }

  riskSorted.sort((a, b) => b.r - a.r)

  for (
    let k = 0;
    k < SURFACE_COUNT;
    k++
  ) {
    surfaced.push(riskSorted[k].i)
  }

  for (let i = 0; i < COUNT; i++) {
    const isSurfaced =
      surfaced.includes(i)

    const pos = basePositions[i]

    if (isSurfaced) {
      pos.multiplyScalar(1.22)
    }

    const scale = isSurfaced
      ? 2.2
      : 0.55 + risk[i] * 0.7

    baseScales[i] = scale

    setInstanceTransform(i, scale)

    points.setColorAt(
      i,
      riskColor(risk[i]),
    )
  }

  points.instanceMatrix.needsUpdate = true

  if (points.instanceColor) {
    points.instanceColor.needsUpdate = true
  }

  customerGroup.add(points)

  // Model core
  const core = new THREE.Group()

  core.userData.isCore = true

  const coreGlass = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 2),
    new THREE.MeshPhysicalMaterial({
      color: 0x0a101d,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.85,
      thickness: 0.6,
      transparent: true,
    }),
  )

  core.add(coreGlass)

  const coreEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(
      new THREE.IcosahedronGeometry(0.64, 1),
    ),
    new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.6,
    }),
  )

  core.add(coreEdges)

  scene.add(core)

  coreLight.position.set(0, 0, 0)

  // Decision-boundary shell
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(
      new THREE.IcosahedronGeometry(
        BASE_RADIUS * 1.32,
        1,
      ),
    ),
    new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.1,
    }),
  )

  shell.userData.isShell = true

  scene.add(shell)

  // Beams from surfaced customers to the core
  const beamMat = new THREE.LineBasicMaterial({
    color: 0xff4d5e,
    transparent: true,
    opacity: 0.25,
  })

  const pulseGeo =
    new THREE.IcosahedronGeometry(0.035, 0)

  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0xff4d5e,
    toneMapped: false,
  })

  surfaced.forEach((i, k) => {
    const target =
      basePositions[i].clone()

    const lineGeo =
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        target,
      ])

    const line = new THREE.Line(
      lineGeo,
      beamMat,
    )

    customerGroup.add(line)

    const pulse = new THREE.Mesh(
      pulseGeo,
      pulseMat,
    )

    customerGroup.add(pulse)

    beams.push({
      line,
      pulse,
      target,
      offset: k / SURFACE_COUNT,
    })
  })

  prevTime = performance.now()
  animate(prevTime)

  window.addEventListener(
    'mousemove',
    onMouseMove,
    { passive: true },
  )

  window.addEventListener(
    'resize',
    onResize,
    { passive: true },
  )

  canvas.addEventListener(
    'mouseleave',
    onMouseLeave,
    { passive: true },
  )

  canvas.addEventListener(
    'touchstart',
    onTouchStart,
    { passive: true },
  )
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)

  window.removeEventListener(
    'mousemove',
    onMouseMove,
  )

  window.removeEventListener(
    'resize',
    onResize,
  )

  const canvas = canvasRef.value

  if (canvas) {
    canvas.removeEventListener(
      'mouseleave',
      onMouseLeave,
    )

    canvas.removeEventListener(
      'touchstart',
      onTouchStart,
    )
  }

  if (points) {
    points.geometry.dispose()

    if (Array.isArray(points.material)) {
      points.material.forEach((material) =>
        material.dispose(),
      )
    } else {
      points.material.dispose()
    }
  }

  renderer?.dispose()
})
</script>

<template>
  <div class="hero-scene">
    <canvas
      ref="canvasRef"
      class="hero-scene__canvas"
    />
  </div>
</template>

<style scoped>
.hero-scene {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  overflow: hidden;
}

.hero-scene__canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
}
</style>
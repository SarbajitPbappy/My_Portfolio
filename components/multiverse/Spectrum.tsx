'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  EdgesGeometry,
  FogExp2,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  Quaternion,
  Scene,
  ShaderMaterial,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import SectionRail from '@/components/SectionRail'
import { RAYS, SECTIONS } from './palette'

/**
 * Multiverse theme background. The hero is a physically rendered glass prism
 * splitting one beam into seven rays, one per homepage section. Scrolling
 * lowers the camera through a field of slowly turning iridescent crystals,
 * each tinted with its section's colour, over a dim nebula that takes on the
 * current section's colours. Everything is kept dim so the content stays the
 * brightest thing on screen.
 */

const BG = '#06070b'
const RADIUS = 1.35 // prism circumradius
const DEPTH = 1.7 // prism length along z
const RAY_LENGTH = 30
const SPACING = 9 // world units of camera travel per section
const UP = new Vector3(0, 1, 0)

const RAY_VERTEX = /* glsl */ `
uniform float uLength;
varying float vT;
varying vec3 vN;
varying vec3 vView;
void main() {
  vT = position.y / uLength;
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`
const CORE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;
varying float vT;
void main() {
  float fade = pow(1.0 - vT, 1.8);
  float pulse = 0.85 + 0.15 * sin(vT * 60.0 - uTime * 4.0);
  gl_FragColor = vec4(uColor * uIntensity * fade * pulse, 1.0);
}
`
const SHEATH_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying float vT;
varying vec3 vN;
varying vec3 vView;
void main() {
  float facing = pow(abs(dot(vN, vView)), 2.5);
  float fade = pow(1.0 - vT, 2.2);
  gl_FragColor = vec4(uColor, facing * fade * 0.06 * uIntensity);
}
`
// soft coloured clouds far behind everything; never brighter than ~15%
const NEBULA_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const NEBULA_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec3 uA;
uniform vec3 uB;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main() {
  vec2 p = vUv * vec2(3.2, 1.9) + vec2(0.0, uScroll * 0.08);
  float n = fbm(p + vec2(uTime * 0.015, uTime * 0.01));
  float m = fbm(p * 1.6 - vec2(uTime * 0.012, 0.0) + n * 1.4);
  vec3 col = mix(uA, uB, smoothstep(0.3, 0.75, m));
  float edge = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
  float a = smoothstep(0.42, 0.95, n * 0.55 + m * 0.6) * 0.15 * edge;
  gl_FragColor = vec4(col, a);
}
`
const DUST_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uSize;
attribute float aSeed;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.y += sin(uTime * 0.2 + aSeed * 40.0) * 0.4;
  p.x += cos(uTime * 0.15 + aSeed * 23.0) * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.4 + aSeed) * (12.0 / -mv.z);
  vAlpha = 0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0));
}
`
const DUST_FRAGMENT = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), pow(1.0 - d * 2.0, 2.0) * vAlpha * 0.28);
}
`

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

export default function Spectrum() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [present, setPresent] = useState(0)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    // fresh canvas per mount (StrictMode remounts)
    const canvas = document.createElement('canvas')
    canvas.className = 'block h-full w-full'
    host.appendChild(canvas)

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    } catch {
      canvas.remove()
      return
    }
    const small = Math.min(window.innerWidth, window.innerHeight) < 700
    let pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5)
    renderer.setPixelRatio(pixelRatio)
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.9

    const scene = new Scene()
    scene.background = new Color(BG)
    scene.fog = new FogExp2(BG, 0.028)
    const pmrem = new PMREMGenerator(renderer)
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envTarget.texture
    const camera = new PerspectiveCamera(35, 1, 0.1, 200)
    scene.add(camera) // the nebula rides with the camera

    const disposables: { dispose: () => void }[] = [pmrem, envTarget]
    const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x)

    // ---- light: a soft key light that takes the current section's colour ----
    const key = new DirectionalLight('#ffffff', 1.4)
    key.position.set(6, 8, 10)
    scene.add(key, key.target, new AmbientLight('#8090ff', 0.12))

    // ---- the prism (hero) ----
    const rig = new Group()
    scene.add(rig)
    const prismGeo = track(new CylinderGeometry(RADIUS, RADIUS, DEPTH, 3, 1))
    prismGeo.rotateX(-Math.PI / 2) // triangle faces the camera, apex up
    const glass = track(
      new MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.03,
        metalness: 0,
        transmission: 1,
        thickness: 1.4,
        ior: 1.55,
        dispersion: 7,
        iridescence: 0.35,
        iridescenceIOR: 1.3,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.1,
        attenuationColor: new Color('#d6dcff'),
        attenuationDistance: 5,
      })
    )
    const prism = new Mesh(prismGeo, glass)
    rig.add(prism)
    prism.add(
      new LineSegments(
        track(new EdgesGeometry(prismGeo)),
        track(new LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, blending: AdditiveBlending, depthWrite: false }))
      )
    )
    const halo = new Mesh(
      track(new TorusGeometry(2.1, 0.01, 8, 220)),
      track(new MeshBasicMaterial({ color: new Color('#8ea2ff').multiplyScalar(0.55), toneMapped: false }))
    )
    halo.position.z = -2.6
    rig.add(halo)

    const leftFace = new Vector3(-0.433 * RADIUS, 0.25 * RADIUS, 0)
    const rightFace = new Vector3(0.433 * RADIUS, 0.25 * RADIUS, 0)

    // ---- beams ----
    type Beam = { core: Mesh; sheath: Mesh; uniforms: Record<string, { value: unknown }> }
    const coreGeo = track(new CylinderGeometry(0.02, 0.02, RAY_LENGTH, 8, 1, true))
    coreGeo.translate(0, RAY_LENGTH / 2, 0)
    const sheathGeo = track(new CylinderGeometry(0.16, 0.16, RAY_LENGTH, 16, 1, true))
    sheathGeo.translate(0, RAY_LENGTH / 2, 0)
    const time = { value: 0 }

    // each beam starts at the glass and fades with distance
    const makeBeam = (color: string): Beam => {
      const uniforms = { uColor: { value: new Color(color) }, uIntensity: { value: 1 }, uLength: { value: RAY_LENGTH }, uTime: time }
      const core = new Mesh(coreGeo, track(new ShaderMaterial({ uniforms, vertexShader: RAY_VERTEX, fragmentShader: CORE_FRAGMENT })))
      const sheath = new Mesh(
        sheathGeo,
        track(
          new ShaderMaterial({
            uniforms,
            vertexShader: RAY_VERTEX,
            fragmentShader: SHEATH_FRAGMENT,
            transparent: true,
            blending: AdditiveBlending,
            depthWrite: false,
          })
        )
      )
      core.frustumCulled = sheath.frustumCulled = false
      rig.add(core, sheath)
      return { core, sheath, uniforms }
    }
    const incoming = makeBeam('#ffffff')
    // the incoming beam is short, so its tail never trails across the sections below
    incoming.core.scale.y = incoming.sheath.scale.y = 0.4
    const rays = RAYS.map((r) => makeBeam(r.color))
    const quat = new Quaternion()
    const aim = (beam: Beam, from: Vector3, dir: Vector3) => {
      quat.setFromUnitVectors(UP, dir)
      for (const m of [beam.core, beam.sheath]) {
        m.position.copy(from)
        m.quaternion.copy(quat)
      }
    }

    // ---- crystals: one small constellation per section, at varied depths ----
    const crystalGeos = [
      track(new IcosahedronGeometry(1, 0)),
      track(new OctahedronGeometry(1, 0)),
      track(new DodecahedronGeometry(0.95, 0)),
      track(new TorusKnotGeometry(0.62, 0.2, 110, 14)),
      track(new TorusGeometry(0.75, 0.28, 16, 60)),
      (() => {
        const g = track(new CylinderGeometry(0.85, 0.85, 1.1, 3, 1))
        g.rotateX(-Math.PI / 2)
        return g
      })(),
    ]
    const wide = () => window.innerWidth >= 1024 && window.innerWidth / window.innerHeight > 1.1
    type Crystal = { mesh: Mesh; base: Vector3; spin: Vector3; phase: number; side: number }
    const crystals: Crystal[] = []
    const perSection = small ? 2 : 3
    let g = 0
    RAYS.forEach((ray, s) => {
      const tint = new Color(ray.color)
      const mat = track(
        new MeshPhysicalMaterial({
          color: tint.clone().multiplyScalar(0.55),
          roughness: 0.2,
          metalness: 0.15,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          iridescence: 0.75,
          iridescenceIOR: 1.45,
          envMapIntensity: 0.6,
          emissive: tint,
          emissiveIntensity: 0.05,
          flatShading: true,
        })
      )
      for (let k = 0; k < perSection; k++) {
        const mesh = new Mesh(crystalGeos[g++ % crystalGeos.length], mat)
        const side = (s + k) % 2 === 0 ? 1 : -1
        const depth = Math.random()
        const base = new Vector3(
          side * (6.4 + Math.random() * 3.6),
          -(s + 1) * SPACING + (k - (perSection - 1) / 2) * 3.4 + (Math.random() - 0.5) * 1.6,
          -1.5 - depth * 8
        )
        mesh.scale.setScalar(0.65 + depth * 0.9 + Math.random() * 0.3)
        mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6)
        scene.add(mesh)
        crystals.push({
          mesh,
          base,
          spin: new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.35),
          phase: Math.random() * 10,
          side,
        })
      }
    })

    // ---- nebula behind everything, parented to the camera ----
    const nebulaUniforms = { uTime: time, uScroll: { value: 0 }, uA: { value: new Color() }, uB: { value: new Color() } }
    const nebula = new Mesh(
      track(new PlaneGeometry(1, 1)),
      track(
        new ShaderMaterial({
          uniforms: nebulaUniforms,
          vertexShader: NEBULA_VERTEX,
          fragmentShader: NEBULA_FRAGMENT,
          transparent: true,
          depthWrite: false,
          fog: false,
        })
      )
    )
    nebula.position.z = -60
    nebula.renderOrder = -1
    camera.add(nebula)

    // ---- dust ----
    const dustCount = small ? 450 : 1100
    const dustPos = new Float32Array(dustCount * 3)
    const dustSeed = new Float32Array(dustCount)
    for (let i = 0; i < dustCount; i++) {
      dustPos.set([-14 + Math.random() * 28, 6 - Math.random() * (SPACING * 8 + 10), -12 + Math.random() * 14], i * 3)
      dustSeed[i] = Math.random()
    }
    const dustGeo = track(new BufferGeometry())
    dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3))
    dustGeo.setAttribute('aSeed', new BufferAttribute(dustSeed, 1))
    const dustUniforms = { uTime: time, uSize: { value: 2 * pixelRatio } }
    const dust = new Points(
      dustGeo,
      track(new ShaderMaterial({ uniforms: dustUniforms, vertexShader: DUST_VERTEX, fragmentShader: DUST_FRAGMENT, transparent: true, blending: AdditiveBlending, depthWrite: false }))
    )
    dust.frustumCulled = false
    scene.add(dust)

    // ---- post: a gentle bloom on the beams only ----
    const composer = new EffectComposer(renderer)
    composer.setPixelRatio(pixelRatio)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.4, 0.4, 0.82)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    let useBloom = true

    // ---- state ----
    const palette = SECTIONS.map((s) => new Color(s.color))
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
    let progress = 0
    let clock = 0
    let lastMask = -1
    let lastActive = -1
    const tmp = new Vector3()
    const keyColor = new Color()
    const white = new Color('#ffffff')

    // float section index: k exactly when section k's top reaches the top of the viewport
    const sectionPos = () => {
      const tops: { i: number; top: number }[] = []
      let mask = 0
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.height > 0) {
          tops.push({ i, top: r.top })
          mask |= 1 << i
        }
      })
      if (tops.length < 2) {
        const max = document.documentElement.scrollHeight - window.innerHeight
        return { p: (max > 0 ? window.scrollY / max : 0) * (SECTIONS.length - 1), mask: 0 }
      }
      let k = 0
      for (let j = 0; j < tops.length; j++) if (tops[j].top <= 1) k = j
      const next = tops[k + 1]
      const frac = next ? Math.min(1, Math.max(0, (1 - tops[k].top) / (next.top - tops[k].top))) : 0
      return { p: tops[k].i + (next ? (next.i - tops[k].i) * frac : 0), mask }
    }

    const update = (dt: number) => {
      const { p, mask } = sectionPos()
      if (mask !== lastMask) {
        lastMask = mask
        setPresent(mask)
      }
      const nearest = Math.round(p)
      if (nearest !== lastActive) {
        lastActive = nearest
        setActive(nearest)
      }
      progress = reduce ? p : progress + (p - progress) * (1 - Math.exp(-dt * 3.5))
      if (!reduce) {
        const f = 1 - Math.exp(-dt * 2.5)
        mouse.sx += (mouse.x - mouse.sx) * f
        mouse.sy += (mouse.y - mouse.sy) * f
      }

      const isWide = wide()
      rig.position.set(isWide ? 3.1 : 0.4, isWide ? 0.5 : -3.3, 0)
      rig.scale.setScalar(isWide ? 1 : 0.72)
      prism.rotation.set(mouse.sy * 0.12, Math.sin(clock * 0.3) * 0.12 + mouse.sx * 0.25, 0)

      // beams: the cursor steers the incoming light and the spectrum swings with it
      const tilt = mouse.sy * 0.06
      aim(incoming, leftFace, tmp.set(-0.35, -0.18 - tilt * 2.5, -1).normalize())
      rays.forEach((ray, i) => {
        const a = -(0.14 + (RAYS.length - 1 - i) * 0.075) + tilt // red least bent, violet most
        aim(ray, rightFace, tmp.set(Math.cos(a), Math.sin(a), (i - 3) * 0.035).normalize())
        ray.uniforms.uIntensity.value = 1.2
      })
      incoming.uniforms.uIntensity.value = 1.3

      // crystals drift and turn; on narrow screens they tuck in behind the content
      crystals.forEach((c) => {
        c.mesh.rotation.x += c.spin.x * dt
        c.mesh.rotation.y += c.spin.y * dt
        c.mesh.rotation.z += c.spin.z * dt
        const x = isWide ? c.base.x : c.side * (2.4 + Math.abs(c.base.x) * 0.2)
        c.mesh.position.set(x, c.base.y + Math.sin(clock * 0.4 + c.phase) * 0.3, c.base.z)
      })

      // camera descends one SPACING per section
      const camY = -progress * SPACING
      camera.position.set(mouse.sx * 0.7, camY + mouse.sy * 0.45, 14)
      camera.lookAt(mouse.sx * 0.25, camY, 0)

      // the key light and the nebula take on the current section's colours
      const k = Math.min(SECTIONS.length - 1, Math.max(0, Math.floor(progress)))
      const t = Math.min(1, Math.max(0, progress - k))
      const k2 = Math.min(SECTIONS.length - 1, k + 1)
      keyColor.copy(palette[k]).lerp(palette[k2], t)
      key.color.copy(keyColor).lerp(white, 0.35)
      key.position.set(6, camY + 8, 10)
      key.target.position.set(0, camY, 0)
      nebulaUniforms.uA.value.copy(palette[Math.max(1, k)]).lerp(palette[Math.max(1, k2)], t)
      nebulaUniforms.uB.value.copy(palette[Math.min(SECTIONS.length - 1, Math.max(1, k) + 1)])
      nebulaUniforms.uScroll.value = progress
      bloom.strength = 0.4 - 0.2 * smooth(progress)

      halo.rotation.z = clock * 0.05
      time.value = clock
    }

    const render = () => {
      if (useBloom) composer.render()
      else renderer.render(scene, camera)
    }

    let raf = 0
    let last = performance.now()
    let perfFrames = 0
    let perfTime = 0
    let perfChecked = false
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      clock += dt
      update(dt)
      render()
      // weak GPU: drop bloom and resolution once
      if (!perfChecked && clock > 1) {
        perfFrames++
        perfTime += dt
        if (clock > 4) {
          perfChecked = true
          if (perfTime / perfFrames > 1 / 40) {
            useBloom = false
            pixelRatio = 1
            renderer.setPixelRatio(1)
            resize()
          }
        }
      }
      raf = requestAnimationFrame(frame)
    }
    let staticPending = false
    const renderStatic = () => {
      if (staticPending) return
      staticPending = true
      requestAnimationFrame(() => {
        staticPending = false
        update(0)
        render()
      })
    }

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      composer.setSize(w, h)
      bloom.resolution.set(w / 2, h / 2)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      // the nebula plane always covers the view at its distance
      const halfH = 60 * Math.tan((camera.fov * Math.PI) / 360)
      nebula.scale.set(halfH * 2 * camera.aspect * 1.15, halfH * 2 * 1.15, 1)
      dustUniforms.uSize.value = 2 * pixelRatio
      if (reduce) renderStatic()
    }
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = 1 - (e.clientY / window.innerHeight) * 2
    }
    const onContextLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
    }

    resize()
    if (reduce) renderStatic()
    else raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    if (reduce) window.addEventListener('scroll', renderStatic, { passive: true })
    canvas.addEventListener('webglcontextlost', onContextLost)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', renderStatic)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      disposables.forEach((d) => d.dispose())
      composer.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [reduce])

  return (
    <>
      <div ref={hostRef} aria-hidden className="fixed inset-0 -z-10 pointer-events-none" />
      <SectionRail
        items={SECTIONS.map((s) => ({ id: s.id, label: s.label, name: s.label }))}
        present={present}
        active={active}
        reduce={reduce}
      />
    </>
  )
}

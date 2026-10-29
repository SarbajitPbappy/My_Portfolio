'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import SectionRail from './SectionRail'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  Vector4,
  WebGLRenderer,
} from 'three'

/**
 * "Latent Space" theme background: one GPU particle field that morphs into a
 * different 3D sculpture for each homepage section as the visitor scrolls.
 *
 * Every sculpture is stored in the same geometry as its own vertex attribute,
 * and the vertex shader blends them with per-section weights — so morphing,
 * orbiting, the cursor force field and the click shockwave all run on the GPU.
 * Loaded lazily by ThemeBackground, so no other theme downloads three.js.
 */

type Vec3 = [number, number, number]

interface SceneDef {
  id: string
  label: string
  name: string
  /** Where the sculpture sits on wide screens, in NDC (-1..1). */
  anchor: [number, number]
  size: number
  dark: [string, string]
  light: [string, string]
}

const SCENES: SceneDef[] = [
  { id: 'home', label: 'Home', name: 'Singularity', anchor: [0.45, 0], size: 1, dark: ['#38bdf8', '#c084fc'], light: ['#0284c7', '#7c3aed'] },
  { id: 'about', label: 'About', name: 'Genome', anchor: [-0.55, 0], size: 0.95, dark: ['#f472b6', '#818cf8'], light: ['#db2777', '#4f46e5'] },
  { id: 'education', label: 'Education', name: 'Cosmos', anchor: [0.5, 0], size: 1.05, dark: ['#fbbf24', '#f472b6'], light: ['#d97706', '#db2777'] },
  { id: 'skills', label: 'Skills', name: 'Feature Maps', anchor: [0.52, -0.05], size: 0.82, dark: ['#22d3ee', '#34d399'], light: ['#0891b2', '#059669'] },
  { id: 'experience', label: 'Experience', name: 'Trajectory', anchor: [-0.5, 0], size: 0.95, dark: ['#a78bfa', '#22d3ee'], light: ['#7c3aed', '#0891b2'] },
  { id: 'research', label: 'Research', name: 'Vision', anchor: [0.5, 0], size: 1, dark: ['#2dd4bf', '#6366f1'], light: ['#0d9488', '#4f46e5'] },
  { id: 'projects', label: 'Projects', name: 'Federation', anchor: [-0.5, 0], size: 1, dark: ['#60a5fa', '#a3e635'], light: ['#2563eb', '#65a30d'] },
  { id: 'contact', label: 'Contact', name: 'Signal', anchor: [0, -0.4], size: 1.5, dark: ['#e879f9', '#22d3ee'], light: ['#c026d3', '#0891b2'] },
]

const TAU = Math.PI * 2
const CAM_Z = 12

// ---- shape samplers (each returns one random point; extents roughly ±1) ----

const rnd = Math.random
const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5

const sphere = (): Vec3 => {
  const z = rnd() * 2 - 1
  const a = rnd() * TAU
  const r = Math.sqrt(1 - z * z)
  return [r * Math.cos(a), r * Math.sin(a), z]
}

// Home: a planet with a Saturn-style ring. The profile photo sits at its core
// (radius ≈ 0.39), so the shell reads as a glowing halo around the photo.
const planet = (): Vec3 => {
  const r = rnd()
  if (r < 0.42) {
    const [x, y, z] = sphere()
    const k = 0.42 + rnd() ** 4 * 0.05
    return [x * k, y * k, z * k]
  }
  const a = rnd() * TAU
  if (r < 0.95) {
    let rad = 0.5 + rnd() * 0.28
    if (rad > 0.63 && rad < 0.655) rad += 0.03 // Cassini-style gap
    return [Math.cos(a) * rad, gauss() * 0.006, Math.sin(a) * rad]
  }
  const rad = 0.8 + rnd() * 0.35
  return [Math.cos(a) * rad, gauss() * 0.04, Math.sin(a) * rad]
}

// About: DNA double helix with base-pair rungs.
const helix = (): Vec3 => {
  const r = rnd()
  const R = 0.3
  const turns = TAU * 1.15
  if (r < 0.58) {
    const y = rnd() * 2 - 1
    const a = y * turns + (rnd() < 0.5 ? 0 : Math.PI)
    return [Math.cos(a) * R + gauss() * 0.015, y, Math.sin(a) * R + gauss() * 0.015]
  }
  if (r < 0.9) {
    const y = ((Math.floor(rnd() * 30) + 0.5) / 30) * 2 - 1
    const a = y * turns
    const t = rnd() * 2 - 1
    return [Math.cos(a) * R * t, y, Math.sin(a) * R * t]
  }
  const a = rnd() * TAU
  const rad = 0.45 + rnd() * 0.35
  return [Math.cos(a) * rad, (rnd() * 2 - 1) * 1.1, Math.sin(a) * rad]
}

// Education: four-armed spiral galaxy with a bright bulge.
const galaxy = (): Vec3 => {
  if (rnd() < 0.16) {
    const [x, y, z] = sphere()
    const k = rnd() ** 2 * 0.2
    return [x * k, y * k * 0.6, z * k]
  }
  const arm = Math.floor(rnd() * 4)
  const rad = 0.08 + rnd() ** 1.4 * 0.92
  const a = (arm * TAU) / 4 + rad * 3.4 + gauss() * 0.35
  return [Math.cos(a) * rad + gauss() * 0.03, gauss() * 0.035 * (1 - rad * 0.7), Math.sin(a) * rad + gauss() * 0.03]
}

// Skills: CNN feature maps — shrinking stacks of channels joined by frustum edges.
const LAYERS = [
  { x: -0.95, h: 0.62, d: 3, p: 0.3 },
  { x: -0.45, h: 0.48, d: 4, p: 0.25 },
  { x: 0.02, h: 0.36, d: 5, p: 0.2 },
  { x: 0.42, h: 0.25, d: 6, p: 0.15 },
  { x: 0.78, h: 0.14, d: 7, p: 0.1 },
]
const cnnRaw = (): Vec3 => {
  if (rnd() < 0.8) {
    let pick = rnd()
    const L = LAYERS.find((l) => (pick -= l.p) < 0) ?? LAYERS[0]
    const grid = 14
    const cell = () => ((Math.floor(rnd() * grid) + 0.5) / grid) * 2 - 1
    const ch = Math.floor(rnd() * L.d)
    return [L.x + (ch - (L.d - 1) / 2) * 0.035, cell() * L.h + gauss() * 0.004, cell() * L.h + gauss() * 0.004]
  }
  const i = Math.floor(rnd() * 4)
  const A = LAYERS[i]
  const B = LAYERS[i + 1]
  const t = rnd()
  const h = A.h + (B.h - A.h) * t
  return [A.x + (B.x - A.x) * t, h * (rnd() < 0.5 ? -1 : 1), h * (rnd() < 0.5 ? -1 : 1)]
}
const cnn = (): Vec3 => {
  const [x, y, z] = cnnRaw()
  // fixed three-quarter view so the stack reads as 3D
  const cy = Math.cos(-0.55), sy = Math.sin(-0.55)
  const x1 = cy * x + sy * z
  const z1 = -sy * x + cy * z
  const cx = Math.cos(0.2), sx = Math.sin(0.2)
  return [x1, cx * y - sx * z1, sx * y + cx * z1]
}

// Experience: a (2,3) torus knot tube.
const knotAt = (u: number): Vec3 => {
  const r = Math.cos(3 * u) + 2
  return [(r * Math.cos(2 * u)) / 3.1, (r * Math.sin(2 * u)) / 3.1, -Math.sin(3 * u) / 3.1]
}
const knot = (): Vec3 => {
  const u = rnd() * TAU
  const c = knotAt(u)
  const n = knotAt(u + 0.001)
  let tx = n[0] - c[0], ty = n[1] - c[1], tz = n[2] - c[2]
  const tl = Math.hypot(tx, ty, tz)
  tx /= tl; ty /= tl; tz /= tl
  // normal = T × ẑ, binormal = T × normal
  let nx = ty, ny = -tx
  const nl = Math.hypot(nx, ny)
  nx /= nl; ny /= nl
  const bx = -tz * ny, by = tz * nx, bz = tx * ny - ty * nx
  const a = rnd() * TAU
  const rr = 0.075 * (0.8 + rnd() * 0.2)
  const ca = Math.cos(a) * rr, sa = Math.sin(a) * rr
  return [c[0] + nx * ca + bx * sa, c[1] + ny * ca + by * sa, c[2] + bz * sa]
}

// Research: an eye — computer vision. Iris fibres, limbus, pupil rim and a glint.
const eye = (): Vec3 => {
  const r = rnd()
  const Z = 0.6
  if (r < 0.34) {
    let p = sphere()
    while (p[2] > 0 && Math.hypot(p[0], p[1]) < 0.625) p = sphere()
    return [p[0] * 0.8, p[1] * 0.8, p[2] * 0.8]
  }
  if (r < 0.96) {
    let rho: number
    let a: number
    if (r < 0.8) {
      a = ((Math.floor(rnd() * 110) + gauss() * 0.2) / 110) * TAU
      rho = 0.15 + rnd() ** 0.8 * 0.35
    } else {
      a = rnd() * TAU
      rho = r < 0.9 ? 0.5 + gauss() * 0.012 : 0.15 - Math.abs(gauss()) * 0.012
    }
    return [Math.cos(a) * rho, Math.sin(a) * rho, Z + (0.5 - rho) * 0.08]
  }
  return [-0.17 + gauss() * 0.03, 0.2 + gauss() * 0.03, 0.82]
}

// Projects: federated learning — a globe, orbiting clients and their update links.
const CLIENTS: Vec3[] = Array.from({ length: 6 }, (_, k) => {
  const a = (k / 6) * TAU + 0.3
  return [Math.cos(a), Math.sin(k * 1.7) * 0.18, Math.sin(a)]
})
const federated = (): Vec3 => {
  const r = rnd()
  const R = 0.5
  const onGlobe = (lat: number, lon: number): Vec3 => [
    Math.cos(lat) * Math.cos(lon) * R,
    Math.sin(lat) * R,
    Math.cos(lat) * Math.sin(lon) * R,
  ]
  if (r < 0.22) return onGlobe(((Math.floor(rnd() * 9) + 0.5) / 9 - 0.5) * Math.PI * 0.95, rnd() * TAU)
  if (r < 0.42) return onGlobe((rnd() - 0.5) * Math.PI, (Math.floor(rnd() * 12) / 12) * TAU)
  if (r < 0.5) {
    const [x, y, z] = sphere()
    return [x * R, y * R, z * R]
  }
  const c = CLIENTS[Math.floor(rnd() * CLIENTS.length)]
  if (r < 0.72) {
    const [x, y, z] = sphere()
    return [c[0] + x * 0.075, c[1] + y * 0.075, c[2] + z * 0.075]
  }
  const cl = Math.hypot(c[0], c[1], c[2])
  const t = rnd()
  const k = 1 - t + (t * R) / cl
  return [c[0] * k + gauss() * 0.004, c[1] * k + gauss() * 0.004, c[2] * k + gauss() * 0.004]
}

// Contact: a rippling signal terrain (the shader animates the waves).
const terrain = (): Vec3 => {
  const rows = 46
  const z = (Math.floor(rnd() * rows) / (rows - 1)) * 2.4 - 1.2
  const x = rnd() * 2.4 - 1.2
  const y = 0.1 * Math.sin(x * 3.1 + z * 1.3) + 0.07 * Math.cos(z * 4 - x * 1.7) + 0.32 * Math.exp(-(x * x + z * z) * 2.6)
  return [x, y, z]
}

const SHAPES = [planet, helix, galaxy, cnn, knot, eye, federated, terrain]

const fill = (n: number, sample: () => Vec3) => {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) out.set(sample(), i * 3)
  return out
}

const hexToRgb = (hex: string): Vec3 => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

// ---- shaders ----

const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uW[8];
uniform float uScatter;
uniform float uIntro;
uniform float uSize;
uniform float uAlpha;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uHot;
uniform vec3 uMouse;   // xy: cursor on the z=0 plane (world), z: strength
uniform vec4 uShock;   // xy: origin (world), z: age in seconds, w: strength
attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec3 aP5;
attribute vec3 aP6;
attribute vec3 aP7;
attribute vec4 aRand;  // xyz: unit scatter direction, w: 0..1 seed
varying vec3 vColor;
varying float vAlpha;

vec2 rot(vec2 v, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

void main() {
  float t = uTime;
  vec3 p = vec3(0.0);

  if (uW[0] > 0.001) { // planet: Keplerian ring, inner orbits faster
    vec3 q = position;
    q.xz = rot(q.xz, t * 0.12 / max(length(q.xz), 0.3));
    q.yz = rot(q.yz, 0.38);
    q.xy = rot(q.xy, -0.38);
    p += q * uW[0];
  }
  if (uW[1] > 0.001) { // helix spins on its axis
    vec3 q = aP1;
    q.xz = rot(q.xz, t * 0.45);
    q.xy = rot(q.xy, 0.35);
    p += q * uW[1];
  }
  if (uW[2] > 0.001) { // galaxy: rigid spin (differential would wind the arms up), tilted toward the viewer
    vec3 q = aP2;
    q.xz = rot(q.xz, t * 0.09);
    q.yz = rot(q.yz, 1.0);
    q.xy = rot(q.xy, 0.35);
    p += q * uW[2];
  }
  if (uW[3] > 0.001) { // feature maps sway
    vec3 q = aP3;
    q.xz = rot(q.xz, sin(t * 0.25) * 0.25);
    p += q * uW[3];
  }
  if (uW[4] > 0.001) { // knot tumbles
    vec3 q = aP4;
    q.xz = rot(q.xz, t * 0.22);
    q.yz = rot(q.yz, t * 0.13);
    p += q * uW[4];
  }
  if (uW[5] > 0.001) { // eye: the pupil breathes, limbus stays put
    vec3 q = aP5;
    float rho = length(q.xy);
    if (q.z > 0.55 && q.z < 0.7 && rho > 0.05) {
      float pupil = 0.15 * (1.0 + 0.18 * sin(t * 0.9));
      q.xy *= mix(pupil, 0.5, (rho - 0.15) / 0.35) / rho;
    }
    p += q * uW[5];
  }
  if (uW[6] > 0.001) { // federated globe turns, clients orbit with it
    vec3 q = aP6;
    q.xz = rot(q.xz, t * 0.18);
    q.yz = rot(q.yz, 0.32);
    p += q * uW[6];
  }
  if (uW[7] > 0.001) { // terrain: travelling waves
    vec3 q = aP7;
    q.y += 0.05 * sin(q.x * 4.0 + t * 1.2) + 0.04 * cos(q.z * 5.0 - t * 0.9);
    q.yz = rot(q.yz, 0.5);
    p += q * uW[7];
  }

  float k = clamp(0.5 + p.y * 0.55 + (aRand.w - 0.5) * 0.6, 0.0, 1.0);

  // idle drift, then the morph explosion / intro assembly
  p += 0.012 * vec3(sin(t * 0.7 + aRand.w * 40.0), cos(t * 0.6 + aRand.w * 31.0), sin(t * 0.5 + aRand.w * 23.0));
  p += aRand.xyz * (uScatter * (0.35 + aRand.w * 0.9) + uIntro * (1.5 + aRand.w * 3.0));
  p.xz = rot(p.xz, uScatter * (aRand.w - 0.5) * 2.0);

  vec4 world = modelMatrix * vec4(p, 1.0);
  float glow = 0.0;

  vec2 dm = world.xy - uMouse.xy;
  float md = length(dm);
  float mf = uMouse.z * smoothstep(1.8, 0.0, md);
  world.xy += dm / max(md, 0.001) * mf * 0.9;
  world.z += mf * 1.2;
  glow += mf;

  if (uShock.w > 0.0) {
    vec2 ds = world.xy - uShock.xy;
    float sd = length(ds);
    float band = exp(-pow((sd - uShock.z * 8.0) * 1.4, 2.0)) * uShock.w;
    world.xy += ds / max(sd, 0.001) * band * 0.8;
    world.z += band * 1.5;
    glow += band * 1.4;
  }

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.5 + aRand.w) * (1.0 + glow * 0.8) * (${CAM_Z.toFixed(1)} / -mv.z);

  vColor = mix(mix(uColorA, uColorB, k), uHot, clamp(glow * 0.7, 0.0, 1.0));
  vAlpha = uAlpha * (0.65 + 0.35 * sin(t * (1.0 + aRand.w * 2.0) + aRand.w * 60.0)) * (1.0 - uIntro * 0.6);
}
`

const STAR_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uAlpha;
uniform vec3 uColor;
attribute float aSeed;
varying vec3 vColor;
varying float vAlpha;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * (0.4 + aSeed);
  vColor = uColor;
  vAlpha = uAlpha * (0.4 + 0.6 * sin(uTime * (0.5 + aSeed) + aSeed * 80.0));
}
`

const FRAGMENT = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, pow(1.0 - d * 2.0, 1.6) * vAlpha);
}
`

const SPOTLIGHT = '.card, .frosted-card, .bg-theme-surface:not(section)'

export default function LatentSpace({ dark }: { dark: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const darkRef = useRef(dark)
  const applyModeRef = useRef<() => void>(() => {})
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [present, setPresent] = useState(0) // bitmask of homepage sections found

  useEffect(() => {
    darkRef.current = dark
    applyModeRef.current()
  }, [dark])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    // A fresh canvas per mount: StrictMode remounts would otherwise reuse a
    // canvas whose context was already handed to a disposed renderer.
    const canvas = document.createElement('canvas')
    canvas.className = 'block w-full h-full'
    host.appendChild(canvas)

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' })
    } catch {
      // No WebGL: the theme's CSS background still carries the look.
      canvas.remove()
      return
    }

    const small = Math.min(window.innerWidth, window.innerHeight) < 700
    const count = small ? 9000 : (navigator.hardwareConcurrency || 4) >= 8 ? 26000 : 16000
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0x000000, 0)

    const scene = new Scene()
    const camera = new PerspectiveCamera(40, 1, 0.1, 200)
    camera.position.set(0, 0, CAM_Z)

    // sculpture particles
    const geometry = new BufferGeometry()
    SHAPES.forEach((sample, i) => {
      geometry.setAttribute(i === 0 ? 'position' : `aP${i}`, new BufferAttribute(fill(count, sample), 3))
    })
    const seeds = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) seeds.set([...sphere(), rnd()], i * 4)
    geometry.setAttribute('aRand', new BufferAttribute(seeds, 4))

    const uniforms = {
      uTime: { value: 0 },
      uW: { value: SCENES.map((_, i): number => (i === 0 ? 1 : 0)) },
      uScatter: { value: 0 },
      uIntro: { value: reduce ? 0 : 1 },
      uSize: { value: 1 },
      uAlpha: { value: 1 },
      uColorA: { value: new Vector3() },
      uColorB: { value: new Vector3() },
      uHot: { value: new Vector3() },
      uMouse: { value: new Vector3() },
      uShock: { value: new Vector4() },
    }
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    const particles = new Points(geometry, material)
    particles.frustumCulled = false
    const group = new Group()
    group.add(particles)
    scene.add(group)

    // distant star dust for depth
    const starCount = small ? 600 : 1600
    const starPos = new Float32Array(starCount * 3)
    const starSeed = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      const [x, y, z] = sphere()
      const r = 20 + rnd() * 40
      starPos.set([x * r, y * r, z * r], i * 3)
      starSeed[i] = rnd()
    }
    const starGeometry = new BufferGeometry()
    starGeometry.setAttribute('position', new BufferAttribute(starPos, 3))
    starGeometry.setAttribute('aSeed', new BufferAttribute(starSeed, 1))
    const starUniforms = {
      uTime: uniforms.uTime,
      uSize: { value: 1 },
      uAlpha: { value: 1 },
      uColor: { value: new Vector3() },
    }
    const starMaterial = new ShaderMaterial({
      uniforms: starUniforms,
      vertexShader: STAR_VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    const stars = new Points(starGeometry, starMaterial)
    stars.frustumCulled = false
    scene.add(stars)

    const palettes = SCENES.map((s) => ({ dark: s.dark.map(hexToRgb), light: s.light.map(hexToRgb) }))

    const applyMode = () => {
      const isDark = darkRef.current
      material.blending = starMaterial.blending = isDark ? AdditiveBlending : NormalBlending
      material.needsUpdate = starMaterial.needsUpdate = true
      uniforms.uAlpha.value = (isDark ? 1 : 0.65) * (small ? 0.75 : 1)
      uniforms.uSize.value = (small ? 2.3 : 2.8) * pixelRatio * (isDark ? 1 : 0.9)
      uniforms.uHot.value.set(...hexToRgb(isDark ? '#ffffff' : '#312e81'))
      starUniforms.uSize.value = 2.2 * pixelRatio
      starUniforms.uAlpha.value = isDark ? 0.7 : 0.3
      starUniforms.uColor.value.set(...hexToRgb(isDark ? '#c7d2fe' : '#6366f1'))
      if (reduce) renderStatic()
    }

    // ---- per-frame state ----
    const weights = SCENES.map((_, i): number => (i === 0 ? 1 : 0))
    const target = SCENES.map(() => 0)
    const mouse = { x: 0, y: 0, sx: 0, sy: 0, strength: 0, inside: false }
    const shock = { x: 0, y: 0, age: 99 }
    const tmp = new Vector3()
    const anchor = new Vector3()
    let lastScrollY = window.scrollY
    let scrollVel = 0
    let time = 0
    let lastMask = -1
    let lastActive = -1

    // Where a screen point (NDC) lands on the z=0 plane the sculptures live on.
    const ndcToWorld = (nx: number, ny: number, out: Vector3) => {
      out.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize()
      return out.multiplyScalar(-camera.position.z / out.z).add(camera.position)
    }

    // Target weight per sculpture from where the section boundaries sit in the
    // viewport: a shape holds while its section fills the screen and morphs
    // while a boundary crosses the middle 60% of the viewport.
    const computeTargets = () => {
      target.fill(0)
      const H = window.innerHeight
      const mid = H / 2
      const win = H * 0.6
      const found: { scene: number; top: number }[] = []
      let mask = 0
      SCENES.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.height > 0) {
          found.push({ scene: i, top: r.top })
          mask |= 1 << i
        }
      })
      if (found.length < 2) {
        // Pages without the homepage sections walk the sculptures by scroll depth.
        const max = document.documentElement.scrollHeight - H
        const f = (max > 0 ? window.scrollY / max : 0) * (SCENES.length - 1)
        const a = Math.min(Math.floor(f), SCENES.length - 2)
        const t = smooth((f - a - 0.3) / 0.4)
        target[a] = 1 - t
        target[a + 1] = t
        return 0
      }
      for (let i = 1; i < found.length; i++) {
        const d = mid - found[i].top
        if (Math.abs(d) < win / 2) {
          const t = smooth(d / win + 0.5)
          target[found[i - 1].scene] = 1 - t
          target[found[i].scene] = t
          return mask
        }
      }
      let k = 0
      for (let i = 0; i < found.length; i++) if (found[i].top <= mid) k = i
      target[found[k].scene] = 1
      return mask
    }

    const update = (dt: number) => {
      const mask = computeTargets()
      if (mask !== lastMask) {
        lastMask = mask
        setPresent(mask)
      }
      let best = 0
      target.forEach((v, i) => {
        if (v > target[best]) best = i
      })
      if (best !== lastActive) {
        lastActive = best
        setActive(best)
      }

      const ease = reduce ? 1 : 1 - Math.exp(-dt * 4.5)
      let sumSq = 0
      weights.forEach((w, i) => {
        weights[i] = w + (target[i] - w) * ease
        sumSq += weights[i] * weights[i]
        uniforms.uW.value[i] = weights[i]
      })
      uniforms.uScatter.value = reduce ? 0 : Math.min(1, Math.max(0, (1 - sumSq) * 2))
      if (!reduce) uniforms.uIntro.value = (1 - Math.min(time / 2.8, 1)) ** 3

      if (!reduce) {
        const follow = 1 - Math.exp(-dt * 3)
        mouse.sx += (mouse.x - mouse.sx) * follow
        mouse.sy += (mouse.y - mouse.sy) * follow
        mouse.strength += ((mouse.inside ? 1 : 0) - mouse.strength) * (1 - Math.exp(-dt * 4))
      }
      camera.position.set(mouse.sx * 0.5, mouse.sy * 0.3, CAM_Z)
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld()

      const sy = window.scrollY
      if (dt > 0) scrollVel += ((sy - lastScrollY) / dt - scrollVel) * (1 - Math.exp(-dt * 6))
      lastScrollY = sy

      // blend each sculpture's placement, size and palette by its weight
      const W = window.innerWidth
      const H = window.innerHeight
      const wide = W >= 900 && W / H > 1.05
      const halfH = CAM_Z * Math.tan((camera.fov * Math.PI) / 360)
      const base = Math.min(halfH * 0.8, halfH * camera.aspect * 0.92)
      const isDark = darkRef.current
      const pos = group.position.set(0, 0, 0)
      let scale = 0
      uniforms.uColorA.value.set(0, 0, 0)
      uniforms.uColorB.value.set(0, 0, 0)
      weights.forEach((w, i) => {
        if (w < 0.0005) return
        const s = SCENES[i]
        let sc = base * s.size * (wide ? 1 : 0.85)
        const photo = i === 0 ? document.querySelector('#home img')?.getBoundingClientRect() : undefined
        if (photo && photo.width > 0) {
          // the planet's core wraps the hero photo, wherever the layout puts it
          ndcToWorld(((photo.left + photo.width / 2) / W) * 2 - 1, 1 - ((photo.top + photo.height / 2) / H) * 2, anchor)
          sc = ((photo.width / 2) * (2 * halfH)) / H / 0.39
        } else {
          ndcToWorld(wide ? s.anchor[0] : 0, s.id === 'contact' ? s.anchor[1] : wide ? s.anchor[1] : 0, anchor)
        }
        pos.addScaledVector(anchor, w)
        scale += sc * w
        const [a, b] = isDark ? palettes[i].dark : palettes[i].light
        uniforms.uColorA.value.x += a[0] * w
        uniforms.uColorA.value.y += a[1] * w
        uniforms.uColorA.value.z += a[2] * w
        uniforms.uColorB.value.x += b[0] * w
        uniforms.uColorB.value.y += b[1] * w
        uniforms.uColorB.value.z += b[2] * w
      })
      group.scale.setScalar(scale || base)
      group.rotation.set(-mouse.sy * 0.3 + Math.max(-0.35, Math.min(0.35, scrollVel * 0.00035)), mouse.sx * 0.45, 0)

      ndcToWorld(mouse.x, mouse.y, tmp)
      uniforms.uMouse.value.set(tmp.x, tmp.y, mouse.strength)
      shock.age += dt
      uniforms.uShock.value.set(shock.x, shock.y, shock.age, Math.max(0, 1 - shock.age / 1.8))
      uniforms.uTime.value = time
      stars.rotation.set(sy * 0.00012, time * 0.01 + mouse.sx * 0.05, 0)
    }

    // ---- loop / static rendering ----
    let raf = 0
    let last = performance.now()
    let perfFrames = 0
    let perfTime = 0
    let perfChecked = false

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      time += dt
      update(dt)
      renderer.render(scene, camera)

      // Weak GPU? After a few seconds, drop to ~half the particles at 1x DPR.
      if (!perfChecked && time > 1) {
        perfFrames++
        perfTime += dt
        if (time > 4) {
          perfChecked = true
          if (perfTime / perfFrames > 1 / 38) {
            geometry.setDrawRange(0, Math.floor(count * 0.55))
            pixelRatio = 1
            renderer.setPixelRatio(1)
            resize()
            applyMode()
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
        renderer.render(scene, camera)
      })
    }

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (reduce) renderStatic()
    }

    // ---- input ----
    const onPointerMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = 1 - (e.clientY / window.innerHeight) * 2
      mouse.inside = !reduce
      // holographic spotlight that follows the cursor across glass panels
      const card = (e.target as Element | null)?.closest?.(SPOTLIGHT) as HTMLElement | null
      if (card) {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${e.clientX - r.left}px`)
        card.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
    }
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') mouse.inside = false
    }
    const onPointerDown = (e: PointerEvent) => {
      if (reduce) return
      ndcToWorld((e.clientX / window.innerWidth) * 2 - 1, 1 - (e.clientY / window.innerHeight) * 2, tmp)
      shock.x = tmp.x
      shock.y = tmp.y
      shock.age = 0
    }
    const onLeave = () => {
      mouse.inside = false
    }
    const onContextLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
    }

    resize()
    applyModeRef.current = applyMode
    applyMode()
    if (reduce) renderStatic()
    else raf = requestAnimationFrame(frame)

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    if (reduce) window.addEventListener('scroll', renderStatic, { passive: true })
    canvas.addEventListener('webglcontextlost', onContextLost)

    return () => {
      cancelAnimationFrame(raf)
      applyModeRef.current = () => {}
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('scroll', renderStatic)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      geometry.dispose()
      material.dispose()
      starGeometry.dispose()
      starMaterial.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [reduce])

  return (
    <>
      <div ref={hostRef} aria-hidden className="fixed inset-0 -z-10 pointer-events-none" />
      <SectionRail items={SCENES} present={present} active={active} reduce={reduce} />
    </>
  )
}

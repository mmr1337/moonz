'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Texture } from 'ogl';

import './ElasticMesh.css';

const DIST = 4.6;
const FIT = 0.82;

const VERT = `
precision highp float;
attribute vec2 aGrid;
attribute vec2 uv;
attribute vec3 aOffset;
attribute vec3 aNormal;

uniform float uAspect;
uniform float uTilt;
uniform float uDist;
uniform float uFit;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;

void main() {
  vUv = uv;

  vec2 base = vec2((aGrid.x * 2.0 - 1.0) * uAspect, 1.0 - aGrid.y * 2.0);
  vec3 p = vec3(base + aOffset.xy, aOffset.z);

  float ct = cos(uTilt);
  float st = sin(uTilt);
  float ry = p.y * ct - p.z * st;
  float rz = p.y * st + p.z * ct;
  p.y = ry;
  p.z = rz;

  float persp = uDist / (uDist - p.z);
  vec2 clip = vec2(p.x / uAspect, p.y) * persp * uFit;

  vNormal = aNormal;
  vDepth = aOffset.z;
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;

uniform sampler2D tMap;
uniform float uHasImage;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uHighlight;
uniform float uShading;
uniform vec2 uRes;
uniform float uRadius;
uniform float uGrid;
uniform float uGridDensity;
uniform float uGridOpacity;
uniform vec3 uGridColor;

void main() {
  vec3 base;
  float imageAlpha = 1.0;
  if (uHasImage > 0.5) {
    vec4 texel = texture2D(tMap, vUv);
    base = texel.rgb;
    imageAlpha = texel.a;
  } else {
    base = mix(uColor1, uColor2, clamp(vUv.y, 0.0, 1.0));
  }

  vec3 lit = base;
  float diff = 1.0;

  if (uShading > 0.0001 || uGrid > 0.5) {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vec3(-0.35, 0.55, 0.78));
    diff = clamp(dot(N, L), 0.0, 1.0);

    if (uShading > 0.0001) {
      vec3 V = vec3(0.0, 0.0, 1.0);
      vec3 H = normalize(L + V);
      float specRaw = pow(clamp(dot(N, H), 0.0, 1.0), 26.0);
      float specFlat = pow(clamp(H.z, 0.0, 1.0), 26.0);
      float spec = clamp((specRaw - specFlat) / (1.0 - specFlat), 0.0, 1.0);
      float ao = clamp(1.0 + vDepth * 0.45, 0.65, 1.25);

      lit = base * (1.0 - uShading * 0.28);
      lit += base * diff * uShading * 0.55;
      lit *= ao;
      lit += uHighlight * spec * uShading * 0.25;
    }
  }

  if (uGrid > 0.5) {
    vec2 g = vUv * uGridDensity;
    vec2 w = uGridDensity / max(uRes, vec2(1.0));
    vec2 d = abs(fract(g - 0.5) - 0.5) / max(w * 1.5, vec2(1e-4));
    float line = 1.0 - clamp(min(d.x, d.y), 0.0, 1.0);
    lit = mix(lit, uGridColor, line * uGridOpacity * (0.45 + diff * 0.55));
  }

  vec2 p = (vUv - 0.5) * uRes;
  vec2 halfRes = uRes * 0.5;
  float r = min(uRadius, min(halfRes.x, halfRes.y));
  vec2 q = abs(p) - (halfRes - r);
  float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float alpha = 1.0 - smoothstep(-1.25, 1.25, sd);
  alpha *= imageAlpha;
  if (alpha <= 0.002) discard;

  gl_FragColor = vec4(lit, alpha);
}
`;

function hexToRgb(hex) {
  let h = (hex || '').replace('#', '').trim();
  if (h.length === 3)
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  const n = parseInt(h || '000000', 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const ElasticMesh = ({
  image = '',
  color1 = '#5227FF',
  color2 = '#B19EEF',
  highlight = '#ffffff',
  showGrid = true,
  gridDensity = 20,
  gridOpacity = 0.28,
  gridColor = '#ffffff',
  borderRadius = 25,
  stiffness = 0.05,
  damping = 0.2,
  grabRadius = 0.6,
  pull = 0.4,
  wobble = 5,
  tilt = 14,
  shading = 0.5,
  resolution = 25,
  interaction = 'hover',
  enabled = true,
  className = '',
  style,
  ...rest
}) => {
  const containerRef = useRef(null);
  const wakeRef = useRef(() => {});

  const propsRef = useRef({});
  propsRef.current = {
    color1,
    color2,
    highlight,
    showGrid,
    gridDensity,
    gridOpacity,
    gridColor,
    borderRadius,
    stiffness,
    damping,
    grabRadius,
    pull,
    wobble,
    tilt,
    shading,
    interaction,
    enabled
  };

  useEffect(() => {
    wakeRef.current();
  }, [
    color1,
    color2,
    highlight,
    showGrid,
    gridDensity,
    gridOpacity,
    gridColor,
    borderRadius,
    stiffness,
    damping,
    grabRadius,
    pull,
    wobble,
    tilt,
    shading,
    interaction,
    enabled
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderDpr = Math.min(window.devicePixelRatio || 1, 3);

    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      dpr: renderDpr,
      powerPreference: 'high-performance'
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const N = Math.max(6, Math.min(40, Math.round(resolution)));
    const nodeCount = N * N;

    const aGrid = new Float32Array(nodeCount * 2);
    const uv = new Float32Array(nodeCount * 2);
    const aOffset = new Float32Array(nodeCount * 3);
    const aNormal = new Float32Array(nodeCount * 3);

    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const idx = j * N + i;
        const u = i / (N - 1);
        const v = j / (N - 1);
        aGrid[idx * 2] = u;
        aGrid[idx * 2 + 1] = v;
        uv[idx * 2] = u;
        uv[idx * 2 + 1] = v;
        aNormal[idx * 3 + 2] = 1;
      }
    }

    const quads = (N - 1) * (N - 1);
    const index = new Uint16Array(quads * 6);
    let t = 0;
    for (let j = 0; j < N - 1; j++) {
      for (let i = 0; i < N - 1; i++) {
        const a = j * N + i;
        const b = a + 1;
        const c = a + N;
        const d = c + 1;
        index[t++] = a;
        index[t++] = c;
        index[t++] = b;
        index[t++] = b;
        index[t++] = c;
        index[t++] = d;
      }
    }

    const neighbors = new Uint16Array(nodeCount * 4);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const idx = j * N + i;
        const n4 = idx * 4;
        neighbors[n4] = i > 0 ? idx - 1 : idx;
        neighbors[n4 + 1] = i < N - 1 ? idx + 1 : idx;
        neighbors[n4 + 2] = j > 0 ? idx - N : idx;
        neighbors[n4 + 3] = j < N - 1 ? idx + N : idx;
      }
    }

    const geometry = new Geometry(gl, {
      aGrid: { size: 2, data: aGrid },
      uv: { size: 2, data: uv },
      aOffset: { size: 3, data: aOffset },
      aNormal: { size: 3, data: aNormal },
      index: { data: index }
    });

    const texture = new Texture(gl, { generateMipmaps: false, flipY: false });
    let hasImage = 0;
    if (image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.fetchPriority = 'high';
      img.src = image;
      img.onload = () => {
        texture.image = img;
        program.uniforms.uHasImage.value = 1;
        wakeRef.current();
      };
    }

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      cullFace: null,
      uniforms: {
        tMap: { value: texture },
        uHasImage: { value: hasImage },
        uColor1: { value: hexToRgb(color1) },
        uColor2: { value: hexToRgb(color2) },
        uHighlight: { value: hexToRgb(highlight) },
        uGrid: { value: showGrid ? 1 : 0 },
        uGridDensity: { value: gridDensity },
        uGridOpacity: { value: gridOpacity },
        uGridColor: { value: hexToRgb(gridColor) },
        uShading: { value: shading },
        uRes: { value: [1, 1] },
        uRadius: { value: borderRadius },
        uAspect: { value: 1 },
        uTilt: { value: (tilt * Math.PI) / 180 },
        uDist: { value: DIST },
        uFit: { value: FIT }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const baseX = new Float32Array(nodeCount);
    const baseY = new Float32Array(nodeCount);
    const pos = new Float32Array(nodeCount * 3);
    const prevPos = new Float32Array(nodeCount * 3);
    const renderPos = new Float32Array(nodeCount * 3);
    const vel = new Float32Array(nodeCount * 3);
    const accel = new Float32Array(nodeCount * 3);

    let aspect = 1;
    let viewWidth = 1;
    let viewHeight = 1;

    function refreshBase() {
      for (let idx = 0; idx < nodeCount; idx++) {
        baseX[idx] = (aGrid[idx * 2] * 2 - 1) * aspect;
        baseY[idx] = 1 - aGrid[idx * 2 + 1] * 2;
      }
    }

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, targetActive: false };
    let pointerRect = container.getBoundingClientRect();
    let rectDirty = false;

    function refreshPointerRect() {
      pointerRect = container.getBoundingClientRect();
      rectDirty = false;
    }

    function getTargetDpr(w, h) {
      const deviceDpr = Math.min(window.devicePixelRatio || 1, 3);
      const maxPixels = 3200000;
      const pixelBudgetDpr = Math.sqrt(maxPixels / Math.max(1, w * h));
      return Math.max(1, Math.min(deviceDpr, pixelBudgetDpr));
    }

    function resize(force = false) {
      const w = Math.max(1, Math.round(container.clientWidth || 1));
      const h = Math.max(1, Math.round(container.clientHeight || 1));
      const nextDpr = getTargetDpr(w, h);
      const dprChanged = Math.abs(nextDpr - renderDpr) > 0.01;

      if (!force && !dprChanged && w === viewWidth && h === viewHeight) return;

      viewWidth = w;
      viewHeight = h;

      if (dprChanged) {
        renderDpr = nextDpr;
        renderer.dpr = renderDpr;
      }

      renderer.setSize(viewWidth, viewHeight);
      aspect = viewWidth / viewHeight;
      program.uniforms.uAspect.value = aspect;
      program.uniforms.uRes.value = [viewWidth, viewHeight];
      refreshBase();
      refreshPointerRect();
      prevPos.set(pos);
      wakeRef.current();
    }

    let resizeRaf = 0;
    const scheduleResize = () => {
      rectDirty = true;
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resize();
      });
    };

    const ro = new ResizeObserver(scheduleResize);
    ro.observe(container);
    window.addEventListener('resize', scheduleResize, { passive: true });
    window.visualViewport?.addEventListener('resize', scheduleResize, { passive: true });
    resize(true);

    function toPlane(clientX, clientY) {
      if (rectDirty) refreshPointerRect();
      const rect = pointerRect;
      const mx = (clientX - rect.left) / rect.width;
      const my = (clientY - rect.top) / rect.height;
      const clipX = mx * 2 - 1;
      const clipY = 1 - my * 2;
      const t = ((propsRef.current.tilt || 0) * Math.PI) / 180;
      const ct = Math.cos(t);
      const st = Math.sin(t);
      const a = clipY / (ct * FIT * DIST);
      const py = (a * DIST) / (1 + a * st);
      const persp = DIST / (DIST - py * st);
      pointer.tx = (clipX * aspect) / (persp * FIT);
      pointer.ty = py;
    }

    function onPointerMove(e) {
      toPlane(e.clientX, e.clientY);
      if (propsRef.current.interaction === 'hover') pointer.targetActive = true;
      wakeRef.current();
    }

    function onPointerEnter() {
      refreshPointerRect();
      if (propsRef.current.interaction === 'hover') pointer.targetActive = true;
      wakeRef.current();
    }

    function onPointerLeave() {
      pointer.targetActive = false;
      wakeRef.current();
    }

    function onPointerDown(e) {
      if (propsRef.current.interaction === 'drag') {
        refreshPointerRect();
        toPlane(e.clientX, e.clientY);
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
        pointer.targetActive = true;
        if (container.setPointerCapture) container.setPointerCapture(e.pointerId);
        wakeRef.current();
      }
    }

    function onPointerUp(e) {
      if (propsRef.current.interaction === 'drag') {
        pointer.targetActive = false;
        if (container.releasePointerCapture && container.hasPointerCapture?.(e.pointerId)) {
          container.releasePointerCapture(e.pointerId);
        }
        wakeRef.current();
      }
    }

    const onScroll = () => {
      rectDirty = true;
    };

    const pointerMoveEvent =
      'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove';

    container.addEventListener(pointerMoveEvent, onPointerMove, { passive: true });
    container.addEventListener('pointerenter', onPointerEnter, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const STEP = 1 / 120;
    const MAX_SUB = 8;
    let accTime = 0;
    let last = performance.now();
    let sleepFrames = 0;
    let motionScore = 0;

    function substep() {
      prevPos.set(pos);

      const p = propsRef.current;
      const s = p.stiffness;
      const retain = 1 - p.damping;
      const coupling = 0.06 + p.wobble * 0.032;
      const active = pointer.active && p.enabled && !reduceMotion;
      const r = Math.max(0.08, p.grabRadius) * 1.4;
      const invR = 1 / r;
      const force = p.pull * 0.009;

      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i;
          const o3 = idx * 3;
          const ox = pos[o3];
          const oy = pos[o3 + 1];
          const oz = pos[o3 + 2];

          let ax = -s * ox;
          let ay = -s * oy;
          let az = -s * oz;

          const n4 = idx * 4;
          const n0 = neighbors[n4] * 3;
          const n1 = neighbors[n4 + 1] * 3;
          const n2 = neighbors[n4 + 2] * 3;
          const n3 = neighbors[n4 + 3] * 3;

          const sumx = pos[n0] + pos[n1] + pos[n2] + pos[n3];
          const sumy = pos[n0 + 1] + pos[n1 + 1] + pos[n2 + 1] + pos[n3 + 1];
          const sumz = pos[n0 + 2] + pos[n1 + 2] + pos[n2 + 2] + pos[n3 + 2];

          ax += coupling * (sumx - 4 * ox);
          ay += coupling * (sumy - 4 * oy);
          az += coupling * (sumz - 4 * oz);

          if (active) {
            const dx = pointer.x - (baseX[idx] + ox);
            const dy = pointer.y - (baseY[idx] + oy);
            const d2 = dx * dx + dy * dy;
            const r2 = r * r;

            if (d2 < r2) {
              const tnorm2 = d2 / r2;
              const zBump = 1 - tnorm2;
              az += force * zBump * zBump * 6.0;

              if (d2 > 1e-8) {
                const d = Math.sqrt(d2);
                const tnorm = d * invR;
                const pinch = tnorm * (1 - tnorm) * (1 - tnorm) * 6.75;
                const dir = (force * pinch * 1.6) / d;
                ax += dx * dir;
                ay += dy * dir;
              }
            }
          }

          accel[o3] = ax;
          accel[o3 + 1] = ay;
          accel[o3 + 2] = az;
        }
      }

      motionScore = 0;
      for (let k = 0; k < nodeCount; k++) {
        const o3 = k * 3;
        const nvx = (vel[o3] + accel[o3]) * retain;
        const nvy = (vel[o3 + 1] + accel[o3 + 1]) * retain;
        const nvz = (vel[o3 + 2] + accel[o3 + 2]) * retain;
        vel[o3] = nvx;
        vel[o3 + 1] = nvy;
        vel[o3 + 2] = nvz;

        const energy = Math.abs(nvx) + Math.abs(nvy) + Math.abs(nvz);
        if (energy > motionScore) motionScore = energy;

        let px = pos[o3] + nvx;
        let py = pos[o3 + 1] + nvy;
        let pz = pos[o3 + 2] + nvz;
        if (px > 1.2) px = 1.2;
        else if (px < -1.2) px = -1.2;
        if (py > 1.2) py = 1.2;
        else if (py < -1.2) py = -1.2;
        if (pz > 1.2) pz = 1.2;
        else if (pz < -1.2) pz = -1.2;
        pos[o3] = px;
        pos[o3 + 1] = py;
        pos[o3 + 2] = pz;
      }
    }

    function commit(alpha) {
      const blend = Math.max(0, Math.min(1, alpha));

      for (let k = 0; k < renderPos.length; k++) {
        renderPos[k] = prevPos[k] + (pos[k] - prevPos[k]) * blend;
      }

      const needNormals = propsRef.current.shading > 0.0001;

      if (!needNormals) {
        aOffset.set(renderPos);
        geometry.attributes.aOffset.needsUpdate = true;
        return;
      }

      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i;
          const o3 = idx * 3;

          const iL = i > 0 ? idx - 1 : idx;
          const iR = i < N - 1 ? idx + 1 : idx;
          const iD = j > 0 ? idx - N : idx;
          const iU = j < N - 1 ? idx + N : idx;

          const lx = baseX[iL] + renderPos[iL * 3];
          const ly = baseY[iL] + renderPos[iL * 3 + 1];
          const lz = renderPos[iL * 3 + 2];
          const rx = baseX[iR] + renderPos[iR * 3];
          const ry = baseY[iR] + renderPos[iR * 3 + 1];
          const rz = renderPos[iR * 3 + 2];
          const dx = baseX[iD] + renderPos[iD * 3];
          const dy = baseY[iD] + renderPos[iD * 3 + 1];
          const dz = renderPos[iD * 3 + 2];
          const ux = baseX[iU] + renderPos[iU * 3];
          const uy = baseY[iU] + renderPos[iU * 3 + 1];
          const uz = renderPos[iU * 3 + 2];

          const txx = rx - lx;
          const txy = ry - ly;
          const txz = rz - lz;
          const tyx = ux - dx;
          const tyy = uy - dy;
          const tyz = uz - dz;

          let nx = txy * tyz - txz * tyy;
          let ny = txz * tyx - txx * tyz;
          let nz = txx * tyy - txy * tyx;
          if (nz < 0) {
            nx = -nx;
            ny = -ny;
            nz = -nz;
          }

          const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          aNormal[o3] = nx / len;
          aNormal[o3 + 1] = ny / len;
          aNormal[o3 + 2] = nz / len;

          aOffset[o3] = renderPos[o3];
          aOffset[o3 + 1] = renderPos[o3 + 1];
          aOffset[o3 + 2] = renderPos[o3 + 2];
        }
      }

      geometry.attributes.aOffset.needsUpdate = true;
      geometry.attributes.aNormal.needsUpdate = true;
    }

    const uniformCache = {};
    function syncUniforms(p) {
      if (uniformCache.shading !== p.shading) {
        program.uniforms.uShading.value = p.shading;
        uniformCache.shading = p.shading;
      }
      if (uniformCache.borderRadius !== p.borderRadius) {
        program.uniforms.uRadius.value = p.borderRadius;
        uniformCache.borderRadius = p.borderRadius;
      }
      if (uniformCache.tilt !== p.tilt) {
        program.uniforms.uTilt.value = (p.tilt * Math.PI) / 180;
        uniformCache.tilt = p.tilt;
      }
      if (uniformCache.color1 !== p.color1) {
        program.uniforms.uColor1.value = hexToRgb(p.color1);
        uniformCache.color1 = p.color1;
      }
      if (uniformCache.color2 !== p.color2) {
        program.uniforms.uColor2.value = hexToRgb(p.color2);
        uniformCache.color2 = p.color2;
      }
      if (uniformCache.highlight !== p.highlight) {
        program.uniforms.uHighlight.value = hexToRgb(p.highlight);
        uniformCache.highlight = p.highlight;
      }
      if (uniformCache.showGrid !== p.showGrid) {
        program.uniforms.uGrid.value = p.showGrid ? 1 : 0;
        uniformCache.showGrid = p.showGrid;
      }
      if (uniformCache.gridDensity !== p.gridDensity) {
        program.uniforms.uGridDensity.value = p.gridDensity;
        uniformCache.gridDensity = p.gridDensity;
      }
      if (uniformCache.gridOpacity !== p.gridOpacity) {
        program.uniforms.uGridOpacity.value = p.gridOpacity;
        uniformCache.gridOpacity = p.gridOpacity;
      }
      if (uniformCache.gridColor !== p.gridColor) {
        program.uniforms.uGridColor.value = hexToRgb(p.gridColor);
        uniformCache.gridColor = p.gridColor;
      }
    }


    let raf = 0;
    let running = false;
    let inView = true;
    let pageVisible = !document.hidden;

    function frame(now) {
      if (!running) return;

      const frameMs = Math.min(now - last, 50);
      const dt = frameMs / 1000;
      last = now;

      const p = propsRef.current;
      syncUniforms(p);

      const tau = 0.012;
      const kLerp = 1 - Math.exp(-Math.max(dt, 1e-4) / tau);
      pointer.x += (pointer.tx - pointer.x) * kLerp;
      pointer.y += (pointer.ty - pointer.y) * kLerp;
      pointer.active = pointer.targetActive;

      accTime += dt;
      let sub = 0;
      while (accTime >= STEP && sub < MAX_SUB) {
        substep();
        accTime -= STEP;
        sub++;
      }
      if (accTime > STEP) accTime = 0;

      commit(accTime / STEP);
      renderer.render({
        scene: mesh,
        update: false,
        sort: false,
        frustumCull: false
      });

      const settled =
        !pointer.targetActive &&
        !pointer.active &&
        motionScore < 0.00002;

      sleepFrames = settled ? sleepFrames + 1 : 0;

      if (sleepFrames >= 12) {
        running = false;
        raf = 0;
        return;
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || !inView || !pageVisible) return;
      running = true;
      sleepFrames = 0;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    wakeRef.current = start;

    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      entries => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    container.appendChild(gl.canvas);
    start();

    return () => {
      stop();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      window.removeEventListener('resize', scheduleResize);
      window.visualViewport?.removeEventListener('resize', scheduleResize);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      wakeRef.current = () => {};
      container.removeEventListener(pointerMoveEvent, onPointerMove);
      container.removeEventListener('pointerenter', onPointerEnter);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', onScroll);
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, resolution]);

  return (
    <div ref={containerRef} className={`elastic-mesh${className ? ` ${className}` : ''}`} style={style} {...rest} />
  );
};

export default ElasticMesh;


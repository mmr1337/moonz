'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Ferrofluid.css';

const hexToRGB = hex => {
  const c = hex.replace('#', '').padEnd(6, '0');
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255
  ];
};

const flowVec = direction => {
  if (direction === 'up') return [0, 1];
  if (direction === 'left') return [-1, 0];
  if (direction === 'right') return [1, 0];
  return [0, -1];
};

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec2 uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uOpacity;

varying vec2 vUv;

#define PI 3.14159265

float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

vec3 palette(float h) {
  if (h < 0.33) return mix(uColor0, uColor1, h / 0.33);
  if (h < 0.66) return mix(uColor1, uColor2, (h - 0.33) / 0.33);
  return uColor2;
}

void main() {
  vec2 fragCoord = vUv * iResolution.xy;
  float ref = 700.0 / max(uScale, 0.05);
  vec2 p = fragCoord / iResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t = iTime;
  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);

  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;

  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);
  float merged = smin(peaks, peaks2, max(uFluidity, 0.001));

  float band = (uRimWidth - abs((merged - 0.4) * 2.0)) * 5.0;
  float light = clamp(
    band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer,
    0.0,
    1.0
  );

  light = pow(light, uSharpness) * uGlow;

  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 color = palette(h) * light;
  float alpha = clamp(max(color.r, max(color.g, color.b)), 0.0, 1.0);

  gl_FragColor = vec4(color, alpha * uOpacity);
}
`;

export default function Ferrofluid({
  colors = ['#ffffff', '#ffffff', '#ffffff'],
  speed = 0.5,
  scale = 1.6,
  turbulence = 1,
  fluidity = 0.1,
  rimWidth = 0.2,
  sharpness = 2.5,
  shimmer = 1.5,
  glow = 2,
  flowDirection = 'down',
  opacity = 1,
  className = ''
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderDpr = Math.min(window.devicePixelRatio || 1, 2);

    const renderer = new Renderer({
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      dpr: renderDpr,
      powerPreference: 'high-performance'
    });

    const gl = renderer.gl;
    const canvas = gl.canvas;
    gl.clearColor(0, 0, 0, 0);

    const palette = colors.length ? colors : ['#ffffff'];
    const c0 = hexToRGB(palette[0]);
    const c1 = hexToRGB(palette[Math.min(1, palette.length - 1)]);
    const c2 = hexToRGB(palette[Math.min(2, palette.length - 1)]);

    const uniforms = {
      iResolution: { value: [1, 1, 1] },
      iTime: { value: 0 },
      uColor0: { value: c0 },
      uColor1: { value: c1 },
      uColor2: { value: c2 },
      uFlow: { value: flowVec(flowDirection) },
      uSpeed: { value: speed },
      uScale: { value: scale },
      uTurbulence: { value: turbulence },
      uFluidity: { value: fluidity },
      uRimWidth: { value: rimWidth },
      uSharpness: { value: sharpness },
      uShimmer: { value: shimmer },
      uGlow: { value: glow },
      uOpacity: { value: opacity }
    };

    const program = new Program(gl, { vertex, fragment, uniforms });
    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });

    container.appendChild(canvas);

    let viewWidth = 1;
    let viewHeight = 1;

    const resize = (force = false) => {
      const width = Math.max(1, Math.round(container.clientWidth || 1));
      const height = Math.max(1, Math.round(container.clientHeight || 1));
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const dprChanged = Math.abs(nextDpr - renderDpr) > 0.01;

      if (!force && !dprChanged && width === viewWidth && height === viewHeight) return;

      viewWidth = width;
      viewHeight = height;

      if (dprChanged) {
        renderDpr = nextDpr;
        renderer.dpr = renderDpr;
      }

      renderer.setSize(viewWidth, viewHeight);
      uniforms.iResolution.value = [
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
        1
      ];
    };

    let resizeRaf = 0;
    const scheduleResize = () => {
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

    let raf = 0;
    let running = false;
    let inView = true;
    let pageVisible = !document.hidden;
    let lastTime = 0;
    let elapsed = 0;

    const frame = time => {
      if (!running) return;
      raf = requestAnimationFrame(frame);

      if (!lastTime) lastTime = time;
      elapsed += Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      uniforms.iTime.value = elapsed;
      renderer.render({
        scene: mesh,
        update: false,
        sort: false,
        frustumCull: false
      });
    };

    const start = () => {
      if (running || !inView || !pageVisible) return;
      running = true;
      lastTime = 0;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

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

    start();

    return () => {
      stop();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      window.removeEventListener('resize', scheduleResize);
      window.visualViewport?.removeEventListener('resize', scheduleResize);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (canvas.parentElement === container) container.removeChild(canvas);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, [
    colors,
    speed,
    scale,
    turbulence,
    fluidity,
    rimWidth,
    sharpness,
    shimmer,
    glow,
    flowDirection,
    opacity
  ]);

  return (
    <div
      ref={containerRef}
      className={`ferrofluid-container${className ? ` ${className}` : ''}`}
    />
  );
}

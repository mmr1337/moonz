'use client';

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';
import './CircularGallery.css';

const lerp = (a, b, t) => a + (b - a) * t;

const VERTEX = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uSpeed;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 p = position;
  p.z += (sin(p.x * 3.5 + uTime) + cos(p.y * 2.2 + uTime))
    * 0.08 * (1.0 + abs(uSpeed) * 4.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const FRAGMENT = `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uImageSizes;
uniform vec2 uPlaneSizes;
uniform float uBorderRadius;
varying vec2 vUv;

float roundedBoxSDF(vec2 p, vec2 b, float r) {
  vec2 d = abs(p) - b;
  return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
}

void main() {
  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );

  vec2 imageUv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  vec4 color = texture2D(tMap, imageUv);
  float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
  float alpha = 1.0 - smoothstep(-0.003, 0.003, d);
  gl_FragColor = vec4(color.rgb, color.a * alpha);
}
`;

class GalleryApp {
  constructor(container, options) {
    this.container = container;
    this.items = options.items;
    this.bend = options.bend;
    this.borderRadius = options.borderRadius;
    this.scrollSpeed = options.scrollSpeed;
    this.scrollEase = options.scrollEase;
    this.scroll = { current: 0, target: 0, last: 0 };
    this.dragging = false;
    this.visible = true;
    this.pageVisible = !document.hidden;
    this.running = false;
    this.resizeRaf = 0;

    this.createRenderer();
    this.createGeometry();
    this.createMedia();
    this.bindEvents();
    this.resize(true);
    this.start();
  }

  createRenderer() {
    this.renderDpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      dpr: this.renderDpr,
      powerPreference: 'high-performance'
    });

    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);

    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
    this.scene = new Transform();
  }

  createGeometry() {
    this.geometry = new Plane(this.gl, {
      widthSegments: 40,
      heightSegments: 24
    });
  }

  createMedia() {
    const doubled = [...this.items, ...this.items];

    this.medias = doubled.map((item, index) => {
      const texture = new Texture(this.gl, {
        generateMipmaps: true,
        flipY: false
      });

      const program = new Program(this.gl, {
        vertex: VERTEX,
        fragment: FRAGMENT,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        cullFace: null,
        uniforms: {
          tMap: { value: texture },
          uImageSizes: { value: [1, 1] },
          uPlaneSizes: { value: [1, 1] },
          uBorderRadius: { value: this.borderRadius },
          uTime: { value: index * 0.35 },
          uSpeed: { value: 0 }
        }
      });

      const mesh = new Mesh(this.gl, {
        geometry: this.geometry,
        program
      });

      mesh.setParent(this.scene);

      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.src = item.image;
      image.onload = () => {
        texture.image = image;
        program.uniforms.uImageSizes.value = [
          image.naturalWidth,
          image.naturalHeight
        ];
      };

      return { mesh, program, index, extra: 0 };
    });
  }

  scheduleResize = () => {
    if (this.resizeRaf) return;
    this.resizeRaf = requestAnimationFrame(() => {
      this.resizeRaf = 0;
      this.resize();
    });
  };

  resize(force = false) {
    const width = Math.max(1, Math.round(this.container.clientWidth));
    const height = Math.max(1, Math.round(this.container.clientHeight));
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    const dprChanged = Math.abs(nextDpr - this.renderDpr) > 0.01;

    if (!force && !dprChanged && width === this.width && height === this.height) {
      return;
    }

    this.width = width;
    this.height = height;

    if (dprChanged) {
      this.renderDpr = nextDpr;
      this.renderer.dpr = nextDpr;
    }

    this.renderer.setSize(width, height);
    this.camera.perspective({ aspect: width / height });

    const fov = (this.camera.fov * Math.PI) / 180;
    const viewportHeight = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const viewportWidth = viewportHeight * this.camera.aspect;

    this.viewport = {
      width: viewportWidth,
      height: viewportHeight
    };

    const count = this.items.length;
    const cardWidth = Math.min(viewportWidth * 0.38, viewportHeight * 0.64);
    const cardHeight = cardWidth * 0.68;
    const gap = Math.max(0.55, cardWidth * 0.14);

    this.step = cardWidth + gap;
    this.totalWidth = this.step * count;

    this.medias.forEach(media => {
      media.mesh.scale.set(cardWidth, cardHeight, 1);
      media.program.uniforms.uPlaneSizes.value = [cardWidth, cardHeight];
    });
  }

  bindEvents() {
    this.resizeObserver = new ResizeObserver(this.scheduleResize);
    this.resizeObserver.observe(this.container);

    window.addEventListener('resize', this.scheduleResize, { passive: true });
    window.visualViewport?.addEventListener('resize', this.scheduleResize, {
      passive: true
    });

    this.onWheel = event => {
      const delta = event.deltaY || event.deltaX;
      this.scroll.target += Math.sign(delta) * this.scrollSpeed * 0.28;
      this.start();
    };

    this.onPointerDown = event => {
      this.dragging = true;
      this.dragStart = event.clientX;
      this.dragOrigin = this.scroll.target;
      this.container.setPointerCapture?.(event.pointerId);
      this.start();
    };

    this.onPointerMove = event => {
      if (!this.dragging) return;
      const delta = this.dragStart - event.clientX;
      this.scroll.target =
        this.dragOrigin + delta * 0.012 * this.scrollSpeed;
    };

    this.onPointerUp = event => {
      this.dragging = false;
      if (this.container.hasPointerCapture?.(event.pointerId)) {
        this.container.releasePointerCapture(event.pointerId);
      }
    };

    this.onKeyDown = event => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.scroll.target += this.step || 2;
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.scroll.target -= this.step || 2;
      }
      this.start();
    };

    this.onVisibility = () => {
      this.pageVisible = !document.hidden;
      if (this.pageVisible) this.start();
      else this.stop();
    };

    this.container.addEventListener('wheel', this.onWheel, { passive: true });
    this.container.addEventListener('pointerdown', this.onPointerDown);
    this.container.addEventListener('pointermove', this.onPointerMove, {
      passive: true
    });
    this.container.addEventListener('pointerup', this.onPointerUp, {
      passive: true
    });
    this.container.addEventListener('pointercancel', this.onPointerUp, {
      passive: true
    });
    this.container.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('visibilitychange', this.onVisibility);

    this.intersectionObserver = new IntersectionObserver(
      entries => {
        this.visible = entries[0]?.isIntersecting ?? true;
        if (this.visible) this.start();
        else this.stop();
      },
      { rootMargin: '150px' }
    );

    this.intersectionObserver.observe(this.container);
  }

  update = () => {
    if (!this.running) return;

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scrollEase
    );

    const speed = this.scroll.current - this.scroll.last;
    const half = this.viewport.width / 2;

    this.medias.forEach(media => {
      let x = media.index * this.step - this.scroll.current - media.extra;
      const direction = speed >= 0 ? 1 : -1;

      if (direction > 0 && x + this.step < -half) {
        media.extra -= this.totalWidth;
      } else if (direction < 0 && x - this.step > half) {
        media.extra += this.totalWidth;
      }

      x = media.index * this.step - this.scroll.current - media.extra;
      media.mesh.position.x = x - this.step * 1.5;

      if (this.bend === 0) {
        media.mesh.position.y = 0;
        media.mesh.rotation.z = 0;
      } else {
        const bend = Math.abs(this.bend);
        const radius =
          (half * half + bend * bend) / Math.max(0.001, 2 * bend);
        const effectiveX = Math.min(
          Math.abs(media.mesh.position.x),
          Math.max(0.001, half)
        );

        const inside = Math.max(
          0,
          radius * radius - effectiveX * effectiveX
        );

        const arc = radius - Math.sqrt(inside);
        const sign = this.bend > 0 ? -1 : 1;

        media.mesh.position.y = arc * sign;
        media.mesh.rotation.z =
          Math.sign(media.mesh.position.x) *
          Math.asin(Math.min(1, effectiveX / radius)) *
          -sign;
      }

      media.program.uniforms.uSpeed.value = speed;
      media.program.uniforms.uTime.value += 0.025;
    });

    this.renderer.render({
      scene: this.scene,
      camera: this.camera
    });

    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this.update);
  };

  start() {
    if (this.running || !this.visible || !this.pageVisible) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.update);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.stop();

    if (this.resizeRaf) {
      cancelAnimationFrame(this.resizeRaf);
    }

    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();

    window.removeEventListener('resize', this.scheduleResize);
    window.visualViewport?.removeEventListener(
      'resize',
      this.scheduleResize
    );

    this.container.removeEventListener('wheel', this.onWheel);
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('pointerup', this.onPointerUp);
    this.container.removeEventListener('pointercancel', this.onPointerUp);
    this.container.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('visibilitychange', this.onVisibility);

    if (this.gl.canvas.parentNode === this.container) {
      this.container.removeChild(this.gl.canvas);
    }

    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

export default function CircularGallery({
  items = [],
  bend = -5,
  borderRadius = 0.055,
  scrollSpeed = 1,
  scrollEase = 0.12
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !items.length) return;

    const app = new GalleryApp(containerRef.current, {
      items,
      bend,
      borderRadius,
      scrollSpeed,
      scrollEase
    });

    return () => app.destroy();
  }, [items, bend, borderRadius, scrollSpeed, scrollEase]);

  return (
    <div
      ref={containerRef}
      className="circular-gallery"
      tabIndex={0}
      role="region"
      aria-label="Game gallery"
    />
  );
}

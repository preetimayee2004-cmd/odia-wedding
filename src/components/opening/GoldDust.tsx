import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * A canvas of warm golden motes for the opening: hundreds of tiny particles
 * at different depths that drift and shimmer, emitted from a point or a ring,
 * burst from a set of points (the deity dissolving), and finally gathered into
 * a turning circle that can glide anywhere. Additive blending, one sprite,
 * one canvas — light enough for phones.
 */
export interface GoldDustHandle {
  /** Emit continuously from a point, or from a ring around it; rate 0 stops. */
  emit(opts: { x: number; y: number; rate: number; ring?: { rx: number; ry: number }; speed?: [number, number] }): void;
  /** Glide the emitter to a new point. */
  moveEmitter(x: number, y: number, ms: number): void;
  /** Release a particle at each point (screen px), drifting gently outward from `from`. */
  burst(points: Array<[number, number]>, from: [number, number], spreadMs: number): void;
  /** Gather every particle into a turning circle. */
  swirl(x: number, y: number, r: number): void;
  /** Glide (and shrink or grow) the circle. */
  moveSwirl(x: number, y: number, r: number, ms: number): void;
  /** Fade all the light out. */
  fade(ms: number): Promise<void>;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  depth: number; // 0 far … 1 near: size, brightness and speed
  phase: number; // shimmer
  born: number; // delay before appearing (bursts)
  swirling: boolean;
  a: number;
  r: number;
  w: number;
  k: number; // personal radius factor in the swirl
}

interface Tween {
  from: number[];
  to: number[];
  start: number;
  ms: number;
}

const MAX = 900;

function makeSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255, 250, 228, 1)");
  grad.addColorStop(0.22, "rgba(255, 222, 140, 0.85)");
  grad.addColorStop(0.55, "rgba(240, 175, 70, 0.25)");
  grad.addColorStop(1, "rgba(220, 150, 50, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export const GoldDust = forwardRef<GoldDustHandle, { className?: string }>(function GoldDust({ className = "" }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    motes: [] as Mote[],
    emitter: null as null | { x: number; y: number; rate: number; ring?: { rx: number; ry: number }; speed: [number, number]; acc: number },
    emitterTween: null as null | Tween,
    swirl: null as null | { x: number; y: number; r: number },
    swirlTween: null as null | Tween,
    alpha: 1,
    fadeTween: null as null | (Tween & { done: () => void }),
  });

  useImperativeHandle(ref, () => ({
    emit({ x, y, rate, ring, speed = [20, 80] }) {
      const s = state.current;
      if (!rate) {
        s.emitter = null;
        return;
      }
      s.emitter = { x, y, rate, ring, speed, acc: s.emitter?.acc ?? 0 };
      s.emitterTween = null;
    },
    moveEmitter(x, y, ms) {
      const s = state.current;
      if (!s.emitter) return;
      s.emitterTween = { from: [s.emitter.x, s.emitter.y], to: [x, y], start: performance.now(), ms };
    },
    burst(points, [fx, fy], spreadMs) {
      const s = state.current;
      for (const [x, y] of points) {
        if (s.motes.length >= MAX) s.motes.shift();
        const dx = x - fx;
        const dy = y - fy;
        const d = Math.hypot(dx, dy) || 1;
        const sp = 6 + Math.random() * 18;
        s.motes.push({
          x,
          y,
          vx: (dx / d) * sp + (Math.random() - 0.5) * 6,
          vy: (dy / d) * sp - 8 - Math.random() * 10,
          age: 0,
          life: 9,
          depth: 0.35 + Math.random() * 0.65,
          phase: Math.random() * 6.3,
          born: (Math.random() * spreadMs) / 1000,
          swirling: false,
          a: 0,
          r: 0,
          w: 0,
          k: 0,
        });
      }
    },
    swirl(x, y, r) {
      state.current.swirl = { x, y, r };
      state.current.swirlTween = null;
    },
    moveSwirl(x, y, r, ms) {
      const s = state.current;
      if (!s.swirl) return;
      s.swirlTween = { from: [s.swirl.x, s.swirl.y, s.swirl.r], to: [x, y, r], start: performance.now(), ms };
    },
    fade(ms) {
      return new Promise<void>((done) => {
        state.current.fadeTween = { from: [state.current.alpha], to: [0], start: performance.now(), ms, done };
      });
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const sprite = makeSprite();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let frame = 0;
    let last = performance.now();

    const resize = () => {
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const tween = (t: Tween | null, now: number) => {
      if (!t) return null;
      const p = Math.min(1, (now - t.start) / t.ms);
      const e = ease(p);
      return { values: t.from.map((f, i) => f + (t.to[i] - f) * e), done: p >= 1 };
    };

    const spawn = (now: number) => {
      const s = state.current;
      const em = s.emitter!;
      const angle = Math.random() * Math.PI * 2;
      const depth = Math.random();
      const sp = em.speed[0] + Math.random() * (em.speed[1] - em.speed[0]);
      let x = em.x + (Math.random() - 0.5) * 10;
      let y = em.y + (Math.random() - 0.5) * 10;
      if (em.ring) {
        x = em.x + Math.cos(angle) * em.ring.rx * (0.9 + Math.random() * 0.2);
        y = em.y + Math.sin(angle) * em.ring.ry * (0.9 + Math.random() * 0.2);
      }
      if (s.motes.length >= MAX) s.motes.shift();
      s.motes.push({
        x,
        y,
        vx: Math.cos(angle) * sp * (0.4 + depth * 0.8),
        vy: Math.sin(angle) * sp * (0.4 + depth * 0.8) - 6,
        age: 0,
        life: 2.4 + Math.random() * 2.6,
        depth,
        phase: Math.random() * 6.3,
        born: 0,
        swirling: false,
        a: 0,
        r: 0,
        w: 0,
        k: 0,
      });
      void now;
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;

      const et = tween(s.emitterTween, now);
      if (et && s.emitter) {
        [s.emitter.x, s.emitter.y] = et.values;
        if (et.done) s.emitterTween = null;
      }
      const st = tween(s.swirlTween, now);
      if (st && s.swirl) {
        [s.swirl.x, s.swirl.y, s.swirl.r] = st.values;
        if (st.done) s.swirlTween = null;
      }
      if (s.fadeTween) {
        const ft = tween(s.fadeTween, now)!;
        s.alpha = ft.values[0];
        if (ft.done) {
          const done = s.fadeTween.done;
          s.fadeTween = null;
          done();
        }
      }

      if (s.emitter && !s.swirl) {
        s.emitter.acc += s.emitter.rate * dt;
        while (s.emitter.acc >= 1) {
          s.emitter.acc -= 1;
          spawn(now);
        }
      }

      const W = canvas.width;
      const H = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "lighter";

      const sw = s.swirl;
      const alive: Mote[] = [];
      for (const m of s.motes) {
        if (m.born > 0) {
          m.born -= dt;
          alive.push(m);
          continue;
        }
        m.age += dt;
        if (sw) {
          if (!m.swirling) {
            m.swirling = true;
            m.a = Math.atan2(m.y - sw.y, m.x - sw.x);
            m.r = Math.hypot(m.x - sw.x, m.y - sw.y);
            m.w = 1.1 + Math.random() * 0.9;
            m.k = 0.8 + Math.random() * 0.4;
            m.life = Math.max(m.life, m.age + 30);
          }
          m.a += m.w * dt * (1 + 40 / (m.r + 30));
          m.r += (sw.r * m.k - m.r) * Math.min(1, dt * 2.4);
          m.x = sw.x + Math.cos(m.a) * m.r;
          m.y = sw.y + Math.sin(m.a) * m.r;
        } else {
          m.vy -= 4 * dt; // a gentle rise, like warm air
          m.vx *= 1 - 0.25 * dt;
          m.x += m.vx * dt;
          m.y += m.vy * dt;
        }
        if (m.age > m.life) continue;
        alive.push(m);

        const t = m.age / m.life;
        const life = m.swirling ? Math.min(1, m.age * 3) : Math.min(1, t * 6) * Math.min(1, (1 - t) * 3);
        const shimmer = 0.6 + 0.4 * Math.sin(m.phase + m.age * (3 + m.depth * 4));
        const a = life * shimmer * (0.3 + 0.7 * m.depth) * s.alpha;
        if (a <= 0.01) continue;
        const size = (0.8 + m.depth * 2.4) * 3.2;
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, m.x - size, m.y - size, size * 2, size * 2);
      }
      s.motes = alive;
      ctx.globalAlpha = 1;
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
});

/** Points inside the deity's shape (from his mask), mapped onto `rect`, for the dissolve. */
export async function sampleMask(src: string, rect: { left: number; top: number; width: number; height: number }, count: number) {
  const img = new Image();
  await new Promise<void>((resolve) => {
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
  const w = 90;
  const h = Math.max(1, Math.round((w * (img.naturalHeight || 130)) / (img.naturalWidth || 90)));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0, w, h);
  let data: Uint8ClampedArray;
  try {
    data = g.getImageData(0, 0, w, h).data;
  } catch {
    data = new Uint8ClampedArray(w * h * 4).fill(255);
  }
  const inside: Array<[number, number]> = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 140) inside.push([x, y]);
  const points: Array<[number, number]> = [];
  for (let i = 0; i < count && inside.length; i++) {
    const [x, y] = inside[Math.floor(Math.random() * inside.length)];
    points.push([rect.left + ((x + Math.random()) / w) * rect.width, rect.top + ((y + Math.random()) / h) * rect.height]);
  }
  return points;
}

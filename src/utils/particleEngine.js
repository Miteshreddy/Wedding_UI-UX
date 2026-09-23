/**
 * Particle engine for canvas-based ambient particles.
 */
export class ParticleEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.options = {
      count: options.count || 60,
      color: options.color || 'rgba(200,170,100,',
      minSize: options.minSize || 0.5,
      maxSize: options.maxSize || 2,
      speed: options.speed || 0.3,
      opacity: options.opacity || 0.6,
      drift: options.drift || true,
    };
    this.animId = null;
    this.running = false;
  }

  init() {
    this.resize();
    this.particles = Array.from({ length: this.options.count }, () =>
      this._createParticle()
    );
  }

  _createParticle(atBottom = false) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    return {
      x: Math.random() * w,
      y: atBottom ? h + Math.random() * 20 : Math.random() * h,
      size: this.options.minSize + Math.random() * (this.options.maxSize - this.options.minSize),
      opacity: Math.random() * this.options.opacity,
      vx: (Math.random() - 0.5) * this.options.speed,
      vy: -Math.random() * this.options.speed * 0.8 - 0.1,
      life: Math.random(),
      maxLife: 0.6 + Math.random() * 0.4,
    };
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  _tick() {
    const ctx = this.ctx;
    const w = this.canvas.width / window.devicePixelRatio;
    const h = this.canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 0.002;

      const fade = p.life < 0.1
        ? p.life / 0.1
        : p.life > p.maxLife - 0.1
        ? (p.maxLife - p.life) / 0.1
        : 1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.options.color}${(p.opacity * fade).toFixed(2)})`;
      ctx.fill();

      if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > w + 10) {
        this.particles[i] = this._createParticle(true);
      }
    });

    this.animId = requestAnimationFrame(() => this._tick());
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._tick();
  }

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  destroy() {
    this.stop();
  }
}

/**
 * Create a burst of particles from a point on canvas.
 */
export function createBurst(ctx, x, y, count = 40, color = 'rgba(200,170,80,') {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 0.5 + Math.random() * 2,
      opacity: 0.8 + Math.random() * 0.2,
      life: 0,
    });
  }

  let animId;
  const w = ctx.canvas.width / (window.devicePixelRatio || 1);
  const h = ctx.canvas.height / (window.devicePixelRatio || 1);

  const animate = () => {
    let alive = false;
    particles.forEach((p) => {
      if (p.opacity <= 0) return;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.opacity -= 0.015;
      p.life++;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${Math.max(0, p.opacity).toFixed(2)})`;
      ctx.fill();
    });
    if (alive) animId = requestAnimationFrame(animate);
  };
  animate();
  return () => cancelAnimationFrame(animId);
}

/** Full-screen canvas confetti (shared theme with Simple Punjabi). */
export function playConfetti(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const host = document.getElementById("confetti-layer") ?? document.body;
  host.querySelector("#vq-confetti-canvas")?.remove();

  const canvas = document.createElement("canvas");
  canvas.id = "vq-confetti-canvas";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let viewW = window.innerWidth;
  let viewH = window.innerHeight;
  let cx = viewW * 0.5;
  let cy = viewH * 0.35;

  const sizeCanvas = () => {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    canvas.style.width = `${viewW}px`;
    canvas.style.height = `${viewH}px`;
  };
  canvas.style.cssText =
    "position:absolute;top:0;left:0;display:block;pointer-events:none;";
  sizeCanvas();
  host.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ["#ff6b9d", "#ffd166", "#06d6a0", "#4cc9f0", "#c77dff", "#ffe66d"];
  const particles: {
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    rot: number;
    vr: number;
    color: string;
    life: number;
  }[] = [];
  for (let i = 0; i < 96; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 2.8;
    particles.push({
      x: cx,
      y: cy,
      w: 4 + Math.random() * 6,
      h: 6 + Math.random() * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.08,
      color: colors[(Math.random() * colors.length) | 0]!,
      life: 1,
    });
  }
  let frame = 0;
  const maxFrames = 260;
  const onResize = () => {
    const ox = cx / Math.max(viewW, 1);
    const oy = cy / Math.max(viewH, 1);
    sizeCanvas();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = viewW * ox;
    cy = viewH * oy;
  };
  window.addEventListener("resize", onResize);
  const tick = () => {
    ctx.clearRect(0, 0, viewW, viewH);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045;
      p.vx *= 0.996;
      p.rot += p.vr;
      p.life = 1 - frame / maxFrames;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    frame++;
    if (alive && frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      window.removeEventListener("resize", onResize);
      canvas.remove();
    }
  };
  requestAnimationFrame(tick);
}
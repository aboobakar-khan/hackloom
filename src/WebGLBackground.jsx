import { useEffect, useRef } from 'react';

export default function WebGLBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let animFrame;
    let time = 0;

    const resize = () => {
      width = window.innerWidth;
      height = document.documentElement.scrollHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const spacing = 44;
      const rows = Math.floor(height / spacing) + 2;
      const cols = Math.floor(width / spacing) + 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          particles.push({
            baseX: i * spacing,
            baseY: j * spacing,
            z: Math.random() * 100,
            size: Math.random() * 1.4 + 0.4,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.018;
      ctx.fillStyle = '#F97316';

      particles.forEach(p => {
        const breath = Math.sin(time + p.phase) * 0.5 + 0.5;
        const dx = mouse.x - p.baseX;
        const dy = mouse.y - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 280;
        let driftX = 0, driftY = 0;
        if (dist > 0 && dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          driftX = (dx / dist) * force * -18;
          driftY = (dy / dist) * force * -18;
        }
        const zFade = 1 - p.z / 100;
        ctx.globalAlpha = (0.08 + breath * 0.28) * zFade;
        ctx.beginPath();
        ctx.arc(p.baseX + driftX, p.baseY + driftY, p.size * (0.8 + breath * 0.4), 0, Math.PI * 2);
        ctx.fill();
      });

      animFrame = requestAnimationFrame(draw);
    };

    const handleMouseMove = e => { mouse.x = e.clientX + window.scrollX; mouse.y = e.clientY + window.scrollY; };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      background: '#050508',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.7,
          mixBlendMode: 'screen',
        }}
      />
      {/* Radial glow behind hero area */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        height: '600px',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(249,115,22,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Bottom fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(to top, #050508, transparent)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

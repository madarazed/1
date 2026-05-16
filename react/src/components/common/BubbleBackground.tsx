import React, { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  drift: number;
}

const BubbleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bubbles: Bubble[] = [];
    const BUBBLE_COUNT = 32; // Reducido a 30-35 para optimizar rendimiento con mayor tamaño

    const createBubble = (canvasWidth: number, canvasHeight: number, randomY = true): Bubble => ({
      x: Math.random() * canvasWidth,
      y: randomY ? Math.random() * canvasHeight : canvasHeight + Math.random() * 80,
      radius: Math.random() * 6 + 4,          // 4px – 10px (efecto Bokeh)
      speed: Math.random() * 0.3 + 0.1,       // 0.1 – 0.4px/frame (ascenso ultra suave)
      opacity: Math.random() * 0.08 + 0.04,   // 0.04 – 0.12 (fusión orgánica sin competir con textos)
      drift: (Math.random() - 0.5) * 0.25,    // leve movimiento horizontal ondulante
    });

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bubbles.length = 0;
      for (let i = 0; i < BUBBLE_COUNT; i++) {
        bubbles.push(createBubble(canvas.width, canvas.height, true));
      }
    };

    const drawBubble = (b: Bubble) => {
      ctx.beginPath();
      // Gradiente radial para simular profundidad Bokeh real
      const gradient = ctx.createRadialGradient(
        b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.05,
        b.x, b.y, b.radius
      );
      gradient.addColorStop(0, `rgba(220, 240, 255, ${b.opacity * 1.8})`);
      gradient.addColorStop(0.6, `rgba(160, 210, 255, ${b.opacity})`);
      gradient.addColorStop(1, `rgba(100, 170, 255, ${b.opacity * 0.3})`);
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.closePath();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((b) => {
        b.y -= b.speed;
        b.x += b.drift;

        if (b.y + b.radius < 0) {
          const fresh = createBubble(canvas.width, canvas.height, false);
          b.x = fresh.x;
          b.y = fresh.y;
          b.radius = fresh.radius;
          b.speed = fresh.speed;
          b.opacity = fresh.opacity;
          b.drift = fresh.drift;
        }

        drawBubble(b);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 20, mixBlendMode: 'screen' }}
    />
  );
};

export default BubbleBackground;

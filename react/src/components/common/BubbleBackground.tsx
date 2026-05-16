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
    const BUBBLE_COUNT = 45;

    const createBubble = (canvasWidth: number, canvasHeight: number, randomY = true): Bubble => ({
      x: Math.random() * canvasWidth,
      y: randomY ? Math.random() * canvasHeight : canvasHeight + Math.random() * 50,
      radius: Math.random() * 2.5 + 1,       // 1px – 3.5px
      speed: Math.random() * 0.6 + 0.2,      // 0.2 – 0.8px/frame
      opacity: Math.random() * 0.07 + 0.08,  // 0.08 – 0.15 (visible pero tenue)
      drift: (Math.random() - 0.5) * 0.3,    // leve movimiento horizontal
    });

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Rebuild bubble pool on resize
      bubbles.length = 0;
      for (let i = 0; i < BUBBLE_COUNT; i++) {
        bubbles.push(createBubble(canvas.width, canvas.height, true));
      }
    };

    const drawBubble = (b: Bubble) => {
      ctx.beginPath();
      // Pequeño degradado radial para simular brillo interior
      const gradient = ctx.createRadialGradient(
        b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.1,
        b.x, b.y, b.radius
      );
      gradient.addColorStop(0, `rgba(200, 230, 255, ${b.opacity * 1.6})`);
      gradient.addColorStop(1, `rgba(100, 180, 255, ${b.opacity * 0.4})`);
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.closePath();
    };

    const animate = () => {
      // CRÍTICO: Limpiar canvas completo antes de redibujar
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((b) => {
        b.y -= b.speed;
        b.x += b.drift;

        // Reiniciar burbuja cuando supera el tope
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

    // LIMPIEZA MANDATORIA: elimina fuga de memoria y bucle duplicado
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
      style={{ zIndex: 0 }}
    />
  );
};

export default BubbleBackground;

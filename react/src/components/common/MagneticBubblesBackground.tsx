import React, { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  baseSpeed: number;
  opacity: number;
  vx: number;
  vy: number;
}

const MagneticBubblesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 }); // Fuera de pantalla inicialmente

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let bubbles: Bubble[] = [];
    const NUM_BUBBLES = 50;
    const ATTRACTION_RADIUS = 150;
    const ATTRACTION_FORCE = 0.02;
    const FRICTION = 0.95;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initBubbles = () => {
      bubbles = [];
      for (let i = 0; i < NUM_BUBBLES; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 4 + 2, // 2px a 6px
          baseSpeed: Math.random() * 0.3 + 0.2, // 0.2 a 0.5px/frame
          opacity: Math.random() * 0.2 + 0.1, // 0.1 a 0.3
          vx: 0,
          vy: 0
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    // Para no dejar que las burbujas sigan atrayéndose a un punto fijo cuando el dedo/mouse sale
    const handlePointerLeaveOrUp = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('resize', () => {
      resizeCanvas();
      initBubbles(); // Re-inicializar para evitar burbujas fuera de limites si se achica
    });
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeaveOrUp);
    window.addEventListener('pointerup', handlePointerLeaveOrUp);

    resizeCanvas();
    initBubbles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: mouseX, y: mouseY } = mouseRef.current;

      bubbles.forEach(b => {
        // Calcular distancia al cursor
        const dx = mouseX - b.x;
        const dy = mouseY - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Física magnética
        if (distance < ATTRACTION_RADIUS) {
          const force = (ATTRACTION_RADIUS - distance) / ATTRACTION_RADIUS;
          b.vx += dx * force * ATTRACTION_FORCE;
          b.vy += dy * force * ATTRACTION_FORCE;
        }

        // Aplicar fricción (para suavizar el movimiento hacia el mouse)
        b.vx *= FRICTION;
        b.vy *= FRICTION;

        // Movimiento base hacia arriba
        b.y -= b.baseSpeed;

        // Sumar velocidades derivadas de la física magnética
        b.x += b.vx;
        b.y += b.vy;

        // Reinicio cuando salen de la pantalla por arriba o por los lados
        if (b.y + b.radius < 0 || b.x < 0 || b.x > canvas.width || b.y > canvas.height + 50) {
          b.y = canvas.height + b.radius + Math.random() * 50;
          b.x = Math.random() * canvas.width;
          b.vx = 0;
          b.vy = 0;
        }

        // Dibujar
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        
        // Color blanco con tinte cian/celeste para dar el look corporativo helado
        ctx.fillStyle = `rgba(220, 245, 255, ${b.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeaveOrUp);
      window.removeEventListener('pointerup', handlePointerLeaveOrUp);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-20 pointer-events-none mix-blend-screen"
    />
  );
};

export default MagneticBubblesBackground;

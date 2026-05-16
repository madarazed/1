import React, { useEffect, useRef } from 'react';

const BubbleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let bubbles: Bubble[] = [];

    class Bubble {
      x: number;
      y: number;
      radius: number;
      speed: number;
      opacity: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = Math.random() * 2.5 + 1; // Entre 1px y 3.5px
        this.speed = Math.random() * 0.6 + 0.2; // Entre 0.2 y 0.8
        this.opacity = Math.random() * 0.04 + 0.02; // Entre 0.02 y 0.06
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.y -= this.speed;
        if (this.y < -this.radius) {
          this.y = canvasHeight + this.radius;
          this.x = Math.random() * canvasWidth;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
        ctx.closePath();
      }
    }

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reinicializar burbujas para el nuevo tamaño
      bubbles = Array.from({ length: 45 }, () => new Bubble(canvas.width, canvas.height));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      bubbles.forEach(bubble => {
        bubble.update(canvas.width, canvas.height);
        bubble.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] mix-blend-overlay opacity-40"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
};

export default BubbleBackground;

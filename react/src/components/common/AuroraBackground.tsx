import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const AuroraBackground: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 50, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Orbe 1: Navy Oscuro Profundo (Se mueve en sentido opuesto)
  const x1 = useTransform(smoothX, (v) => -v * 0.5);
  const y1 = useTransform(smoothY, (v) => -v * 0.5);

  // Orbe 2: Cian Helado (Sigue al mouse directamente)
  const x2 = useTransform(smoothX, (v) => v * 1.2);
  const y2 = useTransform(smoothY, (v) => v * 1.2);

  // Orbe 3: Destello Ámbar/Luz Fría (Acento en centro-derecha)
  const x3 = useTransform(smoothX, (v) => v * 0.3);
  const y3 = useTransform(smoothY, (v) => -v * 0.3);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xOffset = (clientX / window.innerWidth - 0.5) * 100;
      const yOffset = (clientY / window.innerHeight - 0.5) * 100;
      
      mouseX.set(xOffset);
      mouseY.set(yOffset);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen bg-transparent">
      <motion.div className="absolute inset-0 w-full h-full">
        <motion.div
          className="absolute rounded-full opacity-[0.25] mix-blend-screen"
          style={{
            width: '60vw',
            height: '60vw',
            top: '-10%',
            left: '-10%',
            backgroundColor: '#003366',
            filter: 'blur(100px)',
            x: x1,
            y: y1,
          }}
        />

        <motion.div
          className="absolute rounded-full opacity-[0.25] mix-blend-screen"
          style={{
            width: '40vw',
            height: '40vw',
            bottom: '10%',
            right: '10%',
            backgroundColor: '#00a3ff',
            filter: 'blur(100px)',
            x: x2,
            y: y2,
          }}
        />

        <motion.div
          className="absolute rounded-full opacity-[0.15] mix-blend-screen"
          style={{
            width: '30vw',
            height: '30vw',
            top: '30%',
            left: '40%',
            backgroundColor: '#ffb347',
            filter: 'blur(100px)',
            x: x3,
            y: y3,
          }}
        />
      </motion.div>
    </div>
  );
};

export default AuroraBackground;

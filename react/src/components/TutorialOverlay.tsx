import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useTutorial } from '../context/TutorialContext';

const TOOLTIP_WIDTH = 288;
const TOOLTIP_GAP = 12;
const VIEWPORT_MARGIN = 12;
const ESTIMATED_TOOLTIP_HEIGHT = 260;

const calcTooltipPosition = (target: DOMRect | any, winWidth: number, winHeight: number, preferRight: boolean, isCombined: boolean = false, combinedBottom: number = 0) => {
  let top = target.top + target.height / 2 - ESTIMATED_TOOLTIP_HEIGHT / 2;
  let left = 0;
  let arrowSide: 'left' | 'right' | 'top' | 'bottom' = 'left';

  if (preferRight && target.right + TOOLTIP_GAP + TOOLTIP_WIDTH + VIEWPORT_MARGIN < winWidth) {
    left = target.right + TOOLTIP_GAP; arrowSide = 'left';
  } else if (target.left - TOOLTIP_GAP - TOOLTIP_WIDTH - VIEWPORT_MARGIN > 0) {
    left = target.left - TOOLTIP_GAP - TOOLTIP_WIDTH; arrowSide = 'right';
  } else if (isCombined) {
    // [HUGGING DOCKING] Ancla justo debajo del límite inferior del foco de resultados
    top = combinedBottom + TOOLTIP_GAP;
    left = winWidth / 2 - TOOLTIP_WIDTH / 2;
    arrowSide = 'top'; 
  } else if (target.bottom + TOOLTIP_GAP + ESTIMATED_TOOLTIP_HEIGHT + VIEWPORT_MARGIN < winHeight) {
    top = target.bottom + TOOLTIP_GAP; left = target.left + target.width / 2 - TOOLTIP_WIDTH / 2; arrowSide = 'top';
  } else {
    top = target.top - TOOLTIP_GAP - ESTIMATED_TOOLTIP_HEIGHT; left = target.left + target.width / 2 - TOOLTIP_WIDTH / 2; arrowSide = 'bottom';
  }

  left = Math.max(VIEWPORT_MARGIN, Math.min(left, winWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN));
  top = Math.max(VIEWPORT_MARGIN, Math.min(top, winHeight - ESTIMATED_TOOLTIP_HEIGHT - VIEWPORT_MARGIN));
  return { top, left, arrowSide };
};

export const TutorialOverlay: React.FC = () => {
  const { tutorialStep, isActive, closeTutorial, setStep, dismissStep2, dismissStep3 } = useTutorial();
  const [targetPos, setTargetPos] = useState<any>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const step2TimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNextToStep2 = () => {
    const vipTarget = document.getElementById('tutorial-add-cart') || document.getElementById('promociones');
    if (vipTarget) {
      vipTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      step2TimerRef.current = setTimeout(() => setStep(2), 800);
    } else { setStep(2); }
  };

  useEffect(() => { return () => { if (step2TimerRef.current) clearTimeout(step2TimerRef.current); }; }, []);

  // --- INICIO: SAFE SCROLL LOCK ---
  useEffect(() => {
    // SOLO bloqueamos si está activo Y está en un paso válido (1, 2 o 3)
    // Esto respeta las transiciones y bloqueos entre pasos y evita el bug del paso float 1.5.
    if (isActive && (tutorialStep === 1 || tutorialStep === 2 || tutorialStep === 3)) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Liberación forzosa inmediata si se cierra, omite o termina
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
    }

    // Función de limpieza estricta: Si el componente se desmonta abruptamente,
    // el navegador recupera el scroll pase lo que pase.
    return () => {
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
    };
  }, [isActive, tutorialStep]); 
  // --- FIN: SAFE SCROLL LOCK ---

  const updatePosition = useCallback(() => {
    let elementId = '';
    if (tutorialStep === 1) elementId = 'tutorial-search';
    else if (tutorialStep === 2) elementId = 'tutorial-add-cart';
    else if (tutorialStep === 3) elementId = 'tutorial-sede';
    
    const el = document.getElementById(elementId);
    if (el) {
      const r = el.getBoundingClientRect();
      let top = r.top, left = r.left, right = r.right, bottom = r.bottom;
      let isCombined = false;

      // Si estamos en el Paso 1, intentamos fusionar la caja con los resultados
      if (tutorialStep === 1) {
        const resEl = document.getElementById('tutorial-search-results');
        if (resEl) {
          const resR = resEl.getBoundingClientRect();
          if (resR.height > 0) { // Solo si el menú está visible/desplegado
            top = Math.min(top, resR.top);
            left = Math.min(left, resR.left);
            right = Math.max(right, resR.right);
            bottom = Math.max(bottom, resR.bottom);
            isCombined = true;
          }
        }
      }

      setTargetPos({ 
        top, left, width: right - left, height: bottom - top, 
        isCombined,
        originalRect: r
      } as any);
    } else {
      setTargetPos(null);
    }
  }, [tutorialStep]);

  useEffect(() => {
    if (!isActive) return;
    updatePosition();

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      handleScroll();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    const interval = setInterval(updatePosition, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [isActive, updatePosition]);

  if (!isActive || tutorialStep === 0 || tutorialStep === 1.5) return null;

  const position = targetPos 
    ? calcTooltipPosition(
        targetPos.originalRect || targetPos, 
        windowSize.width, 
        windowSize.height, 
        tutorialStep === 1,
        targetPos.isCombined,
        targetPos.top + targetPos.height // Pasamos el límite inferior del foco mutante
      )
    : { top: windowSize.height / 2 - ESTIMATED_TOOLTIP_HEIGHT / 2, left: windowSize.width / 2 - TOOLTIP_WIDTH / 2, arrowSide: 'top' as const };

  const ArrowEl = ({ side }: { side: 'top'|'bottom'|'left'|'right' }) => {
    const baseClass = "absolute w-0 h-0 border-solid pointer-events-none";
    if (side === 'top') return <div className={`${baseClass} border-b-white border-l-transparent border-r-transparent border-x-8 border-b-8 -top-2 left-1/2 -translate-x-1/2`} />;
    if (side === 'bottom') return <div className={`${baseClass} border-t-white border-l-transparent border-r-transparent border-x-8 border-t-8 -bottom-2 left-1/2 -translate-x-1/2`} />;
    if (side === 'left') return <div className={`${baseClass} border-r-white border-t-transparent border-b-transparent border-y-8 border-r-8 -left-2 top-1/2 -translate-y-1/2`} />;
    return <div className={`${baseClass} border-l-white border-t-transparent border-b-transparent border-y-8 border-l-8 -right-2 top-1/2 -translate-y-1/2`} />;
  };

  const tooltipClass = "bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-[288px] flex flex-col gap-3";
  const animProps = { initial: { opacity: 0, scale: 0.95, y: 8 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 8 }, transition: { type: "spring", stiffness: 300, damping: 25 } };

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none">
      <AnimatePresence>
        {targetPos && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute transition-all duration-300 ease-out z-[9999] pointer-events-auto"
            style={{ 
              top: targetPos.top, 
              left: targetPos.left, 
              width: targetPos.width, 
              height: targetPos.height, 
              borderRadius: targetPos.isCombined ? '24px' : (tutorialStep === 1 ? '9999px' : '12px'), 
              boxShadow: '0 0 0 9999px rgba(2,6,23,0.65)' 
            }}
            onClick={(e) => {
              if (targetPos) {
                const rect = targetPos;
                const x = e.clientX;
                const y = e.clientY;
                if (x >= rect.left && x <= rect.left + rect.width &&
                    y >= rect.top && y <= rect.top + rect.height) {
                  // Clic dentro del hueco del tutorial: permitir pasar el evento al elemento de abajo
                  const el = e.currentTarget;
                  el.style.pointerEvents = 'none';
                  const underEl = document.elementFromPoint(x, y);
                  if (underEl) {
                    (underEl as HTMLElement).click();
                    if (underEl.tagName === 'INPUT' || underEl.tagName === 'TEXTAREA') {
                      (underEl as HTMLElement).focus();
                    }
                  }
                  el.style.pointerEvents = 'auto';
                  return;
                }
              }
              // Clic en la máscara oscura: frenar en seco la propagación
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div key={`step${tutorialStep}`} {...animProps} className="fixed z-[10000] pointer-events-auto isolate transform-gpu" style={{ top: position.top, left: position.left }}>
          {targetPos && <ArrowEl side={position.arrowSide} />}
          {tutorialStep === 1 && (
            <div className={tooltipClass}>
              <div className="flex justify-between items-start"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PASO 1 DE 3</span><button onClick={() => setStep(1.5)} className="text-gray-400 hover:text-red-500 transition-colors p-1 -m-1"><X size={16} /></button></div>
              <div><h3 className="font-black text-sm uppercase italic tracking-tight text-red-600 mb-2">&iexcl;ENCUENTRA TU BEBIDA FAVORITA AL INSTANTE!</h3><p className="text-xs font-medium text-blue-950 leading-relaxed">Escribe aqu&iacute; y presiona Enter, o haz clic en la lupa para buscar en todo nuestro cat&aacute;logo.</p></div>
              <div className="flex flex-col gap-3 mt-1"><button onClick={handleNextToStep2} className="bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md">SIGUIENTE <ArrowRight size={14} /></button><button onClick={closeTutorial} className="text-[9px] font-bold text-blue-600 hover:text-blue-800 underline text-center w-full">No volver a mostrar el tutorial</button></div>
            </div>
          )}
          {tutorialStep === 2 && (
            <div className={tooltipClass}>
              <div className="flex justify-between items-start"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PASO 2 DE 3</span><button onClick={dismissStep2} className="text-gray-400 hover:text-red-500 transition-colors p-1 -m-1"><X size={16} /></button></div>
              <div><h3 className="font-black text-sm uppercase italic tracking-tight text-red-600 mb-2">SELECCIONA TU PRODUCTO</h3><p className="text-xs font-medium text-blue-950 leading-relaxed">&iexcl;A&ntilde;ade tu primera bebida! Haz clic en el bot&oacute;n '+' iluminado para armar tu bolsa de compras. Precios mayoristas actualizados en tiempo real.</p></div>
              <div className="mt-1"><button onClick={closeTutorial} className="text-[9px] font-bold text-blue-600 hover:text-blue-800 underline text-center w-full">No volver a mostrar el tutorial</button></div>
            </div>
          )}
          {tutorialStep === 3 && (
            <div className={tooltipClass}>
              <div className="flex justify-between items-start"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PASO 3 DE 3</span><button onClick={dismissStep3} className="text-gray-400 hover:text-red-500 transition-colors p-1 -m-1"><X size={16} /></button></div>
              <div><h3 className="font-black text-sm uppercase italic tracking-tight text-red-600 mb-2">&iexcl;FINALIZA TU PEDIDO!</h3><p className="text-xs font-medium text-blue-950 leading-relaxed">Selecciona la sede de despacho y env&iacute;a tu orden directo por WhatsApp. &iexcl;As&iacute; de f&aacute;cil!</p></div>
              <div className="flex flex-col gap-3 mt-1"><button onClick={closeTutorial} className="bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest py-3 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-md">&iexcl;FINALIZAR TUTORIAL! 🚀</button></div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
};
export default TutorialOverlay;

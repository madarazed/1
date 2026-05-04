import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Info, ListChecks, AlertCircle } from 'lucide-react';

interface HelpContent {
  title: string;
  description: string;
  steps: string[];
  notes: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  content: HelpContent;
}

const HelpModal: React.FC<Props> = ({ isOpen, onClose, content }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-[#0F172A] p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <HelpCircle size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter">Asistente Nexus</h2>
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">{content.title}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
              
              {/* 1. Descripción General */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Info size={18} />
                  <h3 className="text-xs font-black uppercase tracking-widest">1. Descripción General</h3>
                </div>
                <p className="text-sm font-bold text-gray-600 leading-relaxed pl-7">
                  {content.description}
                </p>
              </section>

              {/* 2. Paso a Paso */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <ListChecks size={18} />
                  <h3 className="text-xs font-black uppercase tracking-widest">2. Paso a Paso</h3>
                </div>
                <div className="pl-7 space-y-3">
                  {content.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 border border-blue-100">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-bold text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Notas Importantes */}
              <section className="space-y-3 bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle size={18} />
                  <h3 className="text-xs font-black uppercase tracking-widest">3. Notas Importantes</h3>
                </div>
                <ul className="pl-7 space-y-2">
                  {content.notes.map((note, idx) => (
                    <li key={idx} className="text-xs font-bold text-orange-800/80 flex items-start gap-2 italic">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                      {note}
                    </li>
                  ))}
                </ul>
              </section>

            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center shrink-0">
              <button 
                onClick={onClose}
                className="px-12 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default HelpModal;

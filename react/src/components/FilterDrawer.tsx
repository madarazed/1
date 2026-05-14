import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, SlidersHorizontal, Check } from 'lucide-react';

interface Marca {
  id: number;
  nombre: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  priceRange: string;
  setPriceRange: (val: string) => void;
  selectedMarca: string;
  setSelectedMarca: (val: string) => void;
  availableBrands: Marca[];
  priceOptions: { value: string; label: string }[];
}

const FilterDrawer = ({
  isOpen,
  onClose,
  priceRange,
  setPriceRange,
  selectedMarca,
  setSelectedMarca,
  availableBrands,
  priceOptions
}: FilterDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white z-[101] shadow-2xl flex flex-col lg:hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-primary" />
                <h2 className="text-xl font-black text-primary uppercase italic tracking-tighter">Filtros</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Rango de Precios */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Tag size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Rango de Precio</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {priceOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPriceRange(opt.value)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        priceRange === opt.value
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                          : "bg-white border-gray-100 text-gray-500 hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm font-bold">{opt.label}</span>
                      {priceRange === opt.value && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marcas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <SlidersHorizontal size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Marcas</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setSelectedMarca('all')}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      selectedMarca === 'all'
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : "bg-white border-gray-100 text-gray-500 hover:border-primary/50"
                    }`}
                  >
                    <span className="text-sm font-bold">Todas las marcas</span>
                    {selectedMarca === 'all' && <Check size={16} />}
                  </button>
                  {availableBrands.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMarca(String(m.id))}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        selectedMarca === String(m.id)
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                          : "bg-white border-gray-100 text-gray-500 hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm font-bold">{m.nombre}</span>
                      {selectedMarca === String(m.id) && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100">
              <button
                onClick={onClose}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Ver Productos
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;

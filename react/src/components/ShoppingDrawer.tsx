import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ShoppingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingDrawer = ({ isOpen, onClose }: ShoppingDrawerProps) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    totalAmount, 
    totalItems,
    selectedSede,
    setSelectedSede,
    generateWhatsAppLink
  } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white border-l border-gray-100 shadow-2xl z-[100] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-primary/5 p-2 rounded-xl">
                  <ShoppingBag className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Tu Carrito</h2>
                  <p className="text-[10px] font-bold text-text-main/40 uppercase tracking-widest">{totalItems} Productos seleccionados</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-primary"
              >
                <X size={24} />
              </button>
            </div>

            {/* Products List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    Selecciona la sede más cercana
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedSede('centro')}
                      className={`py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all border ${
                        selectedSede === 'centro'
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                          : "bg-white text-gray-400 border-gray-100 hover:border-primary/30"
                      }`}
                    >
                      Sede Centro
                    </button>
                    <button
                      onClick={() => setSelectedSede('salado')}
                      className={`py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all border ${
                        selectedSede === 'salado'
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                          : "bg-white text-gray-400 border-gray-100 hover:border-primary/30"
                      }`}
                    >
                      El Salado
                    </button>
                  </div>
                </div>
              )}

              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                  <ShoppingBag size={64} />
                  <p className="font-black text-xl uppercase italic">Tu carrito está vacío</p>
                  <p className="text-xs font-bold uppercase tracking-widest">¡Agrega algo delicioso!</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0 relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-black text-primary text-sm uppercase leading-tight italic">{item.title}</h4>
                      <p className="text-xs font-bold text-primary-light">{item.subtitle || 'Calidad Garantizada'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-black text-primary text-sm">{formatCurrency(item.currentPrice * item.quantity)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors self-start p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer (Fixed) */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-text-main/60 uppercase tracking-tighter">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-lg font-black text-primary uppercase italic">Total</span>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-primary font-headline tracking-tighter leading-none">{formatCurrency(totalAmount)}</span>
                      <span className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest text-right leading-tight italic">
                        + costo de envío<br/>
                        <span className="text-[8px] font-bold opacity-80">(envio gratis en la mayoria de productos)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const link = generateWhatsAppLink();
                    if (link) window.open(link, '_blank');
                  }}
                  disabled={!selectedSede || cartItems.length === 0}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 ${
                    !selectedSede || cartItems.length === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {!selectedSede ? "Elige una Sede" : "Finalizar Pedido"}
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                     <MessageCircle size={18} />
                  </motion.div>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShoppingDrawer;

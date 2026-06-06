import React, { createContext, useContext, useState } from 'react';
import { SEDES } from '../constants';

export interface CartItem {
  id: number | string;
  title: string;
  currentPrice: number;
  image: string;
  quantity: number;
  subtitle?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, e?: any) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  selectedSede: 'centro' | 'salado' | null;
  setSelectedSede: (sede: 'centro' | 'salado' | null) => void;
  generateWhatsAppLink: () => string;
  totalAmount: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedSede, setSelectedSede] = useState<'centro' | 'salado' | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: any, e?: any) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });

    if (e && (e.clientX || (e.touches && e.touches.length > 0))) {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (clientX && clientY) {
        const imageUrl = product.image || product.url_imagen || '/placeholder.jpg';
        
        const flyEl = document.createElement('div');
        flyEl.style.position = 'fixed';
        flyEl.style.left = `${clientX - 20}px`;
        flyEl.style.top = `${clientY - 20}px`;
        flyEl.style.width = '40px';
        flyEl.style.height = '40px';
        flyEl.style.borderRadius = '50%';
        flyEl.style.backgroundImage = `url(${imageUrl})`;
        flyEl.style.backgroundSize = 'cover';
        flyEl.style.backgroundPosition = 'center';
        flyEl.style.zIndex = '99999';
        flyEl.style.pointerEvents = 'none';
        flyEl.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        flyEl.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
        flyEl.style.border = '2px solid #003366';

        document.body.appendChild(flyEl);

        requestAnimationFrame(() => {
          const isMobile = window.innerWidth < 1024;
          const cartBtn = document.getElementById(isMobile ? 'mobile-cart-btn' : 'desktop-cart-btn');
          let targetX = isMobile ? window.innerWidth / 4 : 48;
          let targetY = isMobile ? window.innerHeight - 30 : window.innerHeight - 48;

          if (cartBtn) {
            const rect = cartBtn.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
          }

          flyEl.style.left = `${targetX - 20}px`;
          flyEl.style.top = `${targetY - 20}px`;
          flyEl.style.transform = 'scale(0.1) rotate(360deg)';
          flyEl.style.opacity = '0';
        });

        setTimeout(() => {
          flyEl.remove();
        }, 600);
      }
    }
  };

  const removeFromCart = (id: number | string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.currentPrice || 0) * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const generateWhatsAppLink = () => {
    if (!selectedSede) return "";

    const sede = selectedSede === 'centro' ? SEDES.CENTRO : SEDES.SALADO;
    const phone = sede.wa;
    
    let message = "¡Hola Rapifrios! 👋\n\n";
    message += `Quiero realizar un pedido para la sede: *${sede.nombre}*\n\n`;
    message += "*Detalle del pedido:*\n";
    message += "--------------------------\n";
    
    cartItems.forEach(item => {
      const itemSubtotal = (item.currentPrice || 0) * item.quantity;
      message += `• ${item.quantity}x ${item.title} ($${itemSubtotal.toLocaleString('es-CO')})\n`;
    });
    
    message += "--------------------------\n";
    message += `*TOTAL A PAGAR: $${totalAmount.toLocaleString('es-CO')}*\n\n`;
    message += "Quedo atento a la confirmación. ¡Gracias!";

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      selectedSede,
      setSelectedSede,
      generateWhatsAppLink,
      totalAmount,
      totalItems,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

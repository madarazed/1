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
  addToCart: (product: any) => void;
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

  const addToCart = (product: any) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
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

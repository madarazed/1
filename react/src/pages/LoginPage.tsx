import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user: authUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    // Limpieza de seguridad para evitar roles cacheados
    if (!authUser) localStorage.clear();
    
    if (authUser) {
      const isRepartidor = authUser.roles.some(r => r.nombre === 'Repartidor' || r.nombre === 'Conductor');
      const isAdmin = authUser.roles.some(r => ['Superadmin', 'Admin Sucursal'].includes(r.nombre));
      
      if (isRepartidor && !isAdmin) {
        navigate('/repartidor/checkin');
      } else if (isAdmin) {
        navigate('/admin');
      } else if (authUser.role === 'cliente' || String(authUser.id_rol) === '6') {
        navigate('/vip-portal');
      } else {
        navigate('/');
      }
    }
  }, [authUser, navigate]);

  return (
    <div className="min-h-screen bg-surface-light flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 border border-gray-100"
      >
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Rapifrios" className="h-12 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-primary uppercase italic tracking-tighter">Bienvenido</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Accede a tu panel de control</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="admin@rapifrios.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full primary-cta-btn py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Entrar ahora'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            ¿Olvidaste tu contraseña? <span className="text-primary cursor-pointer hover:underline">Contacta a soporte</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

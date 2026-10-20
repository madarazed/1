import { useState, useEffect, type FormEvent } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  MapPin, 
  Tags, 
  DollarSign, 
  Clock, 
  Save, 
  Plus, 
  Edit2, 
  ShieldAlert,
  X,
  Trash2,
  Loader2,
  MessageSquare,
  Phone,
  ExternalLink,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const fetcher = (url: string) => api.get(url).then(res => res.data);

const SettingsManager = () => {
  const { user } = useAuth();
  const isSuperadmin = user?.roles?.some((r: any) => r.nombre === 'Superadmin');
  const [activeTab, setActiveTab] = useState('globales');

  // Si no es superadmin, mostramos bloqueo inmediatamente
  if (!isSuperadmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-500/20">
          <ShieldAlert size={48} className="text-red-600" />
        </div>
        <h2 className="text-3xl font-black text-[#0F172A] uppercase italic tracking-tighter mb-2">Acceso Restringido</h2>
        <p className="text-gray-500 max-w-md">El módulo de Configuración Maestra es de acceso exclusivo para el Superadmin. Contacta a soporte técnico si necesitas modificar parámetros globales.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="bg-[#0F172A] p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Settings className="text-blue-400" size={24} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Configuración Maestra</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-lg">
            Gestión de parámetros del sistema, tablas maestras y reglas de negocio globales. Los cambios aquí afectan el comportamiento de toda la plataforma.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        {[
          { id: 'globales', label: 'Parámetros Globales', icon: DollarSign },
          { id: 'sedes', label: 'Gestión de Sedes', icon: MapPin },
          { id: 'categorias', label: 'Categorías', icon: Tags },
          { id: 'whatsapp', label: 'Redirección WhatsApp', icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none justify-center ${
              activeTab === tab.id 
                ? 'bg-[#0F172A] text-white shadow-md shadow-slate-900/20' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? "text-blue-400" : ""} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[400px]">
        {activeTab === 'globales' && <GlobalParamsTab />}
        {activeTab === 'sedes' && <SedesTab />}
        {activeTab === 'categorias' && <CategoriasTab />}
        {activeTab === 'whatsapp' && <WhatsAppRedirectTab />}
      </div>
    </div>
  );
};

// --- SUBCOMPONENTES DE PESTAÑAS ---

const GlobalParamsTab = () => {
  const { data, mutate } = useSWR('/admin/configuracion/global', fetcher);
  const [params, setParams] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      // Initialize with defaults if empty
      const defaults = [
        { key: 'hora_limite_checklist', value: '08:00', type: 'string', description: 'Hora máxima para el checklist diario' }
      ];

      if (data.length === 0) {
        setParams(defaults);
      } else {
        // Merge defaults with existing data to ensure all keys show
        const merged = defaults.map(def => {
          const existing = data.find((d: any) => d.key === def.key);
          return existing || def;
        });
        setParams(merged);
      }
    }
  }, [data]);

  const handleChange = (key: string, value: string) => {
    setParams(params.map(p => p.key === key ? { ...p, value } : p));
  };

  const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

  const validateParams = (): boolean => {
    for (const p of params) {
      if (p.type === 'integer') {
        const num = Number(p.value);
        if (!Number.isInteger(num) || num <= 0) {
          toast.error(`❌ "${p.description || p.key}" debe ser un número entero mayor a cero.`);
          return false;
        }
      }
      if (p.key.includes('url') || p.key.includes('link')) {
        if (p.value && !URL_REGEX.test(p.value)) {
          toast.error(`❌ "${p.description || p.key}" no es una URL válida (debe iniciar con http:// o https://).`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateParams()) return;
    setSaving(true);
    try {
      await api.post('/admin/configuracion/global', params);
      toast.success('Parámetros actualizados correctamente');
      mutate();
    } catch (err) {
      toast.error('Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-black text-[#0F172A] uppercase italic tracking-tighter">Variables del Sistema</h3>
          <p className="text-xs text-gray-500 mt-1">Estos valores afectan cálculos en toda la plataforma (Nómina, Logística, etc.)</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {params.map(p => (
          <div key={p.key} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{p.description || p.key}</label>
            <div className="flex items-center gap-3">
              {p.type === 'integer' && <DollarSign size={16} className="text-gray-400" />}
              {p.key.includes('hora') && <Clock size={16} className="text-gray-400" />}
              <input 
                type={p.type === 'integer' ? 'number' : (p.key.includes('hora') ? 'time' : 'text')}
                value={p.value}
                onChange={(e) => handleChange(p.key, e.target.value)}
                className="w-full bg-transparent border-none p-0 text-lg font-bold text-[#0F172A] focus:ring-0"
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-2 font-mono">{p.key} [{p.type}]</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SedesTab = () => {
  const { data: sedes, mutate } = useSWR('/admin/configuracion/sedes', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', direccion: '', telefono: '' });
  const [sedeEnEdicion, setSedeEnEdicion] = useState<any>(null);

  const PHONE_REGEX = /^[0-9]{10}$/;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('❌ El nombre de la sede es obligatorio.');
      return;
    }
    if (formData.telefono && !PHONE_REGEX.test(formData.telefono)) {
      toast.error('❌ El teléfono debe contener exactamente 10 dígitos numéricos (ej. 3001234567).');
      return;
    }

    try {
      await api.post('/admin/configuracion/sedes', formData);
      toast.success('Sede agregada correctamente');
      setFormData({ nombre: '', direccion: '', telefono: '' });
      setShowForm(false);
      mutate();
    } catch (err) {
      toast.error('Error al agregar sede');
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!sedeEnEdicion.nombre.trim()) {
      toast.error('❌ El nombre de la sede es obligatorio.');
      return;
    }
    if (sedeEnEdicion.telefono && !PHONE_REGEX.test(sedeEnEdicion.telefono)) {
      toast.error('❌ El teléfono debe contener exactamente 10 dígitos numéricos (ej. 3001234567).');
      return;
    }
    try {
      await api.put(`/admin/configuracion/sedes/${sedeEnEdicion.id}`, sedeEnEdicion);
      toast.success('Sede actualizada correctamente');
      setSedeEnEdicion(null);
      mutate();
    } catch (err) {
      toast.error('Error al actualizar sede');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-xl font-black text-[#0F172A] uppercase italic tracking-tighter">Sucursales Activas</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-[#1E293B] transition-all"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancelar' : 'Nueva Sede'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            onSubmit={handleSubmit}
          >
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 mb-6 space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">Registrar Sucursal</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required placeholder="Nombre (Ej. Norte)" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 font-medium" />
                <input placeholder="Dirección" value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 font-medium" />
                <input placeholder="Teléfono" value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 font-medium" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">Guardar Sede</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sedes?.map((s: any) => (
          <div key={s.id} className="p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-black text-lg text-[#0F172A]">{s.nombre}</h4>
              <button 
                onClick={() => setSedeEnEdicion(s)}
                className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {s.direccion || 'Sin dirección'}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {sedeEnEdicion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8"
              onSubmit={handleUpdate}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-800 uppercase italic leading-none mb-1">Editar Sucursal</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sedeEnEdicion.nombre}</p>
                </div>
                <button type="button" onClick={() => setSedeEnEdicion(null)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <input required placeholder="Nombre (Ej. Norte)" value={sedeEnEdicion.nombre} onChange={e=>setSedeEnEdicion({...sedeEnEdicion, nombre: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 font-medium" />
                <input placeholder="Dirección" value={sedeEnEdicion.direccion || ''} onChange={e=>setSedeEnEdicion({...sedeEnEdicion, direccion: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 font-medium" />
                <input placeholder="Teléfono" value={sedeEnEdicion.telefono || ''} onChange={e=>setSedeEnEdicion({...sedeEnEdicion, telefono: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 font-medium" />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                Guardar Cambios
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoriasTab = () => {
  const { data: categorias, mutate } = useSWR('/categorias', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/configuracion/categorias', formData);
      toast.success('Categoría agregada correctamente');
      setFormData({ nombre: '', descripcion: '' });
      setShowForm(false);
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al agregar categoría');
    }
  };

  const handleDeleteCategoria = async (categoria: any) => {
    if (categoria.nombre?.toLowerCase().trim() === 'general') {
      toast.error('La categoría "General" es predeterminada y no se puede eliminar.');
      return;
    }

    const confirmed = window.confirm(
      `¿Deseas eliminar la categoría "${categoria.nombre}"?\n\nLos productos asignados a esta categoría se transferirán automáticamente a la categoría "General".`
    );
    if (!confirmed) return;

    setDeletingId(categoria.id);
    try {
      const res = await api.delete(`/admin/configuracion/categorias/${categoria.id}`);
      toast.success(res.data?.message || `Categoría "${categoria.nombre}" eliminada correctamente`);
      mutate();
    } catch (err: any) {
      console.error('Error al eliminar categoría:', err);
      toast.error(err.response?.data?.message || 'Error al eliminar la categoría');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-xl font-black text-[#0F172A] uppercase italic tracking-tighter">Clasificación de Inventario</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-[#1E293B] transition-all"
        >
          {showForm ? 'Cancelar' : 'Nueva Categoría'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            onSubmit={handleSubmit}
          >
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Nombre de Categoría" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 font-medium" />
                <input placeholder="Descripción breve" value={formData.descripcion} onChange={e=>setFormData({...formData, descripcion: e.target.value})} className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 font-medium" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">Guardar</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categorias?.map((c: any) => {
          const isGeneral = c.nombre?.toLowerCase().trim() === 'general';
          return (
            <div 
              key={c.id} 
              className="relative p-5 rounded-2xl border border-gray-100 bg-gray-50 text-center flex flex-col items-center justify-center gap-2 hover:bg-blue-50/60 hover:border-blue-100 transition-all group shadow-sm hover:shadow"
            >
              {isGeneral ? (
                <span 
                  className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[9px] font-black uppercase tracking-wider"
                  title="Categoría predeterminada del sistema"
                >
                  General
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategoria(c);
                  }}
                  disabled={deletingId === c.id}
                  className="absolute top-2.5 right-2.5 p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title={`Eliminar categoría ${c.nombre}`}
                >
                  {deletingId === c.id ? (
                    <Loader2 size={15} className="animate-spin text-rose-500" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              )}

              <Tags className="text-gray-400 group-hover:text-blue-500 transition-colors" size={22} />
              <span className="font-black text-xs text-[#0F172A] uppercase tracking-wide">{c.nombre}</span>
              {c.descripcion && (
                <span className="text-[10px] text-gray-400 font-medium line-clamp-1">{c.descripcion}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WhatsAppRedirectTab = () => {
  const { data, mutate, isLoading } = useSWR('/admin/configuracion/whatsapp', fetcher);
  const [selectedSedeKey, setSelectedSedeKey] = useState<'centro' | 'salado'>('centro');
  const [phoneCentro, setPhoneCentro] = useState('3124900547');
  const [phoneSalado, setPhoneSalado] = useState('3184915295');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      if (data.centro?.telefono) {
        setPhoneCentro(data.centro.telefono);
      } else if (data.centro?.wa) {
        setPhoneCentro(data.centro.wa.replace(/^57/, ''));
      }

      if (data.salado?.telefono) {
        setPhoneSalado(data.salado.telefono);
      } else if (data.salado?.wa) {
        setPhoneSalado(data.salado.wa.replace(/^57/, ''));
      }
    }
  }, [data]);

  const cleanDigits = (val: string) => val.replace(/\D/g, '').slice(0, 10);

  const currentNumber = selectedSedeKey === 'centro' ? phoneCentro : phoneSalado;
  const setCurrentNumber = (val: string) => {
    const cleaned = cleanDigits(val);
    if (selectedSedeKey === 'centro') setPhoneCentro(cleaned);
    else setPhoneSalado(cleaned);
  };

  const currentSedeName = selectedSedeKey === 'centro' ? 'Sede Centro (La 17)' : 'Sede El Salado';
  const fullWhatsAppNumber = currentNumber ? `57${currentNumber}` : '';
  const testUrl = fullWhatsAppNumber 
    ? `https://wa.me/${fullWhatsAppNumber}?text=${encodeURIComponent(`¡Hola Rapifrios! 👋 Este es un mensaje de prueba para verificar la línea de pedidos de la ${currentSedeName}.`)}`
    : '';

  const handleSave = async () => {
    if (phoneCentro.length !== 10) {
      toast.error('❌ El teléfono de Sede Centro debe tener 10 dígitos (ej: 3124900547).');
      return;
    }
    if (phoneSalado.length !== 10) {
      toast.error('❌ El teléfono de Sede El Salado debe tener 10 dígitos (ej: 3184915295).');
      return;
    }

    setSaving(true);
    try {
      await api.post('/admin/configuracion/whatsapp', {
        whatsapp_centro: `57${phoneCentro}`,
        whatsapp_salado: `57${phoneSalado}`
      });
      toast.success('✅ Líneas de redirección a WhatsApp actualizadas con éxito.');
      mutate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error al guardar los números de WhatsApp');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setPhoneCentro('3124900547');
    setPhoneSalado('3184915295');
    toast.info('Valores restablecidos a los números oficiales por defecto. Recuerda hacer clic en "Guardar Cambios".');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare size={20} />
            </span>
            <h3 className="text-xl font-black text-[#0F172A] uppercase italic tracking-tighter">
              Redirección de Pedidos a WhatsApp
            </h3>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            Controla y personaliza las líneas telefónicas a las cuales se enviarán los pedidos del carrito según la sede seleccionada por el cliente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Restaurar Oficiales
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isLoading}
            className="px-6 py-2.5 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-[#1E293B] active:scale-95 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="text-blue-400" />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Selector de Sede */}
      <div>
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 block mb-3">
          1. Selecciona la Sede a Administrar
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              key: 'centro' as const, 
              name: 'Sede Centro (La 17)', 
              badge: 'Sede Principal', 
              address: 'calle 17 4 78 Brr centro', 
              phone: phoneCentro 
            },
            { 
              key: 'salado' as const, 
              name: 'Sede El Salado', 
              badge: 'Sede Norte', 
              address: 'cra 8 131 284 brr salado', 
              phone: phoneSalado 
            },
          ].map((s) => {
            const isSelected = selectedSedeKey === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedSedeKey(s.key)}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#0F172A] bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                    : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 text-[#0F172A]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {s.badge}
                    </span>
                    <h4 className="text-base font-black uppercase tracking-tight mt-2">{s.name}</h4>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-slate-400' : 'text-gray-400'}`}>{s.address}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-white/10 text-emerald-400' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isSelected ? <CheckCircle2 size={18} /> : <Phone size={16} />}
                  </div>
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs font-mono font-bold ${
                  isSelected ? 'border-white/10 text-emerald-400' : 'border-gray-200 text-gray-500'
                }`}>
                  <span>WhatsApp de Pedidos:</span>
                  <span>+57 {s.phone || 'Sin asignar'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor del Número de la Sede Seleccionada */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Editando: {currentSedeName}
            </span>
            <h4 className="text-lg font-black text-[#0F172A] uppercase italic tracking-tight mt-2">
              Número Telefónico de Recepción
            </h4>
          </div>
          <span className="text-xs font-mono text-gray-400 font-bold">
            {currentNumber.length}/10 dígitos
          </span>
        </div>

        <div className="max-w-md">
          <label className="block text-xs font-bold text-gray-600 mb-2">
            Número de Celular WhatsApp
          </label>
          <div className="flex items-center rounded-2xl border-2 border-gray-200 bg-white overflow-hidden focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm">
            <span className="px-4 py-3 bg-gray-50 border-r border-gray-200 text-gray-600 text-sm font-black flex items-center gap-1.5 shrink-0 select-none">
              🇨🇴 +57
            </span>
            <input 
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="3124900547"
              value={currentNumber}
              onChange={(e) => setCurrentNumber(e.target.value)}
              className="w-full px-4 py-3 text-lg font-black text-[#0F172A] tracking-wider placeholder:text-gray-300 focus:outline-none bg-transparent"
            />
            {currentNumber.length === 10 && (
              <span className="pr-4 text-emerald-500 animate-in fade-in">
                <CheckCircle2 size={20} />
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-medium">
            Ingresa los 10 dígitos del número celular sin espacios ni guiones. El prefijo internacional +57 se gestiona automáticamente.
          </p>
        </div>

        {/* Vista Previa y Prueba de Redirección */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Enlace de Redirección en Vivo
            </span>
            <p className="text-xs font-mono text-blue-900 font-bold break-all">
              https://wa.me/{fullWhatsAppNumber || '57XXXXXXXXXX'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={testUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (currentNumber.length !== 10) {
                  e.preventDefault();
                  toast.error('❌ Ingresa un número válido de 10 dígitos antes de probar el enlace.');
                }
              }}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm ${
                currentNumber.length === 10
                  ? 'bg-[#25D366] text-white hover:bg-[#20ba59] active:scale-95 shadow-[#25D366]/20'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ExternalLink size={14} /> Probar en WhatsApp
            </a>
          </div>
        </div>

        {/* Informativo de sincronización */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 flex items-start gap-3">
          <span className="text-blue-500 shrink-0 text-sm">ℹ️</span>
          <p className="leading-relaxed">
            <strong>Impacto en vivo:</strong> Al hacer clic en <strong>Guardar Cambios</strong>, cualquier cliente que arme un pedido en el catálogo y seleccione la <strong>{currentSedeName}</strong> en el carrito será dirigido inmediatamente al nuevo número configurado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;

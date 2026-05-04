import React, { useState, useEffect } from 'react';
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
  Trash2,
  ShieldAlert,
  AlertCircle,
  X
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
        { key: 'salario_minimo', value: '1450000', type: 'integer', description: 'Salario Mínimo Legal Vigente' },
        { key: 'auxilio_transporte', value: '180000', type: 'integer', description: 'Auxilio de Transporte Vigente' },
        { key: 'hora_limite_checklist', value: '08:00', type: 'string', description: 'Hora máxima para el checklist diario' },
        { key: 'porcentaje_salud', value: '4', type: 'integer', description: 'Deducción de Salud (%)' }
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

  const handleSave = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
              <button className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {s.direccion || 'Sin dirección'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoriasTab = () => {
  const { data: categorias, mutate } = useSWR('/categorias', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/configuracion/categorias', formData);
      toast.success('Categoría agregada correctamente');
      setFormData({ nombre: '', descripcion: '' });
      setShowForm(false);
      mutate();
    } catch (err) {
      toast.error('Error al agregar categoría');
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
        {categorias?.map((c: any) => (
          <div key={c.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-center flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-colors cursor-pointer group">
            <Tags className="text-gray-400 group-hover:text-blue-500" size={20} />
            <span className="font-black text-sm text-[#0F172A] uppercase">{c.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsManager;

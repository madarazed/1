import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { 
  Plus, Truck, Search, Edit3, Trash2, X, 
  AlertTriangle, CheckCircle2, Save, Info,
  MapPin, Gauge, Calendar, Weight, ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';

interface Novedad {
  id: number;
  tipo_novedad: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: string;
}

interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  tipo_vehiculo: 'moto' | 'carro' | 'camion';
  capacidad_carga?: number;
  cilindraje?: number;
  kilometraje_actual: number;
  frecuencia_mantenimiento: number;
  km_ultimo_mantenimiento: number;
  fecha_soat: string;
  fecha_tecnomecanica: string;
  estado: string;
  sede: string;
  mantenimiento?: {
    estado: 'verde' | 'amarillo' | 'rojo';
    mensaje: string;
    color: string;
  };
  novedades_criticas?: number;
}

const FleetManagement = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVehiculos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehiculos');
      setVehiculos(res.data);
    } catch (err) {
      console.error('Error fetching fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    tipo_vehiculo: 'moto',
    capacidad_carga: '',
    cilindraje: '',
    kilometraje_actual: '',
    frecuencia_mantenimiento: '5000',
    km_ultimo_mantenimiento: '0',
    fecha_soat: '',
    fecha_tecnomecanica: '',
    estado: 'Activo',
    sede: 'Centro'
  });

  const handleOpenModal = (vehiculo: Vehiculo | null = null) => {
    if (vehiculo) {
      setEditingVehiculo(vehiculo);
      setFormData({
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        tipo_vehiculo: vehiculo.tipo_vehiculo,
        capacidad_carga: vehiculo.capacidad_carga?.toString() || '',
        cilindraje: vehiculo.cilindraje?.toString() || '',
        kilometraje_actual: vehiculo.kilometraje_actual.toString(),
        frecuencia_mantenimiento: vehiculo.frecuencia_mantenimiento.toString(),
        km_ultimo_mantenimiento: vehiculo.km_ultimo_mantenimiento.toString(),
        fecha_soat: vehiculo.fecha_soat,
        fecha_tecnomecanica: vehiculo.fecha_tecnomecanica,
        estado: vehiculo.estado,
        sede: vehiculo.sede || 'Centro'
      });
    } else {
      setEditingVehiculo(null);
      setFormData({
        placa: '', marca: '', modelo: '', tipo_vehiculo: 'moto',
        capacidad_carga: '', cilindraje: '', kilometraje_actual: '',
        frecuencia_mantenimiento: '5000', km_ultimo_mantenimiento: '0',
        fecha_soat: '', fecha_tecnomecanica: '', estado: 'Activo',
        sede: 'Centro'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        capacidad_carga: formData.tipo_vehiculo === 'camion' ? formData.capacidad_carga : null
      };
      
      if (editingVehiculo) {
        await api.put(`/vehiculos/${editingVehiculo.id}`, data);
      } else {
        await api.post('/vehiculos', data);
      }
      setIsModalOpen(false);
      fetchVehiculos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el vehículo.');
    }
  };

  const handleDeleteRequest = (id: number) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/vehiculos/${deletingId}`);
      fetchVehiculos();
      setIsConfirmOpen(false);
    } catch (err) {
      alert('Error al eliminar');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const filtered = vehiculos.filter(v => 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.sede?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Responsivo */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Gestión de Flota</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            Control de Mantenimiento y Documentación <ChevronRight size={12} />
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus size={20} /> Registrar Vehículo
        </button>
      </div>

      {/* Stats Grid Responsivo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['moto', 'carro', 'camion'].map(tipo => (
          <div key={tipo} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{tipo}s</span>
              <p className="text-xl font-black text-primary italic">{vehiculos.filter(v => v.tipo_vehiculo === tipo).length}</p>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <Truck size={20} />
            </div>
          </div>
        ))}
        <div className="bg-red-500 p-5 rounded-3xl text-white flex items-center justify-between shadow-lg shadow-red-500/20">
          <div>
            <span className="text-[9px] font-black opacity-60 uppercase tracking-widest">Alertas Críticas</span>
            <p className="text-xl font-black italic">
              {vehiculos.filter(v => (v.novedades_criticas || 0) > 0 || v.mantenimiento?.estado === 'rojo').length}
            </p>
          </div>
          <AlertCircle size={20} className="animate-pulse" />
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por placa o sede..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Lista de Vehículos (Mobile Cards / Desktop Table) */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cargando flota...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-[3rem] text-center border border-dashed border-gray-200">
            <Info className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No se encontraron vehículos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((v) => (
              <motion.div 
                key={v.id}
                layout
                className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden group ${
                  (v.novedades_criticas || 0) > 0 || v.mantenimiento?.estado === 'rojo'
                    ? 'border-red-100 bg-red-50/10'
                    : 'border-gray-100'
                }`}
              >
                {/* Indicador de Alerta Crítica */}
                {((v.novedades_criticas || 0) > 0) && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-6 py-2 rounded-bl-3xl flex items-center gap-2 animate-pulse z-10">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Novedad Crítica</span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Info Principal */}
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-3 ${
                      v.tipo_vehiculo === 'camion' ? 'bg-blue-500 text-white' : 
                      v.tipo_vehiculo === 'carro' ? 'bg-primary text-white' : 'bg-orange-500 text-white'
                    }`}>
                      <Truck size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-gray-800 tracking-tighter">{v.placa}</h3>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 uppercase tracking-widest">{v.sede}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{v.marca} {v.modelo} • {v.tipo_vehiculo}</p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="grid grid-cols-2 md:flex items-center gap-3">
                    {/* Mantenimiento */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Mantenimiento</span>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                        v.mantenimiento?.estado === 'verde' ? 'bg-green-50 text-green-600 border-green-100' :
                        v.mantenimiento?.estado === 'amarillo' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        <Gauge size={12} />
                        {v.mantenimiento?.estado === 'rojo' ? 'Vencido' : 'Al día'}
                      </div>
                    </div>

                    {/* SOAT */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Documentos</span>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 text-gray-600 border border-gray-100 text-[10px] font-black uppercase tracking-widest">
                        <Calendar size={12} />
                        {new Date(v.fecha_soat) < new Date() ? 'SOAT Vencido' : 'SOAT OK'}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                    <button 
                      onClick={() => handleOpenModal(v)}
                      className="flex-1 md:flex-none p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Edit3 size={18} /> <span className="md:hidden">Editar</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteRequest(v.id)}
                      className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Footer Info (Kilometraje & Carga) */}
                <div className="mt-6 pt-4 border-t border-gray-50 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Gauge size={14} className="text-gray-300" />
                    <span className="text-xs font-bold text-gray-600">{v.kilometraje_actual.toLocaleString()} KM <span className="text-gray-400 font-medium font-body">(Total)</span></span>
                  </div>
                  {v.tipo_vehiculo === 'camion' && (
                    <div className="flex items-center gap-2">
                      <Weight size={14} className="text-gray-300" />
                      <span className="text-xs font-bold text-gray-600">{v.capacidad_carga} KG <span className="text-gray-400 font-medium font-body">(Capacidad)</span></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-300" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{v.sede}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Registro/Edición */}
      <AnimatePresence>
        {isModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden my-8"
            >
              <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter leading-none mb-1">
                    {editingVehiculo ? 'Editar Vehículo' : 'Nueva Unidad'}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Información técnica y operativa</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Identificación */}
                  <div className="md:col-span-2 flex items-center gap-3 border-b border-gray-50 pb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Info size={16} />
                    </div>
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Datos de Identificación</h4>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Placa</label>
                    <input 
                      type="text"
                      value={formData.placa}
                      onChange={e => setFormData({...formData, placa: e.target.value.toUpperCase()})}
                      placeholder="ABC-123"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Tipo de Vehículo</label>
                    <select 
                      value={formData.tipo_vehiculo}
                      onChange={e => setFormData({...formData, tipo_vehiculo: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                      required
                    >
                      <option value="moto">Moto</option>
                      <option value="carro">Carro</option>
                      <option value="camion">Camión</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Marca</label>
                    <input 
                      type="text"
                      value={formData.marca}
                      onChange={e => setFormData({...formData, marca: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Modelo</label>
                    <input 
                      type="text"
                      value={formData.modelo}
                      onChange={e => setFormData({...formData, modelo: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Cilindraje (CC)</label>
                    <input 
                      type="number"
                      value={formData.cilindraje}
                      onChange={e => setFormData({...formData, cilindraje: e.target.value})}
                      placeholder="125"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Operativo */}
                  <div className="md:col-span-2 flex items-center gap-3 border-b border-gray-50 pb-4 mt-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                      <Gauge size={16} />
                    </div>
                    <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Información Operativa</h4>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Kilometraje Actual</label>
                    <input 
                      type="number"
                      value={formData.kilometraje_actual}
                      onChange={e => setFormData({...formData, kilometraje_actual: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Sede Asignada</label>
                    <select 
                      value={formData.sede}
                      onChange={e => setFormData({...formData, sede: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    >
                      <option value="Centro">Sede Centro</option>
                      <option value="Salado">Sede Salado</option>
                    </select>
                  </div>

                  {formData.tipo_vehiculo === 'camion' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Capacidad Carga (KG)</label>
                      <input 
                        type="number"
                        value={formData.capacidad_carga}
                        onChange={e => setFormData({...formData, capacidad_carga: e.target.value})}
                        className="w-full bg-blue-50 border border-blue-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        required={formData.tipo_vehiculo === 'camion'}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Frecuencia Mantenimiento (KM)</label>
                    <input 
                      type="number"
                      value={formData.frecuencia_mantenimiento}
                      onChange={e => setFormData({...formData, frecuencia_mantenimiento: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Documentación */}
                  <div className="md:col-span-2 flex items-center gap-3 border-b border-gray-50 pb-4 mt-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                      <Calendar size={16} />
                    </div>
                    <h4 className="text-[11px] font-black text-orange-500 uppercase tracking-widest">Documentación Legal</h4>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Vencimiento SOAT</label>
                    <input 
                      type="date"
                      value={formData.fecha_soat}
                      onChange={e => setFormData({...formData, fecha_soat: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Vencimiento Tecno</label>
                    <input 
                      type="date"
                      value={formData.fecha_tecnomecanica}
                      onChange={e => setFormData({...formData, fecha_tecnomecanica: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="order-2 md:order-1 flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="order-1 md:order-2 flex-1 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <Save size={20} /> {editingVehiculo ? 'Actualizar Vehículo' : 'Registrar Unidad'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmModal
            isOpen={isConfirmOpen}
            title="¿Eliminar Vehículo?"
            description="Esta acción eliminará permanentemente la unidad de la flota. ¿Estás seguro de continuar?"
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
            variant="danger"
            confirmText="Eliminar Unidad"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FleetManagement;

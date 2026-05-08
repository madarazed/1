import { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { 
  UserPlus, 
  Search, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  Mail,
  CreditCard,
  Truck,
  Loader2,
  Edit2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  nombre: string;
  email: string;
  cedula: string;
  activo: boolean;
  role?: { id: number, nombre: string };
  sucursal?: { id: number, nombre: string };
  vehiculo_asignado?: string;
}

interface Role {
  id: number;
  nombre: string;
}

interface Sucursal {
  id: number;
  nombre: string;
}

interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
}

const UserManagement = () => {
  const { } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    id_rol: '',
    id_sucursal: '',
    password: '',
    activo: true,
    vehiculo_id: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, sucursalesRes, vehiclesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
        api.get('/sucursales'),
        api.get('/vehiculos/disponibles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setSucursales(sucursalesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        cedula: user.cedula || '',
        id_rol: user.role?.id.toString() || '',
        id_sucursal: user.sucursal?.id.toString() || '',
        activo: user.activo,
        vehiculo_id: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        email: '',
        cedula: '',
        id_rol: '',
        id_sucursal: '',
        password: '',
        activo: true,
        vehiculo_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (id: number) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      setUsers(users.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.cedula?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || u.role?.nombre === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleCount = (roleName: string) => {
    return users.filter(u => u.role?.nombre === roleName).length;
  };

  const getRoleBadgeColor = (roleName?: string) => {
    switch (roleName) {
      case 'Superadmin': return 'bg-slate-900 text-white';
      case 'Admin Sucursal': return 'bg-primary text-white';
      case 'Repartidor': return 'bg-blue-100 text-blue-700';
      case 'Cajera': return 'bg-purple-100 text-purple-700';
      case 'Contabilidad': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Gestión de Personal</h2>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest italic">
            Visualizando {users.length} colaboradores en total
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <UserPlus size={18} />
          Nuevo Empleado
        </button>
      </div>

      {/* Role Stats & Filter Tabs */}
      <div className="flex flex-wrap gap-3 pb-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setRoleFilter('all')}
          className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap ${roleFilter === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-gray-100 text-gray-500 hover:border-primary font-bold'}`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Todos</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${roleFilter === 'all' ? 'bg-white/20' : 'bg-gray-100'}`}>
            {users.length}
          </span>
        </button>
        {roles.map(r => (
          <button 
            key={r.id}
            onClick={() => setRoleFilter(r.nombre)}
            className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap ${roleFilter === r.nombre ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-white border-gray-100 text-gray-500 hover:border-primary font-bold'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{r.nombre}</span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${roleFilter === r.nombre ? 'bg-white/20' : 'bg-gray-100'}`}>
              {getRoleCount(r.nombre)}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, email o cédula..."
          className="w-full bg-white border border-gray-100 rounded-2xl py-5 pl-16 pr-6 font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">#</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Empleado</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Sede</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sincronizando equipo...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase italic">No se encontraron empleados en esta categoría</p>
                  </td>
                </tr>
              ) : filteredUsers.map((u, index) => (
                <motion.tr 
                  layout
                  key={u.id} 
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-6 text-center">
                    <span className="text-xs font-black text-gray-300">{(index + 1).toString().padStart(2, '0')}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-lg">
                        {u.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm uppercase">{u.nombre}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            <Mail size={10} /> {u.email}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            <CreditCard size={10} /> {u.cedula}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${getRoleBadgeColor(u.role?.nombre)}`}>
                      {u.role?.nombre || 'Sin Rol'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">{u.sucursal?.nombre || 'Sin Sede'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      {u.activo ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                      <span className={`text-xs font-black uppercase ${u.activo ? 'text-green-600' : 'text-red-600'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(u)}
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(u.id)}
                        className={`p-3 rounded-xl transition-all shadow-sm ${u.activo ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                        title={u.activo ? 'Suspender' : 'Activar'}
                      >
                        {u.activo ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden my-auto"
              >
                <div className="bg-primary p-8 text-white relative">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                      <UserPlus size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                        {editingUser ? 'Editar Perfil' : 'Registro de Usuario'}
                      </h2>
                      <p className="text-xs font-bold opacity-70 uppercase tracking-widest">
                        Portal de Acceso Rapifrios Nexus
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nombre Completo</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Cédula</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        value={formData.cedula}
                        onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Correo Electrónico</label>
                      <input 
                        type="email" 
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    {!editingUser && (
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Contraseña de Acceso</label>
                        <input 
                          type="password" 
                          required
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Rol del Sistema</label>
                      <select 
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                        value={formData.id_rol}
                        onChange={(e) => setFormData({ ...formData, id_rol: e.target.value })}
                      >
                        <option value="">Seleccionar Rol</option>
                        {roles.filter(r => r.nombre !== 'Superadmin').map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Sede Asignada</label>
                      <select 
                        required={roles.find(r => r.id.toString() === formData.id_rol)?.nombre !== 'Cliente'}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                        value={formData.id_sucursal}
                        onChange={(e) => setFormData({ ...formData, id_sucursal: e.target.value })}
                      >
                        <option value="">{roles.find(r => r.id.toString() === formData.id_rol)?.nombre === 'Cliente' ? 'General Ibagué (Por Defecto)' : 'Seleccionar Sede'}</option>
                        {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  {(formData.id_rol === '3' || roles.find(r => r.id.toString() === formData.id_rol)?.nombre === 'Repartidor') && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <Truck size={20} className="text-blue-600" />
                        <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest">Asignación de Vehículo</h4>
                      </div>
                      <select 
                        className="w-full bg-white border border-blue-100 rounded-xl py-3 px-6 text-sm font-bold outline-none"
                        value={formData.vehiculo_id}
                        onChange={(e) => setFormData({ ...formData, vehiculo_id: e.target.value })}
                      >
                        <option value="">Ninguno / Por asignar después</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.marca}</option>)}
                      </select>
                    </motion.div>
                  )}



                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingUser ? 'Actualizar' : 'Registrar')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default UserManagement;

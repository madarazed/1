import { useState, useEffect, type FC } from 'react';
import { createPortal } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X, Save, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';
import { PRODUCTS_IMAGE_URL } from '../constants';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  id_marca: number;
  id_categoria: number | null;
  url_imagen?: string;
  en_promocion?: boolean;
  precio_oferta?: number;
  es_exclusivo?: boolean;
}

interface Marca {
  id: number;
  nombre: string;
  id_marca?: number;
  nombre_marca?: string;
}

interface Category {
  id: number;
  nombre: string;
}

interface Props {
  product?: Product; // Opcional para creación
  esExclusivo?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductEditModal: FC<Props> = ({ product, esExclusivo = false, onClose, onSuccess }) => {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = !!product?.id;

  const { register, handleSubmit, watch, setValue, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      nombre: product?.nombre || '',
      descripcion: product?.descripcion || '',
      precio: product?.precio || 0,
      id_marca: (product?.id_marca || '') as string | number,
      id_categoria: (product?.id_categoria || '') as string | number,
      en_promocion: product?.en_promocion || false,
      es_exclusivo: esExclusivo || product?.es_exclusivo || false,
      precio_oferta: product?.precio_oferta || 0,
      imagen: null as any
    }
  });

  const watchImagen = watch('imagen') as any;
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (watchImagen && watchImagen.length > 0) {
      const file = watchImagen[0];
      setImagePreview(URL.createObjectURL(file as unknown as Blob));
    }
  }, [watchImagen]);

  // 1. Cargar opciones (marcas y categorías) al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marcasRes, catsRes] = await Promise.all([
          api.get('/marcas'),
          api.get('/categorias')
        ]);
        setMarcas(marcasRes.data);
        setCategories(catsRes.data);
      } catch (err) {
        console.error('Error fetching modal data:', err);
      }
    };
    fetchData();
  }, []);

  // 2. Inicializar el formulario cuando el producto o las opciones estén listos
  useEffect(() => {
    if (product && marcas.length > 0 && categories.length > 0) {
      reset({
        ...product,
        id_marca: product.id_marca ? Number(product.id_marca) : '',
        id_categoria: product.id_categoria ? Number(product.id_categoria) : '',
        en_promocion: Boolean(product.en_promocion),
        es_exclusivo: esExclusivo || Boolean(product.es_exclusivo),
      });
      
      // Refuerzo explícito para los selectores
      if (product.id_categoria) setValue('id_categoria', product.id_categoria);
      if (product.id_marca) setValue('id_marca', product.id_marca);
    } else if (!isEditing) {
      // Si es creación, asegurar valores por defecto limpios
      reset({
        nombre: '',
        descripcion: '',
        precio: 0,
        id_marca: '',
        id_categoria: '',
        en_promocion: false,
        es_exclusivo: esExclusivo,
        precio_oferta: 0,
      });
    }
  }, [product, marcas, categories, reset, setValue, isEditing, esExclusivo]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('nombre', data.nombre);
      formData.append('descripcion', data.descripcion || '');
      formData.append('precio', data.precio.toString());
      formData.append('id_marca', data.id_marca.toString());
      
      if (data.id_categoria && data.id_categoria !== "") {
        formData.append('id_categoria', data.id_categoria.toString());
      }
      
      formData.append('en_promocion', data.en_promocion ? '1' : '0');
      
      if (data.precio_oferta !== undefined && data.precio_oferta !== null && data.precio_oferta !== "") {
        formData.append('precio_oferta', data.precio_oferta.toString());
      }
      
      formData.append('es_exclusivo', (esExclusivo || data.es_exclusivo) ? '1' : '0');

      // Check if there's a file
      if (data.imagen && data.imagen.length > 0) {
        formData.append('imagen', data.imagen[0]);
      }

      if (isEditing) {
        formData.append('_method', 'PUT');
        await api.post(`/productos/${product?.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/productos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seguridad: No renderizar si no hay DOM (Evita el error de pantalla blanca)
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Header Modal */}
        <div className="bg-primary p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">
                {isEditing ? `Modificando ${product?.nombre}` : 'Completa los campos para añadir al catálogo'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Grid Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nombre del Producto</label>
              <input 
                {...register('nombre', { required: 'El nombre es obligatorio' })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              {errors.nombre && <span className="text-[10px] text-red-500 font-bold ml-4">{errors.nombre.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Categoría</label>
              <Controller
                name="id_categoria"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <select 
                    {...field}
                    value={field.value || ""}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                )}
              />
              {errors.id_categoria && <span className="text-[10px] text-red-500 font-bold ml-4">{errors.id_categoria.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Marca</label>
              <Controller
                name="id_marca"
                control={control}
                rules={{ required: 'La marca es obligatoria' }}
                render={({ field }) => (
                  <select 
                    {...field}
                    value={field.value || ""}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                  >
                    <option value="">Seleccionar Marca</option>
                    {marcas.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                )}
              />
              {errors.id_marca && <span className="text-[10px] text-red-500 font-bold ml-4">{errors.id_marca.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Precio Normal (Tachado en oferta)</label>
              <input 
                type="number"
                {...register('precio', { required: true, min: 0 })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Precio de Oferta (A pagar)</label>
              <input 
                type="number"
                {...register('precio_oferta', { min: 0 })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Opcional"
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <input 
                  type="checkbox"
                  id="en_promocion"
                  {...register('en_promocion')}
                  className="w-5 h-5 accent-orange-500 rounded-lg cursor-pointer"
                />
                <label htmlFor="en_promocion" className="text-xs font-black text-orange-700 uppercase tracking-widest cursor-pointer select-none">
                  Activar Etiqueta de Promoción / Oferta
                </label>
              </div>

              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${esExclusivo ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                <input 
                  type="checkbox"
                  id="es_exclusivo"
                  {...register('es_exclusivo')}
                  disabled={esExclusivo}
                  className={`w-5 h-5 rounded-lg cursor-pointer ${esExclusivo ? 'accent-amber-500' : 'accent-primary'}`}
                />
                <label htmlFor="es_exclusivo" className={`text-xs font-black uppercase tracking-widest cursor-pointer select-none ${esExclusivo ? 'text-amber-700' : 'text-gray-500'}`}>
                  Producto Exclusivo (Portal VIP)
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Fotografía del Producto</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="file"
                  accept="image/*"
                  {...register('imagen')}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                />
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                  <img 
                    src={imagePreview || (() => {
                      if (!product?.url_imagen) return '/products/placeholder.jpg';
                      if (product.url_imagen.startsWith('http')) return product.url_imagen;
                      const filename = product.url_imagen.split('/').pop();
                      return filename?.includes('_') 
                        ? `${PRODUCTS_IMAGE_URL}/${filename}` 
                        : `/products/${filename}`;
                    })()}
                    className="w-full h-full object-cover"
                    onError={(e) => e.currentTarget.src = 'https://placehold.co/200x200?text=Vacio'}
                    alt="Preview"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Descripción</label>
            <textarea 
              {...register('descripcion')}
              rows={4}
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              placeholder="Escribe una breve descripción del producto..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default ProductEditModal;

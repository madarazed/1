# Contexto del Proyecto: RAPIFRIOS NEXUS (v3.0)

## 1. Visión General
Rapifrios es una plataforma de delivery de bebidas líder en Ibagué, Colombia. El proyecto "Nexus" representa la evolución de su sistema administrativo y logístico, migrando a una arquitectura moderna y escalable:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion + SWR (Revalidación de datos en tiempo real).
- **Backend**: Laravel 12 (API Restful) + MySQL/MariaDB.
- **Diseño**: Estética premium, "Navy Blue" corporativo (`#0F172A`), micro-animaciones (Pulse, Hover effects) y enfoque responsivo/Torre de Control.

---

## 2. Estado de la Implementación (Módulos Finalizados)

### 2.1. Torre de Control Operativa (Dashboard)
- Enfoque total en **salud financiera y logística** (Métricas de ventas eliminadas por decisión estratégica).
- **KPIs Financieros**: Cálculo en tiempo real de la proyección de nómina (Salario Base + Horas Extra) derivado de las jornadas laboradas reales.
- **Semáforo Logístico**: Panel dinámico que mide el porcentaje de cumplimiento de inspecciones de flota diaria, con alertas visuales pulsantes (Framer Motion).
- **Zero-Friction**: Botones de acción rápida para notificar vía API a conductores rezagados o actualizar SOAT/Tecnomecánicas directamente desde el dashboard.

### 2.2. Configuración Maestra (Settings)
- **Persistencia**: Tabla `configs` en base de datos tipo Key-Value para parametrización técnica ilimitada.
- **Caché Instantáneo**: Laravel Cache (`rememberForever`) con invalidación automática vía eventos `booted` del modelo al editar un valor, garantizando 0 ms de latencia.
- **Parametrización**: Gestión de Sedes, Categorías (para el catálogo) y Variables del Sistema (Salario Mínimo, Auxilio de Transporte, % de deducciones).
- **Seguridad Perimetral**: Módulo estrictamente bloqueado para cualquier rol que no sea "Superadmin".

### 2.3. Centro de Reportes
- Implementación de `barryvdh/laravel-dompdf`.
- Generación de reportes corporativos firmados digitalmente (Branding Navy Blue):
  - **Nómina**: Desprendible con cálculos automáticos según la legislación colombiana (2026).
  - **Hoja de Vida Vehicular**: Historial de incidencias y estado de flota.
  - **Inventario**: Control de existencias por sede.

### 2.4. Gestión de Personal y Logística Core
- **Módulo de Usuarios**: Bloqueo arquitectónico de asignación múltiple de Superadmins. Asignación fluida de vehículos a repartidores.
- **Regla de Oro Logística**: Un vehículo no puede operar ni sumar kilómetros si no cuenta con un Checklist pre-operacional diario aprobado (`estado_general = Bueno`).
- **Módulo de Flota**: Integración completa para el seguimiento de vencimientos documentales (Alertas críticas activas a nivel global).

### 2.5. Catálogo Maestro
- Administración de productos y categorías con subida nativa de imágenes.
- Sistema lógico para "Oferta Relámpago", promociones por tiempo limitado y cálculo automático de descuentos.

### 2.6. Portal VIP y Segmentación Estratégica
- **Separación Física**: Despliegue de una arquitectura de vistas totalmente segregadas para evitar la exposición de precios y ofertas exclusivas al público general.
- **VipPortal.tsx**: Centro de mando único para el cliente VIP que unifica:
  - **Sección de Ofertas Exclusivas**: Productos con `es_exclusivo = true` renderizados con estética premium "Dorado/Ámbar".
  - **Catálogo General**: Integración del catálogo público debajo de las ofertas VIP para facilitar pedidos integrales.
- **Blindaje de Ruta**: Implementación de guards en frontend que bloquean el acceso a `/vip-portal` basándose estrictamente en `id_rol === 6`.
- **Redirección Directa**: Bypass automático de la landing page pública tras el login exitoso de un perfil "Cliente".

---

## 3. Arquitectura Frontend y UI/UX

- **SWR en Frontend**: Sustitución de `useEffect` tradicionales por `useSWR` para garantizar que métricas críticas (Nómina, Alertas) estén siempre sincronizadas sin intervención manual del usuario.
- **Asistente Nexus Global**: Botón de ayuda persistente (Context-aware) en `AdminLayout.tsx` que explica técnica y operativamente qué hace cada vista al usuario actual.
- **React Portals**: Todos los modales (Edición, Ayuda, Notificaciones) se renderizan mediante `createPortal` en el `document.body` (`z-[1000]` a `z-[9999]`), rompiendo herencias CSS y asegurando la fidelidad full-viewport.
- **Diseño "Premium Alerting"**: Uso estandarizado de `sonner` para toasts de notificaciones, y clases tailwind como `animate-ping` o estados de color dinámico (Rojo < 50%, Naranja < 80%, Verde >= 80%) para el manejo de crisis operativas.

---

## 4. Estructura de Datos (Categorías Base)
1. Aguas
2. Cervezas
3. Energizantes
4. Gaseosas
5. Hidratantes
6. Jugos
7. Licores
8. Sodas

---

## 5. Directrices de Desarrollo (Antigravity Ruleset)

1. **"Cero Harcodeo Financiero/Operativo"**: Todas las matemáticas de nómina o descuentos deben beber del modelo `Config` o calcularse dinámicamente desde el Backend.
2. **"Torre de Control UI"**: Interfaces oscuras (`#0F172A`) combinadas con métricas limpias, evitando el sobrecargo visual y priorizando indicadores de acción (Botones CTA).
3. **"Fidelidad de Viewport"**: Garantizar modales responsivos y pantallas completas (`min-h-screen`, `flex-1 overflow-hidden`).
4. **"Blindaje de Auditoría"**: Control estricto de roles. Verificar validaciones tanto en Frontend (`isSuperadmin`) como en Backend (`checkSuperAdmin`).
5. **"Manejo de Errores Silencioso"**: Uso de Sonner Toasting y estados de `loading/skeleton` nativos de Tailwind en lugar de alertas invasivas.
6. **"Segmentación VIP Hermética"**: Las ofertas exclusivas solo deben existir en la ruta `/vip-portal`. Cualquier rastro de precios preferenciales en el Index público es un fallo de seguridad comercial.

---

## 6. Migración a Producción (Render + Vercel + PostgreSQL)

Durante el paso a producción (Nube), se resolvieron incompatibilidades estructurales entre el entorno de desarrollo (XAMPP/MySQL/React Local) y el de producción (Render/PostgreSQL/Vercel). Para evitar futuros errores, se añaden las siguientes normativas:

1. **Gestión Estricta de Foreign Keys**: A diferencia de MySQL, PostgreSQL **no permite** violaciones temporales de integridad ni IDs inexistentes (ej. asignar `id_categoria = 0` cuando las categorías empiezan en 1). Toda importación de datos debe sanitizar estas llaves foráneas y asignarlas a valores válidos por defecto.
2. **Sincronización de Esquemas**: La base de datos de producción es la fuente de verdad (construida a partir de las migraciones de Laravel). Se implementó un filtro dinámico (`Schema::getColumnListing`) en el script de sincronización para ignorar automáticamente cualquier columna local ('fantasma') que no exista formalmente en producción.
3. **Manejo Seguro de Reinicio de Tablas**: Dado que el usuario de PostgreSQL en Render (Free Tier) no es superusuario, no se pueden alterar parámetros de sesión (`session_replication_role`). La limpieza de datos debe hacerse empleando `TRUNCATE TABLE ... CASCADE` seguido del correcto orden de inserción (Tablas Padre -> Tablas Hijo).
4. **Rutas Dinámicas de Assets**: El frontend (React) y el backend (Laravel) **jamás** deben contener rutas hardcodeadas (`127.0.0.1`). Se debe utilizar siempre `import.meta.env.VITE_API_URL` en React y `env('APP_URL')` en Laravel. 
5. **Carpeta Public vs Storage**: Las imágenes de productos se almacenan de manera nativa en `public/products` y son leídas estáticamente en Vercel. El Accessor `url_imagen` de Eloquent debe priorizar esta lectura directa obviando `Storage::url()` para prevenir conflictos de symlinks en la nube.

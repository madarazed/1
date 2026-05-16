# Contexto del Proyecto: RAPIFRIOS NEXUS (v3.1 — Producción Activa)

## 1. Visión General
Rapifrios es una plataforma de delivery de bebidas líder en Ibagué, Colombia. El proyecto "Nexus" representa la evolución de su sistema administrativo y logístico, migrando a una arquitectura moderna y escalable:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion + SWR (Revalidación de datos en tiempo real).
- **Backend**: Laravel 12 (API Restful) + MySQL/MariaDB (Dev) / PostgreSQL (Producción en Render).
- **Diseño**: Estética premium, "Navy Blue" corporativo (`#003366`, `#007BFF`), micro-animaciones (Pulse, Hover effects) y enfoque responsivo/Torre de Control.
- **Despliegue**: Frontend en Vercel, Backend en Render (Free Tier). CI/CD automático desde la rama `main` del repositorio GitHub.

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

### 2.5. Catálogo Maestro y Buscador
- Administración de productos y categorías con subida nativa de imágenes.
- Sistema lógico para "Oferta Relámpago", promociones por tiempo limitado y cálculo automático de descuentos.
- **Buscador Unificado**: La barra de búsqueda en `Catalogo.tsx` y `VipPortal.tsx` filtra en tiempo real por nombre de producto, descripción y **marca** simultáneamente. El estado del buscador está vinculado con el grid de productos y los filtros laterales (categoría, marca, precio) de forma global.
- **FilterDrawer.tsx**: Drawer de filtros mobile con filtrado por Marca (sidebar con búsqueda interna), Categoría y rango de Precio. Compatible con el buscador global.

### 2.6. Portal VIP y Segmentación Estratégica
- **Separación Física**: Despliegue de una arquitectura de vistas totalmente segregadas para evitar la exposición de precios y ofertas exclusivas al público general.
- **VipPortal.tsx**: Centro de mando único para el cliente VIP que unifica:
  - **Sección de Ofertas Exclusivas**: Productos con `es_exclusivo = true` renderizados con estética premium "Dorado/Ámbar" (`SeccionExclusiva.tsx`).
  - **Catálogo General con Filtros**: Catálogo completo con filtros por **Categoría, Marca y Precio** (igual al catálogo público del Index), más barra de búsqueda en tiempo real.
- **Estética VIP Estandarizada**: Paleta Dark Slate + Ámbar. **Un único carrito de compras azul** — el botón amarillo flotante "VER CARRITO" fue eliminado permanentemente. Los botones de producto siguen el patrón Slate/Ámbar premium.
- **Navbar Pública Oculta**: La barra de navegación pública (Inicio, Catálogo, Contáctanos) **no se renderiza** cuando el usuario está en `/vip-portal`, cerrando el acceso al sitio público desde el interior del portal.
- **Blindaje de Ruta**: Guards en frontend que bloquean el acceso a `/vip-portal` a usuarios con roles no autorizados, redirigiendo al Index público.
- **Redirección Inteligente por Rol**: Al llegar al Index (`/`) o al Catálogo (`/catalogo`) mientras están logueados, los usuarios son redirigidos automáticamente a su vista correspondiente:
  - `Superadmin`, `Admin Sucursal`, `Cajera`, `Contabilidad` → `/admin`
  - `Repartidor`, `Conductor` → `/repartidor/checkin`
  - `Cliente` (id_rol 6) → `/vip-portal`
  - Esta lógica está duplicada en `Landing.tsx` y `Catalogo.tsx` para cobertura total.

### 2.7. Landing Page Pública (Index)
- **OnboardingModal / Modal de Bienvenida**: Modal de primera visita que se muestra al ingresar al sitio. Controlado por `sessionStorage` para aparecer solo una vez por sesión.
  - Muestra el GIF `modalgif.gif` (infografía de 3 pasos: "¡Pedir es muy fácil!") servido desde `/public/modalgif.gif`.
  - Implementación con etiqueta `<img>` estándar (no `SmartImage`) ya que es un asset estático de UI, no de catálogo.
  - Dimensionado con `max-h-[90vh] w-auto` para escalar desde la altura disponible del viewport, garantizando visibilidad completa del GIF sin scroll ni recorte en PC (100% zoom) y móviles.
  - Botón de cierre `✕` posicionado en `absolute top-4 right-4`.
  - El botón "¡Empezar a comprar!" y el título "¡Pedir es muy fácil!" fueron **eliminados** para maximizar el área visible del GIF.
- **Sección Hero**: Animaciones de entrada con Framer Motion. CTA principal hacia el catálogo.
- **VipOffersCarousel.tsx**: Carrusel de ofertas exclusivas con scroll-snap, estética Dark Mode y acentos dorados. Sin efecto glow lateral. Optimizado para móvil.

### 2.8. Sección Contáctanos (`ContactSection.tsx`) — ✅ Refactorizado en Producción
- **Layout de Tarjetas Corregido**: Arquitectura `flex flex-col justify-between min-h-[440px]` en cada tarjeta de sede para garantizar alineación uniforme del botón "CÓMO LLEGAR" al fondo, independiente de la longitud del texto de cada sede.
- **Encabezado de Sede**: Refactorizado a `text-lg font-bold` con `mt-4 mb-5` para evitar colisiones visuales con el iframe del mapa de Google Maps.
- **Botón "CÓMO LLEGAR" → Enlace `<a>`**: Convertido de `<button>` a `<a target="_blank" rel="noopener noreferrer">` con URLs de Google Maps dinámicas por sede:
  - **Centro La 17**: `https://www.google.com/maps/search/?api=1&query=Rapifrios+Calle+17+%23+3+-+45+Ibague`
  - **La 16**: `https://www.google.com/maps/search/?api=1&query=Rapifrios+Calle+16+%23+2+-+12+Ibague`
  - **El Salado**: `https://www.google.com/maps/search/?api=1&query=Rapifrios+Carrera+14+%23+145+-+20+El+Salado+Ibague`
- **Espaciado Anti-Colisión**: La sección eliminó `lg:h-screen` y `overflow-hidden`. Ahora usa `min-h-screen` con `pt-32 pb-24 lg:pb-32` para dar respiro a los elementos sin que la barra de números de contacto se superponga a las tarjetas. La barra inferior tiene `mt-12` de separación explícita.
- **Barra de Redes Sociales** (`Layout.tsx`): El botón de Instagram apunta a `https://www.instagram.com/rapifriosltda/` (corregido desde la URL anterior incorrecta `rapifrios_ibague`). Facebook permanece en `https://www.facebook.com/profile.php?id=61555922458459`.

---

## 3. Arquitectura Frontend y UI/UX

- **SWR en Frontend**: Sustitución de `useEffect` tradicionales por `useSWR` para garantizar que métricas críticas (Nómina, Alertas) estén siempre sincronizadas sin intervención manual del usuario.
- **Asistente Nexus Global**: Botón de ayuda persistente (Context-aware) en `AdminLayout.tsx` que explica técnica y operativamente qué hace cada vista al usuario actual.
- **React Portals**: Todos los modales (Edición, Ayuda, Notificaciones) se renderizan mediante `createPortal` en el `document.body` (`z-[1000]` a `z-[9999]`), rompiendo herencias CSS y asegurando la fidelidad full-viewport.
- **Diseño "Premium Alerting"**: Uso estandarizado de `sonner` para toasts de notificaciones, y clases tailwind como `animate-ping` o estados de color dinámico (Rojo < 50%, Naranja < 80%, Verde >= 80%) para el manejo de crisis operativas.
- **SmartImage (`components/common/SmartImage.tsx`)**: Componente especializado **exclusivamente para imágenes de productos del catálogo**. Integra la lógica de `getImageUrl` + `handleImageError` (rotación de extensiones, fallback a GitHub Raw CDN, placeholder corporativo). **No debe usarse para assets estáticos de UI** (modales, banners genéricos).

### 3.1. Inventario Completo de Páginas (`src/pages/`)
| Archivo | Ruta | Descripción |
|---|---|---|
| `Landing.tsx` | `/` | Landing page pública con Hero, VipOffersCarousel, Modal de Bienvenida y ContactSection |
| `Catalogo.tsx` | `/catalogo` | Catálogo público con filtros, buscador y carrito |
| `LoginPage.tsx` | `/login` | Autenticación unificada por rol |
| `VipPortal.tsx` | `/vip-portal` | Portal exclusivo Cliente VIP |
| `AdminCatalog.tsx` | `/admin/catalogo` | Gestión de productos (CRUD) |
| `AdminInventory.tsx` | `/admin/inventario` | Control de stock y ajustes |
| `DashboardOverview.tsx` | `/admin` | Torre de control operativa |
| `SettingsManager.tsx` | `/admin/configuracion` | Parámetros del sistema (Solo Superadmin) |
| `UserManagement.tsx` | `/admin/usuarios` | Gestión de personal y roles |
| `ReportCenter.tsx` | `/admin/reportes` | Generación de PDFs corporativos |
| `FleetManagement.tsx` | `/admin/flota` | Seguimiento de vehículos y documentos |
| `LogisticsAdmin.tsx` | `/admin/logistica` | Administración logística general |
| `Logistica.tsx` | `/repartidor/checkin` | Vista del repartidor (Checklist) |
| `LogisticsDrivers.tsx` | `/admin/conductores` | Gestión de conductores |
| `LogisticsVehicles.tsx` | `/admin/vehiculos` | Gestión de flota vehicular |
| `LogisticsNav.tsx` | — | Navegación interna del módulo logístico |

### 3.2. Inventario de Componentes (`src/components/`)
| Archivo | Descripción |
|---|---|
| `Layout.tsx` | Shell principal: Navbar flotante, Sidebar social (Instagram/Facebook), WhatsApp flotante, Bottom Nav móvil |
| `AdminLayout.tsx` | Shell del área admin con Sidebar, Nexus Assistant y gestión de sesión |
| `ContactSection.tsx` | Sección "Contáctanos" con mapa iframe, tarjetas de sede y barra de teléfonos |
| `FilterDrawer.tsx` | Drawer lateral de filtros para catálogo (mobile-first) |
| `ShoppingDrawer.tsx` | Drawer del carrito de compras |
| `VipOffersCarousel.tsx` | Carrusel de ofertas VIP con scroll-snap |
| `SeccionExclusiva.tsx` | Grid de productos exclusivos con estética Ámbar |
| `ExclusiveProductsManager.tsx` | Gestión CRUD de productos exclusivos (Admin) |
| `ProductEditModal.tsx` | Modal de edición de producto con subida de imagen |
| `ChecklistWizard.tsx` | Wizard de checklist pre-operacional de flota |
| `JornadaComponent.tsx` | Control de jornada laboral para repartidores |
| `SedeSelector.tsx` | Selector de sede activa en la navbar |
| `common/SmartImage.tsx` | Componente de imagen resiliente (solo para productos del catálogo) |

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
3. **"Fidelidad de Viewport"**: Garantizar modales responsivos y pantallas completas (`min-h-screen`, `flex-1 overflow-hidden`). Los modales de UI estáticos deben escalar por `max-h` en viewport units, nunca por ancho fijo.
4. **"Blindaje de Auditoría"**: Control estricto de roles. Verificar validaciones tanto en Frontend (`isSuperadmin`) como en Backend (`checkSuperAdmin`).
5. **"Manejo de Errores Silencioso"**: Uso de Sonner Toasting y estados de `loading/skeleton` nativos de Tailwind en lugar de alertas invasivas.
6. **"Segmentación VIP Hermética"**: Las ofertas exclusivas solo deben existir en la ruta `/vip-portal`. Cualquier rastro de precios preferenciales en el Index público es un fallo de seguridad comercial.
7. **"SmartImage es solo para catálogo"**: El componente `SmartImage` está diseñado exclusivamente para imágenes de productos con lógica de rescate desde GitHub. Los assets estáticos de UI (modales, banners) deben usar etiqueta `<img>` directa apuntando a `/public/`.

---

## 6. Migración a Producción (Render + Vercel + PostgreSQL)

Durante el paso a producción (Nube), se resolvieron incompatibilidades estructurales entre el entorno de desarrollo (XAMPP/MySQL/React Local) y el de producción (Render/PostgreSQL/Vercel). Para evitar futuros errores, se añaden las siguientes normativas:

1. **Gestión Estricta de Foreign Keys**: A diferencia de MySQL, PostgreSQL **no permite** violaciones temporales de integridad ni IDs inexistentes (ej. asignar `id_categoria = 0` cuando las categorías empiezan en 1). Toda importación de datos debe sanitizar estas llaves foráneas y asignarlas a valores válidos por defecto.
2. **Sincronización de Esquemas**: La base de datos de producción es la fuente de verdad (construida a partir de las migraciones de Laravel). Se implementó un filtro dinámico (`Schema::getColumnListing`) en el script de sincronización para ignorar automáticamente cualquier columna local ('fantasma') que no exista formalmente en producción.
3. **Manejo Seguro de Reinicio de Tablas**: Dado que el usuario de PostgreSQL en Render (Free Tier) no es superusuario, no se pueden alterar parámetros de sesión (`session_replication_role`). La limpieza de datos debe hacerse empleando `TRUNCATE TABLE ... CASCADE` seguido del correcto orden de inserción (Tablas Padre -> Tablas Hijo).
4. **Rutas Dinámicas de Assets**: El frontend (React) y el backend (Laravel) **jamás** deben contener rutas hardcodeadas (`127.0.0.1`). Se debe utilizar siempre `import.meta.env.VITE_API_URL` en React y `env('APP_URL')` en Laravel.
5. **Carpeta Public vs Storage**: Las imágenes de productos se almacenan de manera nativa en `public/products` y son leídas estáticamente en Vercel. El Accessor `url_imagen` de Eloquent debe priorizar esta lectura directa obviando `Storage::url()` para prevenir conflictos de symlinks en la nube.
6. **Assets Estáticos en `/public/`**: Archivos como `modalgif.gif`, `logo.png`, `sede-rapifrios.jpg` deben ser rastreados explícitamente por Git (`git add`) antes del commit. Al ser la carpeta `public/` servida estáticamente en Vercel, cualquier asset no commiteado causará un error 404 en producción, aunque exista localmente.

---

## 7. Gestión de Media y Smart Fallback (Resiliencia de Assets)

Para mitigar la pérdida de imágenes en entornos efímeros (como el Free Tier de Render que limpia la carpeta public en cada despliegue), se ha implementado un sistema de "Auto-Curación":

1. **Resolución Inteligente (`getImageUrl`)**: Centralizada en `src/utils/imageUtils.ts`. Discrimina automáticamente si un asset es una subida de backend (guion bajo en el nombre) o un asset estático de Git, añadiendo cache-busting dinámico.
2. **Recuperación Activa (`handleImageError`)**: Implementada en todas las etiquetas `<img>` críticas (Catálogo, Inventario, Portal VIP). Si una imagen falla (404), el sistema ejecuta una rotación de intentos:
   - Intenta cambiar la extensión (ej: `.jpg` por `.png`).
   - Realiza un "Local Guess": busca en la carpeta local de Git usando la primera palabra del nombre del producto (ej: `/products/stella.jpg`).
   - Cae en un `placeholder.jpg` corporativo como última instancia.
3. **Estándar de Implementación**: Queda prohibido el uso de etiquetas `<img>` sin el manejador `onError={handleImageError}` en módulos que consuman datos del catálogo.
4. **Assets Raíz de `/public/`**: Los assets de UI estática (gif, jpg, png de uso general) se referencian directamente como `src="/archivo.ext"` desde el componente React. No pasan por `getImageUrl` ni `SmartImage`.

---

## 8. Historial de Cambios Recientes en Producción (Mayo 2026)

| Commit | Tipo | Descripción |
|---|---|---|
| `0bc49ac` | fix | Actualizado enlace de Instagram a `rapifriosltda` en `Layout.tsx` |
| `97ff77a` | fix | Padding inferior en `ContactSection.tsx` para evitar colisión visual con barra de números |
| `90b3b02` | fix | Colisión de texto corregida y enlaces de Google Maps activados en tarjetas de sedes |
| `4e1ee09` | refactor | Eliminado título y botón del modal de bienvenida para maximizar tamaño del GIF |
| `9a2d1ef` | fix | Escalado del GIF del modal por altura de viewport (simula zoom 80%) |
| `e5ec2dd` | chore | Añadido `modalgif.gif` al repositorio Git (estaba untracked, causaba 404 en producción) |
| `7cede10` | fix | Reemplazado `SmartImage` por `<img>` directa en modal de bienvenida |
| `39c5d48` | UI | Modal de bienvenida reemplazado: de texto a infografía GIF de guía de pedido |
| `23f11f6` | UI | Eliminados botones de navegación desktop en sección VIP |
| `4f248f3` | UI | Eliminado botón "Iniciar Sesión" del encabezado público |

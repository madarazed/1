# Contexto del Proyecto: RAPIFRIOS NEXUS (v3.3 — Producción Activa)

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
- **OnboardingModal / Modal de Bienvenida** (`Landing.tsx`): Modal de primera visita, implementado con **React Portal** (`createPortal` → `document.body`) para romper el stacking context del árbol de la Landing.
  - Muestra el GIF `modalgif.gif` (infografía de 3 pasos) servido desde `/public/modalgif.gif`.
  - Implementación con etiqueta `<img>` estándar (no `SmartImage`) ya que es un asset estático de UI.
  - Dimensionado con `max-h-[90vh] w-auto` para escalar desde la altura disponible del viewport.
  - Botón de cierre `✕` en `absolute top-4 right-4` con `z-[10001]`.
  - **Jerarquía de Capas Definitiva del Modal**:
    - Overlay oscuro: `fixed inset-0 bg-black/80 backdrop-blur-md z-[9999]` (cubre todo el layout).
    - Panel blanco con infografía: `relative z-[10000]`.
    - Botón de cierre: `z-[10001]`.
  - **Control de Sesión**: Clave `hasSeenMichelobModal_v4` en `sessionStorage`. Incrementar el sufijo numérico si se necesita forzar la visualización para todos los usuarios en un nuevo despliegue.
  - La animación de entrada/salida está gestionada por `AnimatePresence` de Framer Motion, ubicado **dentro** del Portal para compatibilidad correcta.
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
- **React Portals**: El Modal de Bienvenida en `Landing.tsx` se renderiza mediante `createPortal` directamente en `document.body`, rompiendo el stacking context del árbol de componentes. Los modales del panel admin usan el mismo patrón (`z-[1000]` a `z-[9999]`).
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
| `common/MagneticBubblesBackground.tsx` | **SAGRADO — NO MODIFICAR.** Enjambre de burbujas en canvas con física magnética (Pointer + Touch Events). Canvas en `z-20`, `mix-blend-screen`, `pointer-events-none`. |
| `Footer.tsx` | Footer corporativo responsivo con enlaces dinámicos y navegación pública |

### 3.3. Ecosistema de Animaciones e Interacciones (Framer Motion & CSS)

#### A. Stack Tecnológico de UI Dinámica
- **Framer Motion**: Motor principal encargado de la orquestación de estados complejos, eventos de scroll de alto rendimiento y efectos de revelación (Stagger).
- **Tailwind CSS Utilities**: Animaciones nativas y aceleradas por hardware para micro-interacciones rápidas y bucles infinitos de rendimiento optimizado (Shimmer).

#### B. Inventario de Animaciones por Componente

1. **Header / Navbar Evolutiva (`Layout.tsx`)**
   - **Mecanismo**: Controlado por el evento de alto rendimiento `useMotionValueEvent` de Framer Motion (60 FPS) bajo un umbral de 50px.
   - **Comportamiento**: Transiciona de transparente (`py-5`, `text-primary`, `border-transparent`) a sólido (`bg-white`, `py-3`, `shadow-lg`, `border-slate-100`).
   - **Z-Index**: Fijado en `z-30` para quedar por debajo del Modal de Bienvenida (`z-[9999]`). El Sidebar Social, WhatsApp y Bottom Nav también son `z-30`.
   - **Efecto Colateral Sincronizado**: El botón flotante del carrito de compras en PC se oculta automáticamente cuando el header está en estado transparente y aparece junto con el modo sólido.
   - **Smart Reveal**: El header se oculta suavemente al bajar el scroll (umbral 150px) y reaparece al subir, liberando espacio de lectura en móvil.

2. **Orbes Ambientales / Ambient Blobs (`Landing.tsx` — Hero)**
   - **Mecanismo**: Divs absolutos animados (`motion.div`) con las clases `blur-3xl opacity-10 pointer-events-none z-0`.
   - **Trayectoria**: Bucle infinito asíncrono y ultra lento que simula profundidad. Orbe Azul (18s linear, eje `[0, 40, -20, 0]`) y Orbe Navy (22s linear, trayectoria inversa, delay 3s).
   - **Regla Crítica**: El uso de `pointer-events-none` es **obligatorio** para evitar el bloqueo de clics en los botones CTA principales del Hero.

3. **Efectos de Revelación Dinámica / Scroll Reveal**
   - **Componentes**: Tarjetas de Promociones (`Landing.tsx`), Grid de Categorías (`Landing.tsx`) y Tarjetas de Sedes (`ContactSection.tsx`).
   - **Física del Easing**: `initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}`. Utiliza un cubic-bezier premium que emula un comportamiento elástico natural.
   - **Orquestación en Cascada (Stagger)**:
     * Promociones: `delay: index * 0.12s`
     * Categorías Base: `delay: i * 0.07s` (efecto dominó fluido al cargar las 8 categorías)
     * Sedes: `delay: index * 0.12s`

4. **Brillo en Skeletons de Carga / Shimmer Effects (`index.css`)**
   - **Mecanismo**: Clases utilitarias globales `.skeleton-shimmer` (dark mode) y `.skeleton-shimmer-light` (light mode) registradas en `@layer utilities`.
   - **Comportamiento**: Animación CSS pura basada en la traslación de la propiedad `background-position` de un degradado lineal de izquierda a derecha de forma infinita (`animate-[shimmer_1.5s_infinite]`).
   - **Optimización**: Ejecución delegada directamente a la GPU, evitando re-renders del Virtual DOM de React mientras SWR actualiza los datos.

5. **Enjambre de Burbujas Magnéticas (`MagneticBubblesBackground.tsx`) — COMPONENTE SAGRADO**
   - **Regla de Oro**: Este archivo **no puede ser modificado, renombrado ni eliminado** bajo ninguna circunstancia. Contiene el motor de animación de Canvas calibrado y estable.
   - **Mecanismo**: Renderizado mediante **HTML5 Canvas API** ejecutado en la GPU con rigurosa limpieza de fugas de memoria (`cancelAnimationFrame`).
   - **Interactividad Universal**: Escucha `pointermove`, `pointerleave`, `pointerup`, `touchstart`, `touchmove`, `touchend` y `touchcancel` para respuesta tanto en mouse como en dispositivos táctiles.
   - **Jerarquía de Capas**: Canvas en `className="fixed inset-0 z-20 pointer-events-none mix-blend-screen"`. El `<main>` de Landing queda en `relative z-[1]`.

#### C. Directrices de Mantenimiento para Animaciones
1. **Prohibición de Layout Re-flows**: Queda estrictamente prohibido animar propiedades físicas directas que fuercen al navegador a recalcular el tamaño de la caja (como `width`, `height`, `margin` o `padding` numérico directo en píxeles). Toda transformación espacial debe delegarse a propiedades aceleradas por hardware (`x`, `y`, `scale`, `opacity`).
2. **Persistencia de Eventos**: Cualquier adición al Navbar o elementos flotantes debe heredar la transición fluida de la cabecera (`duration-200 ease-out`) para evitar parpadeos visuales asíncronos.
3. **Umbral de Scroll Canónico**: El valor de 50px como umbral de activación del estado `isScrolled` es el estándar del proyecto. No modificar sin evaluar impacto en el Smart Reveal (150px).
4. **Scroll Reveal de Uso Obligatorio**: Todo nuevo grid de tarjetas o sección de contenido en las páginas públicas debe implementar `whileInView` con los parámetros canónicos definidos en el punto B.3 para mantener la cohesión visual.

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
| `9a2d1ef` | fix | Escalado del GIF del modal por altura de viewport |
| `e5ec2dd` | chore | Añadido `modalgif.gif` al repositorio Git (estaba untracked, causaba 404 en producción) |
| `7cede10` | fix | Reemplazado `SmartImage` por `<img>` directa en modal de bienvenida |
| `39c5d48` | UI | Modal de bienvenida reemplazado: de texto a infografía GIF de guía de pedido |
| `23f11f6` | UI | Eliminados botones de navegación desktop en sección VIP |
| `4f248f3` | UI | Eliminado botón "Iniciar Sesión" del encabezado público |
| `1edb03f` | fix | Purgado de referencia huérfana de `Footer` en `Landing.tsx` |
| `43dd48d` | refactor | Eliminación de `Footer.tsx`, creación de `useRoleRedirect` y parametrización de Facebook |
| `a76484f` | fix | Versión estable base: burbujas magnéticas con Pointer Events + Touch Events activos |
| `88aa14b` | fix | Calibración de z-index: elementos flotantes del Layout bajados a `z-30` |
| `780181b` | fix | Migración del Modal de Bienvenida a React Portal (`createPortal → document.body`) |
| `05dc73d` | fix | Corrección de visibilidad del modal: nueva clave de sesión `v4` + AnimatePresence dentro del Portal |

---

## 9. Mantenimiento y Salud del Proyecto

Se han completado dos fases de limpieza para eliminar toda la deuda técnica identificada.

### 9.1. Acciones Realizadas — Fase 1 (Resuelto ✅)
- **Eliminación de Código Muerto**: Se eliminó físicamente `Footer.tsx` y se purgaron todas sus referencias en `Landing.tsx`. El asset `welcome_guide.webp` también fue removido.
- **Centralización de Redirección**: Se implementó el hook `useRoleRedirect.ts` en `Landing`, `Catalogo` y `VipPortal`, eliminando ~100 líneas de lógica duplicada.
- **Parametrización Dinámica (Facebook)**: El enlace de Facebook en `Layout.tsx` consume la tabla `configs` vía `useConfigs.ts`, con fallback de seguridad.

### 9.2. Acciones Realizadas — Fase 2 (Resuelto ✅)
- **Instagram Dinámico**: El enlace de Instagram en `Layout.tsx` migrado al hook `useConfigs` con clave `instagram_url` y fallback a `https://www.instagram.com/rapifriosltda/`. Todos los enlaces sociales son ahora 100% administrables desde el panel sin redeployment.
- **Accessor de Imágenes Saneado** (`backend/app/Models/Producto.php`): El accessor `getUrlImagenAttribute` fue simplificado para retornar **únicamente el nombre plano del archivo**. Toda la lógica de construcción de URL, CDN y fallbacks reside exclusivamente en `getImageUrl()` y `SmartImage.tsx` del frontend.
- **Validaciones Robustas en SettingsManager**: Se implementó validación frontend defensiva antes de cada `api.post()`:
  - Variables enteras (salario, auxilio, deducciones): deben ser enteros positivos > 0.
  - Campos tipo URL/link: validados contra `URL_REGEX` (debe iniciar con `http://` o `https://`).
  - Teléfonos de sedes: validados con `PHONE_REGEX` — exactamente 10 dígitos numéricos.
  - Errores bloqueantes mostrados vía `toast.error()` de `sonner`, protegiendo la DB de producción de datos corruptos.

### 9.3. Deuda Técnica Remanente
- **Ninguna deuda técnica crítica identificada.** El sistema está en estado arquitectónico limpio.
- *Mejoras opcionales futuras*: Agregar edición inline de sedes existentes (botón `Edit2` actualmente sin handler) y migrar `SEDES` del archivo `constants.ts` a la tabla `sucursales` de la base de datos para administración dinámica completa.

### 9.4. Arquitectura de Capas Z-Index (Jerarquía Global Canónica)

| Nivel | Componente | z-index |
|---|---|---|
| Base | Fondo de página (`bg-surface-light`) | `0` |
| Atmósfera | Canvas de burbujas magnéticas (`MagneticBubblesBackground`) | `20` |
| Contenido | `<main>` de Landing Page | `1` (relativo) |
| Navegación | Header, Sidebar Social, WhatsApp, Bottom Nav, Carrito PC | `30` |
| **Modal** | **Overlay del Modal de Bienvenida (React Portal)** | **`9999`** |
| **Modal** | **Panel blanco de la infografía** | **`10000`** |
| **Modal** | **Botón de cierre `✕`** | **`10001`** |

> **Regla de Blindaje**: El Modal vive en `document.body` vía `createPortal`, por lo que sus z-indices son absolutos al viewport y no dependen del stacking context de ningún padre. Los elementos flotantes del Layout son `z-30` para quedar siempre por debajo del modal.

### 9.4. Estándares de Implementación
- **Navegación por Rol**: Cualquier nueva vista DEBE usar `useRoleRedirect`.
- **Configuraciones Globales**: Todo parámetro global DEBE consumirse via `useConfigs` para cambios en caliente.
- **Imágenes**: El backend entrega solo el `basename`. El frontend resuelve la URL completa vía `getImageUrl()`.
- **Formularios Admin**: Toda operación `POST` a la API DEBE validar datos en el frontend antes del envío.

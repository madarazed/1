# Contexto del Proyecto: RAPIFRIOS NEXUS (Versión 2.0 Definitiva - Arquitectura Nexus)

## 1. VISIÓN GLOBAL Y PROPÓSITO

* **El Ecosistema**: Rapifrios Nexus (v3.3) es una plataforma web híbrida diseñada para acelerar las ventas y optimizar la logística, actuando como un puente tecnológico sobre el sistema ERP existente.
* **Frontera de Responsabilidades**: El software de escritorio Syscafe es la única fuente de la verdad inmutable para facturación fiscal, nómina y contabilidad. Nexus no procesa pagos en línea ni genera facturas legales.
* **Vitrina Comercial (Pública)**: Un catálogo de alta velocidad orientado a la conversión directa sin fricción (Cero Login para clientes).
* **Torre de Control (Privada)**: Dashboard de gestión logística, auditoría de flota vehicular y visor de stock multisede.

---

## 2. ARQUITECTURA Y STACK TECNOLÓGICO

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, SWR (Revalidación de datos en tiempo real). Despliegue en Vercel.
* **Backend**: Laravel 12 (API Restful), PostgreSQL. Despliegue en Render (Free Tier).
* **Gestión de Assets (Resiliencia)**: Uso estricto del componente `SmartImage.tsx` y la función `getImageUrl` para rotación de extensiones y fallbacks ante pérdidas de imágenes de productos. Assets de UI fijos usan etiquetas `<img>` apuntando a `/public/`.
* **Performance Frontend (60FPS)**: Implementación de optimizaciones críticas para mitigar cuellos de botella y maximizar la fluidez visual:
  - **useDebounce**: Aplicado con un delay de 300ms en el buscador unificado (`Catalogo.tsx` y `Landing.tsx`) para evitar recálculos síncronos excesivos por cada pulsación de tecla (latencia cero).
  - **useMemo & useCallback**: Utilizados en `TutorialContext.tsx` y otros proveedores para encapsular valores y callbacks de forma estable, previniendo re-renders destructivos en cascada del DOM.
  - **window.requestAnimationFrame (RAF)**: Utilizado en `TutorialOverlay.tsx` para sincronizar las lecturas/escrituras de posición del Spotlight durante eventos de scroll y resize, eliminando el Layout Thrashing y manteniendo tasas de refresco de 60 FPS estables.
* **Dependencias Clave (package.json)**:
  - **Visualización de Datos**: `recharts` para diagramar las gráficas interactivas y proyecciones de nómina en el panel de control.
  - **Gestión de Formularios**: `react-hook-form` para optimizar el rendimiento de entrada de datos en la gestión de inventario y personal, previniendo re-renders innecesarios.
  - **Notificaciones de UI**: `sonner` para toasters flotantes ligeros y consistentes.

---

## 3. FLUJO DE USUARIOS, ROLES Y AUTENTICACIÓN

* **Cliente / Público General**: Navegación libre por el `Landing.tsx` y el catálogo unificado (incluyendo productos VIP con estética premium). El proceso de compra culmina enviando un payload de texto estructurado directamente al WhatsApp de la sede seleccionada.
* **Superadmin / Admin Sucursal**: Acceso total a `/admin`. Gestión de configuraciones globales, carga de inventario maestro y control del semáforo logístico.
* **Cajera**: Acceso restringido exclusivamente a un "Visor de Inventario" en tiempo real para consultar existencias por sede y mitigar cuellos de botella en la comunicación interna.
* **Repartidor / Conductor**: Acceso a `/repartidor/checkin`. Deben diligenciar obligatoriamente el Checklist Pre-operacional. Sin estado "Bueno", el sistema bloquea su operación diaria.
* **Seguridad y Redirección Centralizada**:
  - **Interceptor de Peticiones Axios**: Configurado en `api.ts` para anexar automáticamente el encabezado `Authorization: Bearer ${token}` extraído de `localStorage` en cada petición API dirigida al servidor.
  - **Redirección Reactiva por Rol (`useRoleRedirect.ts`)**: Hook centralizado que intercepta accesos a `/login`, `/` o `/vip-portal` redirigiendo inmediatamente según el rol: roles de oficina (`Superadmin`, `Admin Sucursal`, `Cajera`) a `/admin`, roles logísticos (`Repartidor`, `Conductor`) a `/repartidor/checkin`, y clientes VIP a `/vip-portal`.
  - **Control de Permisos Dinámico (`AuthContext.tsx`)**: Implementa un método `hasPermission(permission)` en el frontend. Los usuarios con rol `Superadmin` tienen acceso absoluto. Los usuarios con rol `Admin Sucursal` tienen restringido el permiso `'edit_offers'` de forma que solo se les concede si su sede activa es exactamente `'Centro'`. Otros roles operativos se evalúan directamente comparando la coincidencia del nombre del rol con el permiso solicitado.
  - **Vista Dual de Repartidor / Auditoría (`Logistica.tsx`)**: Si se accede directamente sin parámetros, funciona en modo de registro de jornada/checklist del conductor asignado. Si un administrador con rol `Superadmin` accede con parámetro de ruta `/admin/logistica/repartidor/:id`, se activa el "Modo Gestión de Administrador" que presenta una barra superior de advertencia naranja, redirige las peticiones API del vehículo asignado a `/admin/conductores/{id}/vehiculo` en lugar de `/repartidor/vehiculo-asignado`, y permite auditar y registrar checklists o jornadas en nombre del repartidor.

---

## 4. MÓDULO DE INVENTARIO (SISTEMA DE CARGA BATCH)

* **Sincronización de Baja Fricción**: Nexus actualiza su stock a través de una importación manual de archivos CSV extraídos de Syscafe. La carga se realiza desde la interfaz del Catálogo de Administración (`AdminLayout.tsx`) subiendo un archivo `.csv` o `.txt` al endpoint `/api/productos/importar-masivo`, gestionado con feedback visual mediante toasters de estado (`sonner`).
* **Lógica del Procesador de CSV (`ProductoController.php`)**:
  - **Mapeo de Índices**: Localiza dinámicamente las columnas obligatorias buscando la cabecera `REFERENCIA` en el primer campo, identificando las columnas para código de referencia, descripción (`DETALLE`), precio (`LISTA GENERAL`), y marca (`MARCA`).
  - **Sanitización de Precios**: Elimina símbolos de pesos (`$`), espacios en blanco y puntos de miles. Sustituye las comas por puntos antes del casteo decimal.
  - **Auto-Enlace Semántico**: Al procesar productos antiguos (que carecen de `codigo_referencia`), extrae su nombre y lo normaliza (conversión a mayúsculas, remoción de variantes de unidades como `UNIDADES`, `UNIDAD`, `UNDS`, `UND` y eliminación de caracteres no alfanuméricos). Compara este texto normalizado con la descripción del CSV para enlazar automáticamente el código de referencia en base de datos.
  - **Sincronización Maestra (Purga)**: Al culminar el procesamiento por lotes (upsert de 500 registros), ejecuta un soft-delete de todos los productos de la base de datos cuyos códigos de referencia no estén presentes en el CSV importado, o que tengan referencias nulas o vacías.
* **Mantenimiento y Garbage Collection de Importaciones**: Se implementa la ruta `/api/productos/limpiar-basura-importacion` (`limpiarBasuraImportacion` en `ProductoController`) para que los Superadmins purguen de forma segura todos los productos creados en la fecha actual que tengan como imagen `placeholder.png`, saneando la base de datos tras importaciones fallidas.
* **Transparencia Operativa**: La interfaz debe mostrar claramente la fecha y hora de la "Última actualización de stock" para que administradores y cajeras comprendan que los datos tienen un margen de desfase temporal frente a la venta física.

---

## 5. ESTADO DE LA IMPLEMENTACIÓN (MÓDULOS FINALIZADOS)

### 5.1. Torre de Control Operativa (Dashboard)
- Enfoque total en **salud financiera y logística** (Métricas de ventas eliminadas por decisión estratégica).
- **KPIs Financieros**: Cálculo en tiempo real de la proyección de nómina derivado de las jornadas laboradas reales.
- **Semáforo Logístico**: Panel dinámico que mide el porcentaje de cumplimiento de inspecciones de flota diaria, con alertas visuales pulsantes.
- **Zero-Friction**: Botones de acción rápida para notificar vía API a conductores rezagados o actualizar SOAT/Tecnomecánicas.

### 5.2. Configuración Maestra (Settings)
- **Persistencia**: Tabla `configs` en base de datos tipo Key-Value para parametrización ilimitada.
- **Caché Instantáneo**: Laravel Cache con invalidación automática garantizando 0 ms de latencia.
- **Parametrización**: Gestión de Sedes, Categorías y Variables del Sistema (Salario Mínimo, Auxilio, deducciones).
- **Seguridad Perimetral**: Módulo estrictamente bloqueado para cualquier rol que no sea "Superadmin".

### 5.3. Centro de Reportes
- Generación de reportes corporativos firmados digitalmente (Branding Navy Blue) usando `barryvdh/laravel-dompdf`.
- Desprendibles automáticos de nómina, hoja de vida vehicular e inventario de existencias.

### 5.4. Gestión de Personal y Logística Core
- **Módulo de Flota**: Integración para seguimiento de vencimientos documentales (Alertas críticas).
- **Regla de Oro Logística**: Bloqueo absoluto de operación sin Checklist diario aprobado.
- **Blindaje de Operaciones (Flujo de Jornadas)**:
  - **Protección de Concurrencia**: Implementación del estado `isProcessing` en `processStart` y `processFinish` en `JornadaComponent.tsx` para inmovilizar botones y evitar solicitudes HTTP duplicadas (doble clic / doble inicio).
  - **Validación Estricta de Turno**: Si el estado del empleado es `active_shift` o `Iniciada`, se oculta/deshabilita proactivamente el botón de "Iniciar Jornada" y se despliega exclusivamente "Finalizar Jornada".
- **Asignación de Vehículos & Optimistic UI**: Actualización inmediata en caliente de los arrays de estado locales (`users` y `vehicles`) en `UserManagement.tsx` tras registrar o actualizar conductores. Esto asegura que la interfaz refleje el vehículo y conductor vinculados con cero latencia visual, ejecutando la sincronización de base de datos en segundo plano.
- **Botón de Pánico (Override de Super Admin)**: Integración de la función `forceResetShift(employeeId)` en `LogisticsAdmin.tsx` que habilita un botón visible únicamente para administradores con el rol `Superadmin` cuando el conductor tiene un turno activo. Permite finalizar de forma segura una jornada atascada y liberar el vehículo (`id_usuario_asignado = null`) en una sola transacción backend.

### 5.5. Catálogo Maestro, Buscador y Portal VIP
- **Buscador Unificado**: Filtro en tiempo real por nombre, descripción y marca simultáneamente en catálogo público y portal VIP.
- **Portal VIP y Segmentación**: Despliegue de vistas segregadas. Las ofertas exclusivas solo existen en `/vip-portal` con diseño Dark Slate + Ámbar. La navegación pública se oculta desde el portal VIP.
- **Redirección Inteligente por Rol**: Los usuarios logueados son enrutados a `/admin`, `/repartidor/checkin` o `/vip-portal` automáticamente.

### 5.6. Landing Page Pública y Contacto
- **OnboardingModal (Modal de Bienvenida)**: Renderizado en `document.body` mediante **React Portal**. Infografía GIF escalable y animada.
- **Sección Hero**: Carruseles VIP de ofertas y animación de categorías.
- **Sección Contáctanos**: Tarjetas de sede con Google Maps dinámicos y padding espacioso anti-colisiones.
- **Túnel de Onboarding (v3.3 Final)**: Sistema de spotlight de 3 pasos reescrito en `TutorialOverlay.tsx`. Utiliza box-shadow inverso cross-browser, retardo de inicio (800ms) para animaciones, "Morphing Spotlight" expandible dinámicamente con la lista de búsqueda `#tutorial-search-results`, anclaje "Hugging Docking" que acompaña los resultados dinámicos, "Smart Skip" que autocompleta el paso 1 al añadir desde el buscador directo al Paso 3, y sincronización estricta de 1200ms delegada en el `ShoppingDrawer.tsx` para absorber las físicas de resorte (Spring Physics) de Framer Motion.
- **Marquesina Infinita (Infinite Ticker)**: Franja horizontal animada ubicada justo debajo del Hero/VIP, que utiliza Framer Motion con una transición lineal infinita (`x: [0, "-50%"]`) para mostrar de forma continua promesas corporativas ("Frío Extremo", "Rapidez Absoluta", "Garantía de Calidad", "Logística Integrada").

---

## 6. INVENTARIO FRONTEND Y ECOSISTEMA DE ANIMACIONES

### 6.1. Inventario Completo de Páginas (`src/pages/`)
| Archivo | Ruta | Descripción |
|---|---|---|
| `Landing.tsx` | `/` | Landing page pública con Hero, VipOffersCarousel y ContactSection |
| `Catalogo.tsx` | `/catalogo` | Catálogo público con filtros, buscador y carrito |
| `LoginPage.tsx` | `/login` | Autenticación unificada por rol |
| `VipPortal.tsx` | `/vip-portal` | Portal exclusivo Cliente VIP |
| `AdminCatalog.tsx` | `/admin/catalogo` | Gestión de productos (CRUD) |
| `AdminInventory.tsx` | `/admin/inventario` | Control de stock y ajustes |
| `DashboardOverview.tsx` | `/admin` | Torre de control operativa |
| `SettingsManager.tsx` | `/admin/configuracion` | Parámetros del sistema |
| `UserManagement.tsx` | `/admin/usuarios` | Gestión de personal y roles |
| `ReportCenter.tsx` | `/admin/reportes` | Generación de PDFs corporativos |
| `FleetManagement.tsx` | `/admin/flota` | Seguimiento de vehículos y documentos |
| `Logistics...` | `/admin/logistica` | Varias vistas de control y administración logística |
| `Logistica.tsx` | `/repartidor/checkin` | Vista del repartidor (Checklist) |

### 6.2. Inventario de Componentes (`src/components/`)
| Archivo | Descripción |
|---|---|
| `Layout.tsx` | Shell principal: Navbar, Sidebar social, WhatsApp flotante |
| `AdminLayout.tsx` | Shell del área admin con Sidebar y Nexus Assistant |
| `ContactSection.tsx` | Sección "Contáctanos" con mapa iframe |
| `FilterDrawer.tsx` | Drawer lateral de filtros para catálogo (mobile-first) |
| `ShoppingDrawer.tsx` | Drawer del carrito de compras |
| `VipOffersCarousel.tsx` | Carrusel de ofertas VIP con scroll-snap |
| `SeccionExclusiva.tsx` | Grid de productos exclusivos con estética Ámbar |
| `ProductEditModal.tsx` | Modal de edición de producto con subida de imagen |
| `common/SmartImage.tsx` | Componente de imagen resiliente (solo catálogo) |
| `common/MagneticBubblesBackground.tsx` | **SAGRADO**. Enjambre de burbujas en canvas magnético. |

### 6.3. Ecosistema de Animaciones (Framer Motion & CSS)
- **Header Evolutivo**: Controlado por `useMotionValueEvent` (60 FPS) transicionando de transparente a sólido.
- **Orbes Ambientales (Hero)**: Divs absolutos ultra lentos con `pointer-events-none` estricto.
- **Scroll Reveal**: Efectos de revelación con easing premium `cubic-bezier` y stagger dinámico.
- **Shimmer Effects**: Brillo de skeletons de carga delegados a la GPU vía CSS en `index.css`.
- **Enjambre Magnético**: HTML5 Canvas API interactivo multi-táctil.
- **Animación Parabólica Fly-to-Cart**: Implementada dinámicamente en `CartContext.tsx`. Al añadir un producto al carrito, crea un elemento de imagen flotante temporal, calcula la posición del botón del carrito (`#mobile-cart-btn` o `#desktop-cart-btn`) mediante `getBoundingClientRect()`, y desplaza la imagen utilizando una transición de 600ms con una curva `cubic-bezier(0.25, 1, 0.5, 1)`, reduciendo su tamaño y desvaneciéndola gradualmente antes de remover el nodo.

### 6.4. Estructura de Datos (Categorías Base)
1. Aguas | 2. Cervezas | 3. Energizantes | 4. Gaseosas | 5. Hidratantes | 6. Jugos | 7. Licores | 8. Sodas

---

## 7. INTERFAZ, DISEÑO Y ANIMACIONES (ANTIGRAVITY RULESET)

* **Identidad Visual**: "Navy Blue" corporativo y acentos Ámbar/Dorados (Dark Slate) para la segmentación de productos exclusivos. Interfaces admin oscuras (`#0F172A`) priorizando indicadores CTA.
* **Configuración del Sistema de Diseño (Tailwind CSS)**:
  * **Paleta de Colores Extendida**: `primary` (#003366 - Navy Blue corporativo), `primary-light` (#007BFF), `surface-light` (#F8F9FA), `text-main` (#333333), `on-surface-variant` (#666666).
  * **Border Radius Extendido**: `cta` ("12px") para botones y llamadas a la acción estandarizados.
  * **Tipografía (Google Fonts)**: `headline` ("Plus Jakarta Sans"), `body` ("Inter"), `cta` ("Montserrat").
* **Jerarquía Z-Index Canónica**: 
  * Modal de Bienvenida en `z-[9999]` a `z-[10001]` (vía React Portals directamente en `document.body`).
  * Navbar y flotantes en `z-30`.
  * Burbujas magnéticas del fondo en `z-20` (estrictamente con `pointer-events-none` `mix-blend-screen`).
  * Contenido general (`<main>`) en `z-1`.
* **Estándar Above the Fold Perfecto (Hero Principal)**: Para garantizar que el 100% del contenido crítico (Navbar, Buscador, Título, CTA, Imagen 3D y el Carrusel de Categorías completo) sea visible sin scroll en laptops estándar (viewport útil ~650px), la altura total combinada del Hero debe limitarse a un máximo de **`612px`** a **`640px`**. Esto exige restringir la imagen a `max-h-[30vh] lg:max-h-[45vh]`, limitar contenedores de imagen responsivos a un máximo de `lg:h-[320px]`, reducir paddings verticales de sección (`pt-2 lg:pt-6`), reducir márgenes de títulos/buscador (`mb-6`, `mb-3`), y aplicar `shrink-0` en el carrusel de categorías para blindarlo contra el colapso del flexbox.
* **Reglas de Animación**: Uso de Framer Motion para Scroll Reveal y Tailwind para Shimmer de carga. Prohibido animar propiedades que fuercen re-flows del DOM (ej. `width`, `margin`).
* **Cero Hardcodeo**: Toda variable operativa, teléfono, red social, sede o matemáticas de nómina deben consumirse dinámicamente desde la base de datos vía caché/Backend.
* **Manejo de Errores Silencioso**: Uso de Sonner Toasting y estados de carga nativos; bloqueos proactivos de UI.

---

## 8. MAPA DE RUTA Y REFACTORIZACIONES PENDIENTES

* **Checkout de WhatsApp**: Modificar `ShoppingDrawer.tsx` para generar la URL dinámica hacia la API de WhatsApp en lugar de hacer un POST al backend.
* **Poda de Código Muerto**: Eliminar vistas, guards de autenticación de clientes y módulos de nómina que han sido absorbidos por Syscafe.
* **Importador CSV**: Construir la lógica en Laravel y la interfaz en React para la actualización masiva de inventario.
* **Sedes Dinámicas**: Conectar la configuración de sedes a la tabla sucursales de la base de datos, eliminando la constante local.

---

## 9. MIGRACIÓN A PRODUCCIÓN Y RESILIENCIA DE ASSETS

### 9.1. Reglas de Migración (Render + Vercel + PostgreSQL)
1. **Gestión Estricta de Foreign Keys**: PostgreSQL no permite violaciones de integridad temporales.
2. **Reinicio Seguro de Tablas**: Emplear `TRUNCATE TABLE ... CASCADE`.
3. **Rutas Dinámicas**: Prohibido usar `127.0.0.1`. Siempre usar `import.meta.env.VITE_API_URL`.
4. **Assets Estáticos**: Todos los assets en `/public/` deben ser rastreados explícitamente en Git o generarán error 404 en Vercel.

### 9.2. Sistema de Auto-Curación de Assets (Smart Fallback)
1. **Resolución Inteligente (`getImageUrl`)**: Normaliza la obtención del path de las imágenes. Si no se provee imagen o es un placeholder (`placeholder.png` / `placeholder.jpg`), retorna `/products/placeholder.jpg`. Si es una URL externa (`http`), la devuelve directamente. Si el nombre de archivo contiene un guión bajo (`_`), infiere que es una subida del backend (volumen de Render) y le añade la URL base remota; de lo contrario, asume que es un asset local estático en `/products/`. Para productos generales, inyecta un timestamp de cache-busting `?v=time`, el cual se omite en portales VIP para no interferir en el ciclo de vida del SmartImage.
2. **Componente de Resiliencia Persistente (`SmartImage.tsx`)**: Reemplaza las etiquetas `<img>` estándar del catálogo público y VIP. Utiliza una memoria caché global fuera del componente llamada `ASSET_VAULT` (`Record<string, string>`) que almacena las referencias de URLs de Blobs ya rescatadas. Al desmontar y remontar el componente (ej. al abrir el carrito o cambiar de vista), `SmartImage` rescata el asset de la bóveda instantáneamente sin re-descargas ni parpadeos.
3. **Mecanismo de Rescate Activo en Frontend (`SmartImage` y `handleImageError`)**: Si un asset de producto falla en cargar (error 404 en Render), el sistema cambia su estado a `pending` (mostrando un Skeleton Loader con spinner de rescate en el caso de `SmartImage`). Espera un retardo prudencial de 1.5 segundos (dando margen al commit de sincronización asíncrona del backend) e inicia un fetch HTTP directo a la API de contenidos de GitHub: `https://api.github.com/repos/madarazed/1/contents/react/public/products/{filename}` especificando la cabecera `Accept: application/vnd.github.v3.raw` para evadir la caché de Vercel y obtener el contenido crudo. Al recibir el Blob, crea un Object URL local (`URL.createObjectURL(blob)`), lo guarda en `ASSET_VAULT` para persistencia, y lo asigna al `src` de la imagen. Si el rescate falla, aplica definitivamente `/products/placeholder.jpg`.
4. **Sincronización de Subidas desde el Backend (`ProductoController.php`)**: Cada vez que se crea o edita un producto con archivo de imagen en el panel de administración, el backend Laravel guarda el archivo en el almacenamiento persistente (`RENDER_DISK_PATH`, por defecto `public/products`) y dispara de forma asíncrona `pushImageToGitHub`. Este método realiza un PUT a la API de GitHub (`https://api.github.com/repos/{username}/{repo}/contents/{path}`) adjuntando el token PAT (`GITHUB_TOKEN`), un User-Agent explícito (`Rapifrios-Nexus-App`), y el contenido de la imagen codificado en Base64. El método verifica primero mediante GET si el archivo ya existe en el repositorio para obtener su `sha` correspondiente, asegurando la sobrescritura correcta del asset en lugar de un conflicto de duplicidad.

### 9.3. Configuración y Credenciales de Despliegue en Producción (Nexus Vault)

Para reinstaurar el entorno de producción en Render + Vercel una vez superados los límites de facturación, se deben configurar estrictamente las siguientes variables de entorno:

#### A. Backend (Laravel API en Render)
*   `APP_NAME`: `Rapifrios Nexus`
*   `APP_ENV`: `production`
*   `APP_DEBUG`: `false`
*   `APP_KEY`: `base64:P1lGHcT0QcXdBOvZGtPyyHpQpg/e2pNcKHB7MduHVhI=` (O generar uno nuevo mediante `php artisan key:generate`).
*   `APP_URL`: `https://rapifrios-backend.onrender.com`
*   `FRONTEND_URL`: `https://rapifrios-nexus.vercel.app`

**Configuración de PostgreSQL (CleverCloud o Render DB Add-on):**
*   `DB_CONNECTION`: `pgsql`
*   `DB_HOST`: *[Proporcionado por CleverCloud]* (ej. `b8dy...postgresql.services.clever-cloud.com`)
*   `DB_PORT`: `5432`
*   `DB_DATABASE`: *[Nombre asignado por CleverCloud]*
*   `DB_USERNAME`: *[Usuario asignado por CleverCloud]*
*   `DB_PASSWORD`: *[Contraseña asignada por CleverCloud]*

**Persistencia e Inmortalidad de Assets (GitHub API Integration):**
*   `RENDER_DISK_PATH`: `/data/products` (Ruta física del volumen montado en Render para almacenamiento local temporal).
*   `GITHUB_TOKEN`: *[Personal Access Token (PAT) del administrador]* (Requerido para sincronizar y commitear imágenes de productos subidas en tiempo real hacia GitHub).
*   `GITHUB_USERNAME` o `GITHUB_USER`: `madarazed`
*   `GITHUB_REPO`: `1`

#### B. Frontend (React en Vercel)
*   `VITE_API_URL`: `https://rapifrios-backend.onrender.com/api` (Apunta directamente al API Gateway de Laravel en producción).
*   `VITE_BACKEND_URL`: `https://rapifrios-backend.onrender.com`

### 9.4. Seguridad, Infraestructura y Reglas del Backend (API Laravel)
*   **Autenticación API con Laravel Sanctum**: Las peticiones de usuarios registrados se autentican utilizando tokens emitidos por Sanctum (`HasApiTokens`). El login retorna un `access_token` plano y el estado serializado del usuario incluyendo sus roles normalizados a minúsculas (`user.role`).
*   **Transacciones de Base de Datos**: Para garantizar la consistencia en el registro de inspecciones pre-operacionales de vehículos, la creación del checklist y de sus novedades logísticas asociadas se realiza bajo una transacción de base de datos (`DB::transaction`). Si falla la creación de novedades, la operación completa se revierte.
*   **Cálculo Automático de Horas Laborales (`JornadaLaboral.php`)**: La jornada finalizada calcula las horas totales del turno mediante la función `calcularHoras()`, que determina la diferencia en minutos entre el inicio y fin del turno. Si `hora_almuerzo` está registrado (indicando que el repartidor tomó descanso), resta automáticamente 60 minutos del tiempo total antes de guardar el valor final redondeado a dos decimales.
*   **Validación de Operación Vehicular en Inicio de Turno**: Al intentar iniciar jornada (`iniciarJornada` en `JornadaController.php`), el sistema valida:
    - Que el usuario tenga un vehículo asignado.
    - Que el vehículo no esté inmovilizado (debe estar en estado `Bueno` o `Activo`).
    - Que exista un Checklist aprobado (con estado general igual a `'1'`) registrado para la fecha actual (hoy). De lo contrario, retorna un error 403.

---

## 10. HISTORIAL DE CAMBIOS Y MANTENIMIENTO

### 10.1. Historial Reciente (Junio 2026)
| Commit | Descripción |
|---|---|
| `onboarding-tunnel-stabilization` | **Estabilización Definitiva del Túnel de Onboarding (v3.3 Final)**: Reescritura pura de `TutorialOverlay.tsx` implementando spotlight con box-shadow inverso (Safari-seguro) y eliminación de scroll locks destructivos. Sincronización asíncrona adaptada a las físicas de resorte (Spring Physics) del `ShoppingDrawer.tsx` mediante un retardo coordinado de 1200ms. Implementación de "Morphing Spotlight" y "Hugging Docking" para expandir el foco y anclar el tooltip dinámicamente según la visibilidad de los resultados de búsqueda. Intercepción "Smart Skip" en `Landing.tsx` para avanzar directo al paso 3 al comprar desde el buscador. Sección VIP Offers modificada a color rojo puro (`bg-red-600`) con auras de relieve blancas. |
| `hero-above-the-fold` | Compresión de altura responsiva, márgenes y paddings en `Landing.tsx` junto con el blindaje `shrink-0` del carrusel para lograr visualización perfecta sin scroll (Above the Fold) en laptops. |
| `pdf-report-core` | Integración de `laravel-dompdf`, `ReporteController` y plantillas Blade adaptadas para Hoja de Vida, Checklists, Mantenimientos y Cierre de Turno. |
| `fleet-management-pdf` | Inyección del botón de descarga segura PDF de Hoja de Vida con tipo 'blob' y spinner de carga en `FleetManagement.tsx`. |
| `report-center-dynamic` | Reestructuración de `ReportCenter.tsx` con un menú de categorías del ERP reactivo, y filtrado dinámico de vehículos y rangos de fechas. |
| `catalog-filter-shield` | Solución del bug de colisión de subcadenas ("Aguas" vs "Aguardientes") en el catálogo público usando filtros estrictos en frontend y backend. |
| `sync-master-purge` | Ajuste en la purga de la Sincronización Maestra en `ProductoController@importCsv` para forzar soft-delete de todos los rezagados (códigos nulos o vacíos). |
| `docs` | Actualización de documentación a "Versión 2.0 Definitiva - Arquitectura Nexus" (integración completa). |
| `90b3b02` | Colisión de texto corregida y enlaces de Google Maps activados en tarjetas de sedes. |
| `39c5d48` | Modal de bienvenida reemplazado a infografía GIF de guía de pedido escalable. |
| `43dd48d` | Eliminación de `Footer.tsx`, creación de `useRoleRedirect` y URLs sociales dinámicas en DB. |
| `a76484f` | Versión estable base del Canvas magnético con Pointer Events + Touch Events. |
| `780181b` | Migración del Modal de Bienvenida a React Portal (`createPortal → document.body`). |

### 10.2. Mantenimiento del Proyecto (Fases completadas)
- **Eliminación de Código Muerto**: Purgado `Footer.tsx` y centralización de redirección con `useRoleRedirect.ts`.
- **Validaciones Robustas en Configuración**: Validación frontend defensiva de números (enteros positivos) y URLs (`PHONE_REGEX`) protegiendo la base de datos de producción.
- **Deuda Técnica Remanente**: Ninguna crítica. Se planea agregar edición inline de sedes.

---

## 11. FLUJOS DE USUARIO DEEP-SCAN

### 11.1. Flujo de Venta Pública (Zero-Friction WhatsApp) - VERSIÓN DEEP-SCAN

**Actor**: Cliente (Público General — NO AUTENTICADO).

**El Proceso Detallado**:

*   **Estado Inicial**: El cliente ingresa a `Landing.tsx` (Index).
*   **Interacción UI (El Bloqueo Lógico)**: El sistema requiere saber a qué inventario/teléfono apuntar. El cliente debe interactuar con el `SedeSelector.tsx` (ubicado en el Navbar flotante z-30 o en un modal de bienvenida).
*   **Mutación de Estado**: La Sede elegida se guarda en el estado global del frontend, vinculándose a su respectivo número de teléfono (parametrizado en `useConfigs.ts`).
*   **Navegación**: El cliente explora el Catálogo Unificado y la Sección Exclusiva VIP (Ámbar).
*   **Acumulación de Estado**: Agrega productos a la bolsa. El `ShoppingDrawer.tsx` entra en acción, actualizando los subtotales de forma estrictamente local en el navegador.
*   **Validación de Checkout**: Al presionar "Confirmar Pedido", el sistema verifica internamente que exista una Sede seleccionada y que el carrito no esté vacío.
*   **Motor de Salida (Ignorando Laravel)**: El frontend genera un ciclo que convierte el array de productos en una cadena de texto (URI codificada).
*   **Ejecución Final**: Se dispara `window.open` concatenando la URL base de WhatsApp + el teléfono de la Sede seleccionada en el Paso 2 + el texto del pedido. El operario recibe el mensaje y lo factura manualmente en Syscafe.

---

## 12. BITÁCORA DE REFACTORIZACIÓN LOGÍSTICA (MAYO 2026)

Durante esta sesión de estabilización crítica, se auditó (Deep-Scan) y reconstruyó la columna vertebral del Módulo Logístico en el Frontend y Backend:

1. **Purga de Código Basura y Mocks (Frontend):**
   - Se eliminó físicamente `LogisticsVehicles.tsx` por ser código muerto que duplicaba responsabilidades con `FleetManagement.tsx`.
   - Se erradicaron los bloques `catch` silenciosos en el Frontend que inyectaban usuarios estáticos (ej. "Juan Pérez") cuando el servidor fallaba. El Frontend ahora está obligado a consumir datos reales.

2. **Panel Dual de Auditoría (`LogisticsDrivers.tsx`):**
   - Se transformó la vista plana de repartidores en un **Panel de Auditoría Dual** responsivo usando SWR para conectarse a `/api/admin/logistica/cumplimiento`.
   - **Columna Izquierda:** Lista conductores "En Ruta" con su estado_general (Verde, Naranja, Rojo).
   - **Columna Derecha (Alertas):** Panel rojo para visualización inmediata de los "Ausentes / Pendientes", mostrando la placa que tienen asignada.

3. **Métricas en Tiempo Real en Hub Logístico (`LogisticsNav.tsx`):**
   - Se reemplazaron las métricas hardcodeadas ("12 Conductores", "15 Realizados") por consumo directo en vivo vía SWR.
   - Implementación de *Skeletons Shimmer* (animación de carga) y validación segura con Optional Chaining (`data?.completados?.length || 0`) para prevenir roturas UI si falla la petición.

4. **Hotfixes Críticos en Backend (El Asesino Silencioso - Error 500):**
   - Se descubrió que el endpoint de estado de logística siempre había fallado en producción debido a una ambigüedad SQL (`SQLSTATE 1052: Column 'nombre' is ambiguous`) en la subconsulta `User::whereHas('roles')` porque tanto la tabla `users` como `roles` compartían una columna `nombre`.
   - Se corrigió explícitamente a `where('roles.nombre', 'Repartidor')` en `LogisticsController@obtenerResumenCumplimiento` y `LogisticsController@status`.
   - Se añadió el namespace cualificado `\App\Http\Controllers\LogisticsController::class` en `routes/api.php` que también estaba causando un `ReflectionException`.
   - **Herramienta Forense:** Se inyectó temporalmente un endpoint `/api/debug-log` para extraer y leer directamente el `laravel.log` remoto de Render, superando la limitación de consola de la plataforma.

5. **Reactivación y Hotfix de Gestión de Flota (`FleetManagement.tsx`):**
   - **Unificación de Estado**: Se corrigió una inconsistencia de variable de estado (`editingVehicle` vs `editingVehiculo`) en la carga del modal que causaba caídas silenciosas en el renderizado al presionar "Registrar Vehículo" o "Editar".
   - **Hotfix de Jerarquía Portal/AnimatePresence (React 19)**: Se descubrió que envolver `createPortal` directamente dentro de `<AnimatePresence>` evitaba que el motor de animaciones identificara correctamente el portal (debido a su tipo especial `$$typeof`), provocando un bloqueo de renderizado silencioso en el DOM sin lanzar excepciones. Se resolvió invirtiendo la jerarquía estructural: el Portal se renderiza primero, y `<AnimatePresence>` contiene al `<motion.div>` en su interior.

6. **Robustez e Infraestructura del Backend (Laravel API):**
   - **Error de Sintaxis PHP**: Reparado el punto y coma y la llave faltante en `ChecklistController.php` a nivel del flujo de verificación inicial de vehículos.
   - **Nuevos Endpoints**: Registro y cableado completo de las rutas de soporte `/repartidor/vehiculo-asignado`, `/admin/conductores/{id}/vehiculo` y `/logistica/jornada/activa` para un correcto funcionamiento en vivo.
   - **Mantenimiento Remoto**: Añadida la ruta `/api/clear-cache-secreto` para permitir la purga segura de las cachés de rutas, vistas y clases compiladas de Laravel desde el navegador.

7. **Estrategia Estricta de Cache-Busting (Evitando el Código Fantasma):**
   - **Meta Tags de Control**: Inyección de directivas directas de no almacenamiento en el DOM en `react/index.html` (`Cache-Control: no-cache, no-store, must-revalidate`, `Pragma: no-cache`, `Expires: 0`).
   - **Políticas HTTP en Vercel**: Adición de cabeceras diferenciadas en `react/vercel.json`:
     *   `public, max-age=0, must-revalidate` exclusivamente para los archivos `.html` (obligando a la validación constante de cambios).
     *   `public, max-age=31536000, immutable` para la carpeta `/assets/` aprovechando los hashes incrementales y únicos de Vite de forma óptima sin riesgo de obsolescencia.

---

## 13. BITÁCORA DE RENDIMIENTO Y BLINDAJE LOGÍSTICO (JUNIO 2026)

Durante esta sesión se abordaron problemas de latencia crítica en la interacción, fugas de rendimiento en renderizado y vulnerabilidades en flujos logísticos concurrentes:

1. **Debouncing en Buscador (Latencia Cero)**:
   - Creación del hook custom genérico y tipado `useDebounce.ts`.
   - Despliegue en `Landing.tsx` y `Catalogo.tsx` sobre la variable `searchQuery` con 300ms de retardo, impidiendo recálculos o llamadas redundantes al pulsar teclas sucesivamente.

2. **Throttling de Layout (RAF en TutorialOnboarding)**:
   - Implementación de `requestAnimationFrame` en `TutorialOverlay.tsx` para encolar la lectura y recalcular las posiciones del morphing spotlight anidado a `#tutorial-search-results`.
   - Esto detiene el Layout Thrashing recurrente durante los eventos del navegador de redibujado (`resize` y `scroll`), garantizando fluidez de 60 FPS estables.

3. **Manejo Seguro de Estados (TutorialContext Provider)**:
   - Sellado hermético del objeto literal del `TutorialContext.Provider` usando `useMemo` y memorización de manipuladores (`nextStep`, `closeTutorial`, `setStep`, `dismissStep2`, `dismissStep3`) vía `useCallback`.
   - Esto bloquea la cascada innecesaria de re-renders en componentes hijos del árbol de React cada vez que el estado del onboarding muta.

4. **Blindaje del Flujo de Jornadas (Anti-Doble Inicio)**:
   - Inyección del estado de bloqueo `isProcessing` en `JornadaComponent.tsx`. El modal permanece abierto en modo inhabilitado durante las peticiones backend de inicio/cierre.
   - Validación defensiva estricta: ante estados `active_shift` o `Iniciada`, se oculta estructuralmente la opción de inicio de turno.

5. **Asignación de Flota con Optimistic UI**:
   - Reescritura del flujo de guardado de asignaciones de vehículos en `UserManagement.tsx`. Tras la respuesta de éxito de Laravel, el frontend actualiza inmediatamente en memoria los listados locales de usuarios y vehículos para reflejar la relación bidireccional (liberación del auto previo y asignación al nuevo conductor) con cero latencia visual, cerrando el modal de inmediato y realizando el fetch en segundo plano.

6. **Control de Override para Super Admin**:
   - Cableado de la ruta `/admin/logistica/jornada/force-reset/{employeeId}` en el backend (`JornadaController@forceResetShift`) que finaliza el turno abierto y remueve la asignación en la base de datos.
   - Renderizado seguro en frontend (`LogisticsAdmin.tsx`) de un botón de emergencia ("Forzar Cierre de Turno") visible únicamente ante el rol `Superadmin` sobre tarjetas de conductores activos.

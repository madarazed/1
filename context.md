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

---

## 3. FLUJO DE USUARIOS, ROLES Y AUTENTICACIÓN

* **Cliente / Público General**: Navegación libre por el `Landing.tsx` y el catálogo unificado (incluyendo productos VIP con estética premium). El proceso de compra culmina enviando un payload de texto estructurado directamente al WhatsApp de la sede seleccionada.
* **Superadmin / Admin Sucursal**: Acceso total a `/admin`. Gestión de configuraciones globales, carga de inventario maestro y control del semáforo logístico.
* **Cajera**: Acceso restringido exclusivamente a un "Visor de Inventario" en tiempo real para consultar existencias por sede y mitigar cuellos de botella en la comunicación interna.
* **Repartidor / Conductor**: Acceso a `/repartidor/checkin`. Deben diligenciar obligatoriamente el Checklist Pre-operacional. Sin estado "Bueno", el sistema bloquea su operación diaria.

---

## 4. MÓDULO DE INVENTARIO (SISTEMA DE CARGA BATCH)

* **Sincronización de Baja Fricción**: Nexus actualiza su stock a través de una importación manual de archivos CSV extraídos de Syscafe.
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

### 5.5. Catálogo Maestro, Buscador y Portal VIP
- **Buscador Unificado**: Filtro en tiempo real por nombre, descripción y marca simultáneamente en catálogo público y portal VIP.
- **Portal VIP y Segmentación**: Despliegue de vistas segregadas. Las ofertas exclusivas solo existen en `/vip-portal` con diseño Dark Slate + Ámbar. La navegación pública se oculta desde el portal VIP.
- **Redirección Inteligente por Rol**: Los usuarios logueados son enrutados a `/admin`, `/repartidor/checkin` o `/vip-portal` automáticamente.

### 5.6. Landing Page Pública y Contacto
- **OnboardingModal (Modal de Bienvenida)**: Renderizado en `document.body` mediante **React Portal**. Infografía GIF escalable y animada.
- **Sección Hero**: Carruseles VIP de ofertas y animación de categorías.
- **Sección Contáctanos**: Tarjetas de sede con Google Maps dinámicos y padding espacioso anti-colisiones.

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

### 6.4. Estructura de Datos (Categorías Base)
1. Aguas | 2. Cervezas | 3. Energizantes | 4. Gaseosas | 5. Hidratantes | 6. Jugos | 7. Licores | 8. Sodas

---

## 7. INTERFAZ, DISEÑO Y ANIMACIONES (ANTIGRAVITY RULESET)

* **Identidad Visual**: "Navy Blue" corporativo y acentos Ámbar/Dorados (Dark Slate) para la segmentación de productos exclusivos. Interfaces admin oscuras (`#0F172A`) priorizando indicadores CTA.
* **Jerarquía Z-Index Canónica**: 
  * Modal de Bienvenida en `z-[9999]` a `z-[10001]` (vía React Portals directamente en `document.body`).
  * Navbar y flotantes en `z-30`.
  * Burbujas magnéticas del fondo en `z-20` (estrictamente con `pointer-events-none` `mix-blend-screen`).
  * Contenido general (`<main>`) en `z-1`.
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
1. **Resolución Inteligente**: `getImageUrl` añade cache-busting dinámico y discrimina entre assets locales y del servidor.
2. **Recuperación Activa**: Si una imagen falla, `handleImageError` intenta cambiar su extensión (ej: a `.png`), luego busca un "Local Guess" basado en el nombre, y finalmente aplica el `placeholder.jpg` corporativo.

---

## 10. HISTORIAL DE CAMBIOS Y MANTENIMIENTO

### 10.1. Historial Reciente (Mayo 2026)
| Commit | Descripción |
|---|---|
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

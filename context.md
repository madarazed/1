# Contexto del Proyecto: RAPIFRIOS NEXUS (Versión 2.0 Definitiva - Arquitectura Nexus)

## 1. VISIÓN GLOBAL Y PROPÓSITO

* **El Ecosistema**: Rapifrios Nexus (v3.3) es una plataforma web híbrida diseñada para acelerar las ventas y optimizar la logística, actuando como un puente tecnológico sobre el sistema ERP existente.
* **Frontera de Responsabilidades**: El software de escritorio Syscafe es la única fuente de la verdad inmutable para facturación fiscal, nómina y contabilidad. Nexus no procesa pagos en línea ni genera facturas legales.
* **Vitrina Comercial (Pública)**: Un catálogo de alta velocidad orientado a la conversión directa sin fricción (Cero Login para clientes).
* **Torre de Control (Privada)**: Dashboard de gestión logística, auditoría de flota vehicular y visor de stock multisede.

---

## 2. ARQUITECTURA Y STACK TECNOLÓGICO

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, SWR. Despliegue en Vercel.
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

## 5. INTERFAZ, DISEÑO Y ANIMACIONES (ANTIGRAVITY RULESET)

* **Identidad Visual**: "Navy Blue" corporativo y acentos Ámbar/Dorados (Dark Slate) para la segmentación de productos exclusivos.
* **Jerarquía Z-Index Canónica**: 
  * Modal de Bienvenida en `z-[9999]` a `z-[10001]` (vía React Portals).
  * Navbar y flotantes en `z-30`.
  * Burbujas magnéticas del fondo en `z-20` (estrictamente con `pointer-events-none`).
* **Reglas de Animación**: Uso de Framer Motion para Scroll Reveal y Tailwind para Shimmer de carga. Prohibido animar propiedades que fuercen re-flows del DOM (ej. `width`, `margin`).
* **Cero Hardcodeo**: Toda variable operativa, teléfono, red social o sede debe consumirse dinámicamente desde la base de datos vía caché.

---

## 6. MAPA DE RUTA Y REFACTORIZACIONES PENDIENTES

* **Checkout de WhatsApp**: Modificar `ShoppingDrawer.tsx` para generar la URL dinámica hacia la API de WhatsApp en lugar de hacer un POST al backend.
* **Poda de Código Muerto**: Eliminar vistas, guards de autenticación de clientes y módulos de nómina que han sido absorbidos por Syscafe.
* **Importador CSV**: Construir la lógica en Laravel y la interfaz en React para la actualización masiva de inventario.
* **Sedes Dinámicas**: Conectar la configuración de sedes a la tabla sucursales de la base de datos, eliminando la constante local.

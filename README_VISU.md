# PROYECTO: VISUALIZACIÓN INTERACTIVA DE DATOS DE LOOKIERO

Este proyecto implementa una interfaz web interactiva para explorar datos relacionados con los usuarios y el inventario de productos de Lookiero. Incluye gráficos dinámicos que proporcionan información detallada sobre el comportamiento de los clientes y el stock de productos. A continuación, se describe la funcionalidad básica de los archivos incluidos en el proyecto.

---

## **ESTRUCTURA DEL PROYECTO**
### **Archivos principales**:
1. **`web_reto.html`**
   - Archivo principal de la página web.
   - Contiene la estructura HTML con tres secciones principales para gráficos interactivos:
     - **Gráfico 1:** Tiempo de sesión por usuario.
     - **Gráfico 2:** Información sobre productos.
     - **Gráfico 3:** Stock de productos por talla.
   - Botones para navegación entre las diferentes páginas de gráficos.

2. **`web_reto.css`**
   - Hoja de estilos del proyecto.
   - Define el diseño visual, animaciones y estilos responsivos para adaptarse a diferentes tamaños de pantalla.
   - Estilo para:
     - Gráficos.
     - Encabezados, botones, cuerpo, texto, tooltips...
     - Diseño de páginas según el dispositivo.

3. **`web_reto.js`**
   - Controla la navegación entre las páginas de gráficos.
   - Función principal: `showPage(pageId)`, que:
     - Oculta las secciones no relevantes.
     - Muestra la página seleccionada.
     - Carga dinámicamente los gráficos correspondientes (`grafico1.js`, `grafico2.js`, `grafico3.js`).

---

## **GRÁFICOS Y SCRIPTS ESPECÍFICOS**

### **`grafico1.js`**
- **Propósito:** Representar el tiempo de sesión, último evento y cantidad total de eventos por usuario.
- **Datos:** 
  - Cargados desde un archivo CSV externo: 
    - URL: [`clientes_visu.csv`](https://raw.githubusercontent.com/xaabizulu/datos_visualizacion_reto10/refs/heads/main/clientes_visu.csv).
  - Columnas requeridas:
    - `user_id`: Identificación única de usuario.
    - `event_timestamp`: Marca temporal de eventos.
    - `event_name`: Nombre del evento.
- **Gráfico:** Burbuja dinámica con las siguientes características:
  - Tamaño de la burbuja proporcional a la cantidad de eventos del usuario.
  - Interactividad:
    - Zoom y desplazamiento.
    - Tooltips que muestran detalles sobre el usuario.
- **Elementos clave:**
  - Selector de usuario para filtrar datos individuales y actualizar el gráfico dinámicamente.

---
### **`grafico2.js`**
- **Propósito:** Mostrar la distribución de precios de productos vendidos según el tipo de producto. Pensado para implementación de Lookiero con sus datos de ventas (no disponibles para nosotros)
- **Datos:** 
  - Datos generados de cara a simular datos de ventas, hecho para que Lookiero se haga una idea de como visualizar dicha información.
- **Gráfico:** Scatter y barras. Seleccionable mediante botones.
  - Interactividad:
    - Grafico 1: Tooltip con información
    - Gráfico 2: Tooltip + info en pantalla con click.
    - Botones de navegación.

---
### **`grafico3.js`**
- **Propósito:** Mostrar el stock total por talla y tipo de prenda.
- **Datos:** 
  - Cargados desde un archivo CSV externo: 
    - URL: [`prendas.csv`](https://raw.githubusercontent.com/xaabizulu/datos_visualizacion_reto10/refs/heads/main/prendas.csv).
  - Columnas requeridas:
    - `Prenda`: Nombre del tipo de prenda.
    - `Talla`: Talla de la prenda.
- **Gráfico:** Barras circulares apiladas.
  - Cada tipo de prenda tiene un conjunto de barras que representan el stock por talla.
  - Interactividad:
    - Tooltips que muestran la cantidad de stock para cada prenda y talla.
    - Rotación del gráfico para centrar elementos seleccionados.

---

## **CÓMO EJECUTAR EL PROYECTO**
1. **Abrir el archivo `web_reto.html`** en cualquier navegador moderno.
2. **Navegación:**
   - Desde el menú principal, selecciona la página que deseas explorar:
     - **Información sobre Usuarios (Gráfico 1):** Tiempo de sesión y actividad.
     - **Información sobre productos (Gráfico 2):** Comparativa de precios y tipos.
     - **Stock Productos (Gráfico 3):** Inventario por tallas.
3. **Exploración Interactiva:**
   - Pasa el ratón sobre los gráficos para ver detalles adicionales.
   - Filtra los datos utilizando los controles disponibles.

---

## **REQUISITOS DEL SISTEMA**
- Navegador con soporte para:
  - **JavaScript ES6+**
  - **D3.js v7**
- Conexión a internet para cargar los datos externos desde GitHub.

---


# Proyecto: **24_25_3_R10_Verde_Oscuro**

Este proyecto organiza y analiza datos relacionados con looks, productos, combinaciones de colores y experiencia de usuario. A continuación, se detalla la estructura del proyecto:

---

## **Estructura de Carpetas y Archivos**

### **1. Datos**  
#### **Subcarpeta: `Datos look&like`**  
Contiene:  
- `customers_data.csv`: Información de los clientes.  
- `items_data.csv`: Detalles de los ítems.  
- `look_and_like.csv`: Relación entre clientes y sus looks preferidos.  

#### **Subcarpeta: `Datos looks`**  
Contiene 11 archivos:  
- `brand.csv`: Marcas asociadas a los productos.  
- `color.csv`: Información sobre colores.  
- `feature.csv`: Características de los productos.  
- `feature_value.csv`: Valores asociados a características.  
- `feature_value_family.csv`: Agrupación de valores de características.  
- `product.csv`: Detalles de los productos.  
- `product_feature_value.csv`: Relación entre productos y características.  
- `product_feature_value_qualifier.csv`: Detalles cualitativos de los valores de características.  
- `product_variant.csv`: Variantes de productos.  
- `season.csv`: Temporadas de los productos.  
- `size.csv`: Información sobre tallas.  

#### **Subcarpeta: `Datos UX`**  
Contiene:  
- `page_views.csv`: Datos de visualización de páginas por los usuarios.  

#### **Subcarpeta: `transformados`**  
Contiene:  
- `df_resultado.csv`: Archivo generado tras el preprocesamiento.

---

### **2. Gráficos**  
- Contiene gráficos generados durante el preprocesamiento, análisis y creación del grafo.  
- **Importante**: Consultar el archivo `README_VISU.md` para detalles sobre el proyecto de visualización web con la librería `d3.js`.

---

### **3. Notebooks**  
En orden de ejecución:  
1. **`01_Preprocesamiento.ipynb`**  
   - Carga los datos desde `Datos looks`.  
   - Une, preprocesa y guarda los datos transformados en `Datos/transformados`.  

2. **`02_Grafo_Colabs.ipynb`**  
   - Jupyter notebook trabajado en Google Colab para optimizar recursos.  
   - Entrada:  
     - `df_resultado.csv` (desde Google Drive).  
     - `combinaciones_colores.csv` (combinaciones generadas desde una aplicación Flask).  

3. **`03_GNN_Grafos.ipynb`**
   - Jupyter notebook trabajado en Google Colab para optimizar recursos.
   - Entrada:
      - `grafo.pkl` (desde Google Drive).

5. **`04_WEB_UX.ipynb`**
   - Carga los datos desde `page_views.csv`.

---

### **4. Proyecto de Visualización Web**  
Incluye:  
- Archivos de visualización con `d3.js`:  
  - `grafico1.js`, `grafico2.js`, `grafico3.js`.  
- Archivos de la interfaz web:  
  - `web_reto.js`, `web_reto.css`, `web_reto.html`.  
  - Imagen: `Lookiero-logo.png`.  

---

### **5. Aplicación Flask**  
Incluye:  
- Archivos de la aplicación:  
  - `app_primera.py`  
  - `app_segunda.py`  
- Archivos relacionados con respuestas de combinaciones según equipo:  
  - `color_combinations_responses_user_1_2.csv`  
  - `color_combinations_responses_user_3_4.csv`
  - `combinaciones_colores.csv` : merge de dos archivos anteriores

---

### **6. Flujo de Kafka**
Incluye:
- Productor (`producer.py`):
    - Envía datos de características de prendas a Kafka.
    - Requiere el archivo CSV:
        - `caracteristicas_nodos_bg.csv`.
- Consumidor (`consumer.py`):
    - Recibe y procesa los datos desde Kafka.
    - Requiere los archivos:
        - `caracteristicas_nodos_bg.csv`.
        - `grafo.pkl`.
- Antes de ejecutarlos requiere inicializar Kafka y Zookeper.

---

**Nota:** Para más detalles sobre los pasos y herramientas utilizadas, consultar la documentación asociada en cada carpeta.


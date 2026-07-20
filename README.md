# 🍫 Don Alfajor - Brand Hub & Pack Multimedia

¡Bienvenido al centro de diseño de **Don Alfajor**! Este proyecto contiene todo lo necesario para digitalizar tu negocio, promocionar tus sabores artesanales en redes sociales de manera limpia y elegante, e imprimir afiches y etiquetas para envolturas sin saturar la información.

El proyecto incluye dos grandes soluciones:
1. **Aplicación Web Interactiva**: Un centro de mandos para gestionar tus pedidos, generar posts a medida y mandar a imprimir tus afiches físicos.
2. **Pack de Archivos Listos para Usar**: Una colección de imágenes PNG de alta resolución para Instagram (1:1 y 9:16) y PDFs para impresión (menú completo, menú por categorías, afiches y etiquetas circulares).

---

## 📂 Contenido del Proyecto y Carpetas

Una vez que se complete la generación de archivos, encontrarás los recursos organizados de la siguiente forma en tu carpeta local:

* 📄 **`dist/assets/ready_to_use/`**: Carpeta principal con todos los archivos multimedia listos para publicar o imprimir.
  * 📸 **`instagram_posts/`**: 11 imágenes cuadradas (1:1) individuales de cada sabor con su respectivo emoji, eslogan, descripción, precio y WhatsApp. Listas para publicar en feed.
  * 📸 **`instagram_stories/`**: 11 imágenes verticales (9:16) individuales optimizadas para historias de Instagram o Facebook.
  * 🖨️ **`print/`**: Documentos en formato PDF (tamaño A4) listos para mandar a imprimir o guardar:
    * `menu_completo_a4.pdf`: Menú completo ordenado con las 3 líneas de sabores, limpio y bien espaciado.
    * `afiche_promocional_a4.pdf`: Afiche llamativo para vitrinas que destaca que todos los sabores cuestan **$1.000**.
    * `planilla_etiquetas_a4.pdf`: Hoja con 16 círculos del logo de Don Alfajor y WhatsApp, ideal para imprimir en papel adhesivo y pegar en los alfajores.
    * `afiche_linea_clasicos_y_dulces_a4.pdf`: Menú exclusivo para los sabores clásicos.
    * `afiche_linea_frutales_y_exoticos_a4.pdf`: Menú exclusivo para los sabores frutales.
    * `afiche_linea_linea_gourmet_a4.pdf`: Menú exclusivo para la línea Gourmet (Vino, Whisky, Chai).

---

## 🚀 Cómo Ejecutar la Aplicación Web Interactiva

Para iniciar la aplicación local en tu computador y poder utilizar las herramientas en tiempo real:

1. **Instalar dependencias** (ya realizado por el asistente):
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en tu navegador**:
   El terminal te mostrará una dirección local, generalmente: `http://localhost:5173`. Haz clic en ella o cópiala en tu navegador de preferencia.

---

## 🎨 Funciones del Brand Hub Web

En la aplicación encontrarás un menú lateral interactivo con las siguientes herramientas:

### 1. 📱 Menú Digital (Catálogo con Carrito y WhatsApp)
* **Para ti y tus clientes**: Es una interfaz responsiva, móvil-first. Tus clientes pueden filtrar sabores por categoría (Clásicos, Frutales, Gourmet) o buscar por texto.
* **Carro de Compras**: Pueden seleccionar cantidades de cada alfajor (por ejemplo, *2x Manjar-blanco, 1x Vino Tinto*).
* **Pedido Directo**: Al pulsar el botón "Enviar Pedido por WhatsApp", la app redacta automáticamente un mensaje estructurado con el desglose del pedido y el total a pagar, y abre una ventana de chat directo a tu número (+56 9 7979 7420).

### 2. 📸 Creador de Publicaciones (Generador de Imágenes PNG)
* **Personalización**: Selecciona cualquiera de tus 11 sabores en el menú desplegable.
* **Formato**: Alterna entre Post Cuadrado (1:1) o Historia Vertical (9:16).
* **Temas de Colores**: Elige entre combinaciones de colores inspiradas en los sabores (Crema, Cacao, Terracota, Frutos Rojos, Maracuyá, Menta).
* **Edición de Texto**: Puedes modificar el título del sabor, escribir un eslogan personalizado y cambiar la descripción en tiempo real.
* **Exportación**: Haz clic en el botón "Descargar Imagen PNG" para guardar la tarjeta en alta definición (escala 3x para textos ultra nítidos) en tu carpeta de descargas de forma inmediata.

### 3. 🖨️ Afiches A4 (Impresión y PDF)
* Elige entre el Menú Completo, las 3 Hojas Separadas por categoría o el Afiche Promocional de $1.000.
* Haz clic en el botón **"Imprimir / Guardar PDF"**.
* La app tiene reglas de impresión CSS inteligentes (`@media print`): al presionar el botón o presionar `Ctrl + P`, **se ocultarán automáticamente todos los menús web de la app** y solo se imprimirá la hoja del afiche de forma limpia en tu impresora o guardará como un archivo PDF.

### 🏷️ 4. Stickers Wrapper (Hoja de Etiquetas)
* Grilla con 16 círculos del logo de Don Alfajor y WhatsApp, lista para ser impresa en hojas autoadhesivas tamaño Carta o A4 y recortarse para sellar los envoltorios de tus alfajores artesanalmente.

---

## 🛠️ Cómo Actualizar o Agregar Nuevos Sabores
Si en el futuro agregas un nuevo sabor, cambias los ingredientes o actualizas el precio, solo debes editar el archivo:
👉 [flavors.js](src/data/flavors.js)

Toda la aplicación web (catálogo, generador de posts, afiches imprimibles y links de WhatsApp) se actualizará automáticamente con la nueva información.

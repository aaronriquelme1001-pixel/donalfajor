/**
 * Helper to resolve image URLs reliably in Vite / GitHub Pages / local environments.
 */
export function getImageUrl(src) {
  if (!src) return '';
  if (
    src.startsWith('data:') ||
    src.startsWith('http://') ||
    src.startsWith('https://')
  ) {
    return src;
  }
  // Strip any leading slash, ./, or docs/
  const clean = src.replace(/^(\/?docs\/|\.\/|\/)+/, '');
  const base = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
  return base ? `${base}/${clean}` : `/${clean}`;
}

/**
 * Compresses an uploaded image File to optimized dimensions and quality
 * so it fits reliably in localStorage without hitting quota limits.
 * - maxWidth/maxHeight: 600x600 px (smaller = less KB in base64)
 * - quality: 0.70 (JPEG, good balance of quality vs size)
 * Returns a base64 data URL string.
 */
export function compressImage(file, maxWidth = 600, maxHeight = 600, quality = 0.70) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Archivo no válido'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Error al leer el archivo'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Error al cargar la imagen'));

      img.onload = () => {
        let { width, height } = img;

        // Resize keeping aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Saves a value to localStorage safely, catching QuotaExceededError.
 * Returns true if saved successfully, false if there was a storage error.
 */
export function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.warn('[donalfajor] localStorage lleno. Intentando liberar espacio...');
      // Remove old EImg entries to free space
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('donalfajor_eimg_')) {
          toRemove.push(k);
        }
      }
      toRemove.forEach(k => localStorage.removeItem(k));
      // Try again after cleanup
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        console.error('[donalfajor] No se pudo guardar en localStorage incluso después de limpiar.');
        return false;
      }
    }
    console.error('[donalfajor] Error al guardar en localStorage:', err);
    return false;
  }
}

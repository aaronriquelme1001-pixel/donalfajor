import { useState, useEffect } from 'react';
import { flavors as defaultFlavors, categories as defaultCategories } from '../data/flavors';
import { safeLocalStorageSet } from '../utils/imageUrl';

const STORAGE_KEY_FLAVORS = 'donalfajor_flavors';
const STORAGE_KEY_CATEGORIES = 'donalfajor_categories';

// Sanitize flavors loaded from localStorage (fix old paths / old names)
function sanitizeFlavors(flavorList) {
  if (!Array.isArray(flavorList)) return defaultFlavors;
  return flavorList.map(f => {
    let image = f.image || '';
    if (image.includes('docs/assets/')) {
      image = image.replace('docs/assets/', 'assets/');
    }
    let name = f.name;
    if (name === 'Manjar-blanco') name = 'Dulce de Leche Blanco';
    if (name === 'Manjar-negro')  name = 'Dulce de Leche Negro';
    return { ...f, name, image };
  });
}

export function useFlavors() {
  const [flavors, setFlavors]       = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading]       = useState(true);

  // ── Initial load ──────────────────────────────────────────────────────
  useEffect(() => {
    const savedFlavors     = localStorage.getItem(STORAGE_KEY_FLAVORS);
    const savedCategories  = localStorage.getItem(STORAGE_KEY_CATEGORIES);

    if (savedFlavors) {
      try {
        const parsed    = JSON.parse(savedFlavors);
        const sanitized = sanitizeFlavors(parsed);
        setFlavors(sanitized);
        safeLocalStorageSet(STORAGE_KEY_FLAVORS, JSON.stringify(sanitized));
      } catch {
        setFlavors(defaultFlavors);
        safeLocalStorageSet(STORAGE_KEY_FLAVORS, JSON.stringify(defaultFlavors));
      }
    } else {
      setFlavors(defaultFlavors);
      safeLocalStorageSet(STORAGE_KEY_FLAVORS, JSON.stringify(defaultFlavors));
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch {
        setCategories(defaultCategories);
        safeLocalStorageSet(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategories));
      }
    } else {
      setCategories(defaultCategories);
      safeLocalStorageSet(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategories));
    }

    setLoading(false);
  }, []);

  // ── Flavor CRUD ───────────────────────────────────────────────────────
  const addFlavor = (flavor) => {
    const newFlavor = { ...flavor, id: flavor.id || `flavor-${Date.now()}` };
    const updated   = [...flavors, newFlavor];
    setFlavors(updated);
    const ok = safeLocalStorageSet(STORAGE_KEY_FLAVORS, JSON.stringify(updated));
    if (!ok) {
      alert('⚠️ No se pudo guardar la foto: el almacenamiento local está lleno. Intenta usar una imagen más pequeña.');
    }
    return newFlavor;
  };

  const updateFlavor = (id, updatedFlavor) => {
    const updated = flavors.map(f => f.id === id ? { ...f, ...updatedFlavor } : f);
    setFlavors(updated);
    const ok = safeLocalStorageSet(STORAGE_KEY_FLAVORS, JSON.stringify(updated));
    if (!ok) {
      alert('⚠️ No se pudo guardar la foto: el almacenamiento local está lleno. Intenta usar una imagen más pequeña.');
    }
  };

  const deleteFlavor = (id) => {
    const updated = flavors.filter(f => f.id !== id);
    setFlavors(updated);
    safeLocalStorageSet(STORAGE_KEY_FLAVORS, JSON.stringify(updated));
  };

  // ── Category CRUD ─────────────────────────────────────────────────────
  const addCategory = (category) => {
    const newCategory = { ...category, id: category.id || `cat-${Date.now()}` };
    const updated     = [...categories, newCategory];
    setCategories(updated);
    safeLocalStorageSet(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    return newCategory;
  };

  const updateCategory = (id, updatedCategory) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updatedCategory } : c);
    setCategories(updated);
    safeLocalStorageSet(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
  };

  const deleteCategory = (id) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    safeLocalStorageSet(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    setFlavors(defaultFlavors);
    setCategories(defaultCategories);
    safeLocalStorageSet(STORAGE_KEY_FLAVORS,     JSON.stringify(defaultFlavors));
    safeLocalStorageSet(STORAGE_KEY_CATEGORIES,  JSON.stringify(defaultCategories));
  };

  return {
    flavors,
    categories,
    loading,
    addFlavor,
    updateFlavor,
    deleteFlavor,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,
  };
}

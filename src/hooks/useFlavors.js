import { useState, useEffect } from 'react';
import { flavors as defaultFlavors, categories as defaultCategories } from '../data/flavors';

const STORAGE_KEY_FLAVORS = 'donalfajor_flavors';
const STORAGE_KEY_CATEGORIES = 'donalfajor_categories';

// Helper to sanitize any image paths stored in localStorage from older sessions
function sanitizeFlavors(flavorList) {
  if (!Array.isArray(flavorList)) return defaultFlavors;
  return flavorList.map(f => {
    let image = f.image || '';
    if (image.includes('docs/assets/')) {
      image = image.replace('docs/assets/', 'assets/');
    }
    // Update old default names if stored in localStorage
    let name = f.name;
    if (name === 'Manjar-blanco') name = 'Dulce de Leche Blanco';
    if (name === 'Manjar-negro') name = 'Dulce de Leche Negro';

    return {
      ...f,
      name,
      image
    };
  });
}

export function useFlavors() {
  const [flavors, setFlavors] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedFlavors = localStorage.getItem(STORAGE_KEY_FLAVORS);
    const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    
    if (savedFlavors) {
      try {
        const parsed = JSON.parse(savedFlavors);
        const sanitized = sanitizeFlavors(parsed);
        setFlavors(sanitized);
        localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(sanitized));
      } catch (err) {
        setFlavors(defaultFlavors);
        localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(defaultFlavors));
      }
    } else {
      setFlavors(defaultFlavors);
      localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(defaultFlavors));
    }
    
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (err) {
        setCategories(defaultCategories);
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategories));
      }
    } else {
      setCategories(defaultCategories);
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategories));
    }
    
    setLoading(false);
  }, []);

  const addFlavor = (flavor) => {
    const newFlavor = { ...flavor, id: flavor.id || `flavor-${Date.now()}` };
    const updated = [...flavors, newFlavor];
    setFlavors(updated);
    localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(updated));
    return newFlavor;
  };

  const updateFlavor = (id, updatedFlavor) => {
    const updated = flavors.map(f => f.id === id ? { ...f, ...updatedFlavor } : f);
    setFlavors(updated);
    localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(updated));
  };

  const deleteFlavor = (id) => {
    const updated = flavors.filter(f => f.id !== id);
    setFlavors(updated);
    localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(updated));
  };

  const addCategory = (category) => {
    const newCategory = { ...category, id: category.id || `cat-${Date.now()}` };
    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    return newCategory;
  };

  const updateCategory = (id, updatedCategory) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updatedCategory } : c);
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
  };

  const deleteCategory = (id) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    setFlavors(defaultFlavors);
    setCategories(defaultCategories);
    localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(defaultFlavors));
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategories));
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
    resetToDefaults
  };
}

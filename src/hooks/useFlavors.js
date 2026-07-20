import { useState, useEffect } from 'react';
import { flavors as defaultFlavors, categories as defaultCategories } from '../data/flavors';

const STORAGE_KEY_FLAVORS = 'donalfajor_flavors';
const STORAGE_KEY_CATEGORIES = 'donalfavor_categories';

export function useFlavors() {
  const [flavors, setFlavors] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedFlavors = localStorage.getItem(STORAGE_KEY_FLAVORS);
    const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    
    if (savedFlavors) {
      setFlavors(JSON.parse(savedFlavors));
    } else {
      setFlavors(defaultFlavors);
      localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(defaultFlavors));
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(defaultCategories);
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategories));
    }
    
    setLoading(false);
  }, []);

  const addFlavor = (flavor) => {
    const newFlavor = { ...flavor, id: flavor.id || `flavor-${Date.now()}` };
    setFlavors([...flavors, newFlavor]);
    localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify([...flavors, newFlavor]));
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
    setCategories([...categories, newCategory]);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([...categories, newCategory]));
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

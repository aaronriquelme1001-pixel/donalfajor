import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { categories as defaultCategories } from '../data/flavors';

const STORAGE_KEY_FLAVORS = 'donalfajor_flavors';
const STORAGE_KEY_CATEGORIES = 'donalfavor_categories';

export default function FlavorAdmin() {
  const [flavors, setFlavors] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'classics',
    description: '',
    price: 1000,
    filling: '',
    coating: '',
    dough: '',
    emoji: '🍫',
    image: '',
    themeColor: '#FDFBF7',
    textColor: '#5D4037',
    tagline: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFlavors = localStorage.getItem(STORAGE_KEY_FLAVORS);
    const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    
    if (savedFlavors) {
      setFlavors(JSON.parse(savedFlavors));
    } else {
      // Load default flavors from flavors.js
      import('../data/flavors').then(({ flavors: defaultFlavors }) => {
        setFlavors(defaultFlavors);
        localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(defaultFlavors));
      });
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save to localStorage whenever flavors change
  useEffect(() => {
    if (flavors.length > 0) {
      localStorage.setItem(STORAGE_KEY_FLAVORS, JSON.stringify(flavors));
    }
  }, [flavors]);

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingFlavor) {
      // Update existing flavor
      setFlavors(flavors.map(f => f.id === editingFlavor.id ? { ...formData } : f));
    } else {
      // Create new flavor
      const newFlavor = {
        ...formData,
        id: formData.id || `flavor-${Date.now()}`
      };
      setFlavors([...flavors, newFlavor]);
    }
    
    resetForm();
  };

  const handleEdit = (flavor) => {
    setEditingFlavor(flavor);
    setFormData(flavor);
    setPreviewImage(flavor.image);
    setIsEditing(true);
  };

  const handleDelete = (flavorId) => {
    if (confirm('¿Estás seguro de eliminar este sabor?')) {
      setFlavors(flavors.filter(f => f.id !== flavorId));
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      category: 'classics',
      description: '',
      price: 1000,
      filling: '',
      coating: '',
      dough: '',
      emoji: '🍫',
      image: '',
      themeColor: '#FDFBF7',
      textColor: '#5D4037',
      tagline: ''
    });
    setPreviewImage(null);
    setEditingFlavor(null);
    setIsEditing(false);
  };

  const addCategory = () => {
    const name = prompt('Nombre de la nueva categoría:');
    if (name) {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name,
        description: 'Nueva categoría'
      };
      setCategories([...categories, newCategory]);
    }
  };

  return (
    <div className="admin-container">
      <motion.div 
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="admin-title">Gestión de Sabores</h1>
        <motion.button
          className="btn-primary"
          onClick={() => setIsEditing(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} style={{ marginRight: '0.5rem' }} />
          Nuevo Sabor
        </motion.button>
      </motion.div>

      {/* Categories Section */}
      <motion.div 
        className="categories-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="section-title">Categorías</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-card">
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
              <span className="category-count">
                {flavors.filter(f => f.category === cat.id).length} sabores
              </span>
            </div>
          ))}
          <motion.button
            className="category-card add-category"
            onClick={addCategory}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={32} />
            <span>Agregar Categoría</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Flavors List */}
      <motion.div 
        className="flavors-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="section-title">Sabores ({flavors.length})</h2>
        <div className="flavors-grid-admin">
          {flavors.map(flavor => (
            <motion.div
              key={flavor.id}
              className="flavor-item-admin"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flavor-image-preview">
                {flavor.image ? (
                  <img src={flavor.image} alt={flavor.name} />
                ) : (
                  <ImageIcon size={48} className="no-image" />
                )}
                <span className="flavor-emoji">{flavor.emoji}</span>
              </div>
              <div className="flavor-info">
                <h3>{flavor.name}</h3>
                <span className="flavor-category">
                  {categories.find(c => c.id === flavor.category)?.name}
                </span>
                <span className="flavor-price">${flavor.price.toLocaleString('es-CL')}</span>
              </div>
              <div className="flavor-actions">
                <motion.button
                  className="btn-edit"
                  onClick={() => handleEdit(flavor)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit size={18} />
                </motion.button>
                <motion.button
                  className="btn-delete"
                  onClick={() => handleDelete(flavor.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => resetForm()}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingFlavor ? 'Editar Sabor' : 'Nuevo Sabor'}</h2>
                <motion.button
                  className="btn-close"
                  onClick={resetForm}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="flavor-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre del Sabor</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Precio</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Emoji</label>
                    <input
                      type="text"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      maxLength={2}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Relleno</label>
                    <input
                      type="text"
                      value={formData.filling}
                      onChange={(e) => setFormData({ ...formData, filling: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cobertura</label>
                    <input
                      type="text"
                      value={formData.coating}
                      onChange={(e) => setFormData({ ...formData, coating: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Masa</label>
                    <input
                      type="text"
                      value={formData.dough}
                      onChange={(e) => setFormData({ ...formData, dough: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Eslogan</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Color de Tema</label>
                    <input
                      type="color"
                      value={formData.themeColor}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Color de Texto</label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Imagen</label>
                    <div className="image-upload-area">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="image-input"
                      />
                      <label htmlFor="image-upload" className="image-upload-label">
                        <Upload size={32} />
                        <span>Subir Imagen</span>
                      </label>
                      {previewImage && (
                        <div className="image-preview">
                          <img src={previewImage} alt="Preview" />
                          <motion.button
                            type="button"
                            className="remove-image"
                            onClick={() => {
                              setPreviewImage(null);
                              setFormData({ ...formData, image: '' });
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X size={16} />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save size={18} style={{ marginRight: '0.5rem' }} />
                    {editingFlavor ? 'Guardar Cambios' : 'Crear Sabor'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

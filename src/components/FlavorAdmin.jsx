import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, X, Save, Image as ImageIcon, Download, RotateCcw, FolderPlus } from 'lucide-react';
import { useFlavors } from '../hooks/useFlavors';
import { getImageUrl } from '../utils/imageUrl';

export default function FlavorAdmin() {
  const { flavors, categories, addFlavor, updateFlavor, deleteFlavor, addCategory, updateCategory, deleteCategory, resetToDefaults } = useFlavors();
  const [isEditingFlavor, setIsEditingFlavor] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Category Modal state
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ id: '', name: '', description: '' });

  const initialFlavorFormState = {
    id: '',
    name: '',
    category: categories[0]?.id || 'classics',
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
  };

  const [formData, setFormData] = useState(initialFlavorFormState);

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

  const handleFlavorSubmit = (e) => {
    e.preventDefault();
    if (editingFlavor) {
      updateFlavor(editingFlavor.id, formData);
    } else {
      addFlavor(formData);
    }
    resetFlavorForm();
  };

  const handleEditFlavor = (flavor) => {
    setEditingFlavor(flavor);
    setFormData(flavor);
    setPreviewImage(flavor.image);
    setIsEditingFlavor(true);
  };

  const handleDeleteFlavor = (flavorId) => {
    if (window.confirm('¿Estás seguro de eliminar este sabor?')) {
      deleteFlavor(flavorId);
    }
  };

  const resetFlavorForm = () => {
    setFormData(initialFlavorFormState);
    setEditingFlavor(null);
    setPreviewImage(null);
    setIsEditingFlavor(false);
  };

  // Category handlers
  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setCategoryFormData({ id: '', name: '', description: '' });
    setIsEditingCategory(true);
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({ id: cat.id, name: cat.name, description: cat.description || '' });
    setIsEditingCategory(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryFormData);
    } else {
      const newCatId = categoryFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
      addCategory({ ...categoryFormData, id: newCatId });
    }
    setIsEditingCategory(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId) => {
    const associatedFlavors = flavors.filter(f => f.category === catId);
    if (associatedFlavors.length > 0) {
      alert(`No se puede eliminar esta categoría porque contiene ${associatedFlavors.length} sabor(es). Por favor cámbialos de categoría primero.`);
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      deleteCategory(catId);
    }
  };

  const exportJSON = () => {
    const exportData = { categories, flavors };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "donalfajor_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flavor-admin-container admin-container">
      <motion.div 
        className="content-header admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <h1 className="content-title admin-title">Gestión de Sabores ⚙️</h1>
          <p className="content-description" style={{ margin: 0 }}>
            Administra categorías y sabores del menú. Todos los cambios quedan guardados automáticamente.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <motion.button
            className="btn-primary"
            onClick={() => { resetFlavorForm(); setIsEditingFlavor(true); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} style={{ marginRight: '0.4rem' }} />
            <span>Nuevo Sabor</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Tools */}
      <div className="admin-actions" style={{ display: 'flex', gap: '0.6rem', margin: '1rem 0' }}>
        <motion.button
          className="btn-secondary"
          onClick={exportJSON}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <Download size={16} />
          <span>Exportar Datos (JSON)</span>
        </motion.button>

        <motion.button
          className="btn-secondary"
          onClick={() => {
            if (window.confirm('¿Restablecer todas las categorías y sabores a los valores por defecto?')) {
              resetToDefaults();
            }
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#D32F2F', borderColor: '#D32F2F', fontSize: '0.85rem' }}
        >
          <RotateCcw size={16} />
          <span>Restablecer Todo</span>
        </motion.button>
      </div>

      {/* Categories Section */}
      <motion.div 
        className="categories-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="section-title" style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-brown)', marginBottom: '1rem' }}>
          Categorías
        </h2>
        <div className="categories-grid">
          {categories.map(cat => {
            const count = flavors.filter(f => f.category === cat.id).length;
            return (
              <div key={cat.id} className="category-card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--accent-brown)' }}>{cat.name}</h3>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button 
                      onClick={() => handleEditCategoryClick(cat)}
                      title="Editar categoría"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, padding: '2px' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      title="Eliminar categoría"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, padding: '2px', color: '#D32F2F' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>{cat.description}</p>
                <span className="category-count">
                  {count} {count === 1 ? 'sabor' : 'sabores'}
                </span>
              </div>
            );
          })}
          <motion.button
            className="category-card add-category"
            onClick={handleAddCategoryClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={32} />
            <span>Agregar Categoría</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Flavors Section */}
      <motion.div 
        className="flavors-section flavors-list-admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginTop: '2rem' }}
      >
        <h2 className="section-title" style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-brown)', marginBottom: '1rem' }}>
          Sabores ({flavors.length})
        </h2>
        <div className="admin-grid flavors-grid-admin">
          {flavors.map((flavor) => (
            <motion.div
              key={flavor.id}
              className="flavor-item-admin"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flavor-image-preview">
                {flavor.image ? (
                  <img src={getImageUrl(flavor.image)} alt={flavor.name} />
                ) : (
                  <ImageIcon size={48} className="no-image" />
                )}
                <span className="flavor-emoji">{flavor.emoji}</span>
              </div>
              <div className="flavor-info">
                <h3>{flavor.name}</h3>
                <span className="flavor-category">
                  {categories.find(c => c.id === flavor.category)?.name || flavor.category}
                </span>
                <span className="flavor-price">${flavor.price?.toLocaleString('es-CL')}</span>
              </div>
              <div className="flavor-actions">
                <motion.button
                  className="btn-edit"
                  onClick={() => handleEditFlavor(flavor)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit size={18} />
                </motion.button>
                <motion.button
                  className="btn-delete"
                  onClick={() => handleDeleteFlavor(flavor.id)}
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

      {/* Category Edit/Create Modal */}
      <AnimatePresence>
        {isEditingCategory && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditingCategory(false)}
          >
            <motion.div
              className="modal-content"
              style={{ maxWidth: '450px' }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                <motion.button
                  className="btn-close"
                  onClick={() => setIsEditingCategory(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              <form onSubmit={handleCategorySubmit} className="flavor-form">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Nombre de la Categoría</label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    placeholder="Ej: Edición Especial"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Descripción</label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    placeholder="Ej: Sabores únicos por temporada"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsEditingCategory(false)}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                  >
                    <Save size={18} style={{ marginRight: '0.4rem' }} />
                    {editingCategory ? 'Guardar' : 'Crear Categoría'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flavor Edit/Create Modal */}
      <AnimatePresence>
        {isEditingFlavor && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => resetFlavorForm()}
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
                  onClick={resetFlavorForm}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              <form onSubmit={handleFlavorSubmit} className="flavor-form">
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
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
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
                    <label>Eslogan / Tagline</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="Ej: Dulzura única en cada mordida"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Imagen del Producto</label>
                    <div className="image-upload-container" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        type="file"
                        id="flavor-image-input"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="flavor-image-input" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Upload size={18} />
                        <span>Subir Imagen</span>
                      </label>
                      <input
                        type="text"
                        placeholder="O ruta de imagen (ej: assets/flavors/mi-sabor.png)"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          setPreviewImage(e.target.value);
                        }}
                        style={{ flex: 1, minWidth: '200px' }}
                      />
                    </div>
                    {previewImage && (
                      <div className="image-preview-box" style={{ marginTop: '0.5rem', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-pencil)' }}>
                        <img src={getImageUrl(previewImage)} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    onClick={resetFlavorForm}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                  >
                    <Save size={18} style={{ marginRight: '0.4rem' }} />
                    <span>{editingFlavor ? 'Guardar Cambios' : 'Crear Sabor'}</span>
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

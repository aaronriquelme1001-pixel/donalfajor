import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, X, Save, Image as ImageIcon, Download, RotateCcw } from 'lucide-react';
import { useFlavors } from '../hooks/useFlavors';
import { getImageUrl } from '../utils/imageUrl';

export default function FlavorAdmin() {
  const { flavors, categories, addFlavor, updateFlavor, deleteFlavor, resetToDefaults } = useFlavors();
  const [isEditing, setIsEditing] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const initialFormState = {
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
  };

  const [formData, setFormData] = useState(initialFormState);

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
      updateFlavor(editingFlavor.id, formData);
    } else {
      addFlavor(formData);
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
    if (window.confirm('¿Estás seguro de eliminar este sabor?')) {
      deleteFlavor(flavorId);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingFlavor(null);
    setPreviewImage(null);
    setIsEditing(false);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flavors, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "donalfajor_flavors.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flavor-admin-container">
      <motion.div 
        className="content-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="content-title">Administración de Sabores ⚙️</h1>
        <p className="content-description">
          Añade, edita o elimina los sabores del menú. Todos los cambios se guardan de forma permanente en tu navegador y se reflejan automáticamente en el menú digital, creador de posts y afiches.
        </p>
      </motion.div>

      <div className="admin-actions">
        <motion.button
          className="btn-primary"
          onClick={() => { resetForm(); setIsEditing(true); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          <span>Añadir Nuevo Sabor</span>
        </motion.button>

        <motion.button
          className="btn-secondary"
          onClick={exportJSON}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Download size={18} />
          <span>Exportar Sabores (JSON)</span>
        </motion.button>

        <motion.button
          className="btn-secondary"
          onClick={() => {
            if (window.confirm('¿Restablecer los sabores a los valores por defecto del sistema?')) {
              resetToDefaults();
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#D32F2F', borderColor: '#D32F2F' }}
        >
          <RotateCcw size={18} />
          <span>Restablecer Todo</span>
        </motion.button>
      </div>

      <motion.div 
        className="flavors-list-admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2>Sabores Actuales ({flavors.length})</h2>
        <div className="admin-grid">
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
                    <div className="image-upload-container">
                      <input
                        type="file"
                        id="flavor-image-input"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="flavor-image-input" className="image-upload-button">
                        <Upload size={20} />
                        <span>Subir Imagen</span>
                      </label>
                      <input
                        type="text"
                        placeholder="O ingresa una ruta de imagen (ej: assets/flavors/mi-sabor.png)"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          setPreviewImage(e.target.value);
                        }}
                        className="image-path-input"
                      />
                    </div>
                    {previewImage && (
                      <div className="image-preview-box">
                        <img src={getImageUrl(previewImage)} alt="Vista previa" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save size={20} />
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

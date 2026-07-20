import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, X, Plus, Minus, Heart, Sparkles } from 'lucide-react';
import { useFlavors } from '../hooks/useFlavors';
import { getImageUrl } from '../utils/imageUrl';

export default function InteractiveCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState({});
  const [quantities, setQuantities] = useState({});
  const { flavors, categories, loading } = useFlavors();

  // Helper to handle quantity changes per flavor
  const handleQuantityChange = (flavorId, amount) => {
    setQuantities(prev => {
      const current = prev[flavorId] || 1;
      const next = Math.max(1, current + amount);
      return { ...prev, [flavorId]: next };
    });
  };

  const getQuantity = (flavorId) => quantities[flavorId] || 1;

  // Add to cart
  const addToCart = (flavor) => {
    const qty = getQuantity(flavor.id);
    setCart(prev => {
      const currentQty = prev[flavor.id]?.quantity || 0;
      return {
        ...prev,
        [flavor.id]: {
          flavor,
          quantity: currentQty + qty
        }
      };
    });
    // Reset quantity input back to 1
    setQuantities(prev => ({ ...prev, [flavor.id]: 1 }));
  };

  // Remove from cart
  const removeFromCart = (flavorId) => {
    setCart(prev => {
      const updated = { ...prev };
      delete updated[flavorId];
      return updated;
    });
  };

  // Update item quantity directly inside cart
  const updateCartQty = (flavorId, qty) => {
    if (qty <= 0) {
      removeFromCart(flavorId);
      return;
    }
    setCart(prev => ({
      ...prev,
      [flavorId]: {
        ...prev[flavorId],
        quantity: qty
      }
    }));
  };

  // Cart totals
  const cartItemsArray = Object.values(cart);
  const totalItems = cartItemsArray.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = totalItems * 1000; // All flavors cost $1000

  // Filter & Search Logic
  const filteredFlavors = flavors.filter(flavor => {
    const matchesCategory = selectedCategory === 'all' || flavor.category === selectedCategory;
    const matchesSearch = flavor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          flavor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          flavor.filling.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Construct WhatsApp checkout message
  const handleWhatsAppCheckout = () => {
    if (cartItemsArray.length === 0) return;

    let messageText = "¡Hola Don Alfajor! 🍫✨\nMe gustaría hacer el siguiente pedido:\n\n";
    cartItemsArray.forEach(item => {
      messageText += `🔹 *${item.quantity}x* ${item.flavor.name} ($${(item.quantity * 1000).toLocaleString('es-CL')})\n`;
    });
    messageText += `\n*Total a pagar:* $${totalPrice.toLocaleString('es-CL')}\n`;
    messageText += `*Método de consulta:* Venta al detalle`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/56979797420?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="catalog-container">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando sabores...</p>
        </div>
      ) : (
        <>
          {/* Modern Header */}
          <motion.div 
            className="content-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="handdrawn-decor-sun"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={32} className="text-yellow-400" />
            </motion.div>
            <h1 className="content-title">Menú de Sabores</h1>
            <p className="content-description">
              ¡Hola! Explora nuestra variedad de alfajores hechos a mano con cariño. Rellenos abundantes, tapas horneadas y coberturas crujientes. ¡Todos los sabores valen **$1.000 la unidad**!
            </p>
            <motion.div 
              className="handdrawn-decor-heart"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart size={24} className="text-pink-400" fill="#F48FB1" />
            </motion.div>
          </motion.div>

          {/* Filters and Search Bar */}
          <motion.div 
            className="catalog-filters no-print"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="filter-group">
              <motion.button 
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Todos
              </motion.button>
              {categories.map(cat => (
                <motion.button
                  key={cat.id}
                  className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>

            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar sabor o relleno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Wrapped Packaging Presentation Section */}
      <div className="wrapped-presentation-section no-print" style={{
        backgroundColor: '#FFFBF7',
        border: '3px dashed var(--border-pencil)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '2rem',
        boxShadow: '4px 4px 0px rgba(93,64,55,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--accent-brown)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🍬 Presentación y Envolturas Especiales
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-pink)', fontWeight: 'bold', fontFamily: 'var(--font-handwritten)' }}>
            ¡Hechos con cariño! ✨
          </span>
        </div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          Cada alfajor Don Alfajor se entrega envuelto en papel colorido de alta calidad y sellado con un adhesivo circular ilustrado a mano con el logo oficial, que detalla el sabor y nuestro WhatsApp. ¡Perfecto para regalar o regalarse!
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="polaroid-frame" style={{ margin: 0, padding: '8px 8px 16px' }}>
            <div className="polaroid-image-wrapper" style={{ height: '140px' }}>
              <img src={getImageUrl('assets/flavors/wrapped-1.png')} alt="Envoltura Grupal" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
            <div className="polaroid-caption" style={{ fontSize: '0.85rem', marginTop: '4px', fontFamily: 'var(--font-handwritten)' }}>
              🌈 Variedad de colores y sabores
            </div>
          </div>
          <div className="polaroid-frame" style={{ margin: 0, padding: '8px 8px 16px' }}>
            <div className="polaroid-image-wrapper" style={{ height: '140px' }}>
              <img src={getImageUrl('assets/flavors/wrapped-2.png')} alt="Trío de Envolturas" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
            <div className="polaroid-caption" style={{ fontSize: '0.85rem', marginTop: '4px', fontFamily: 'var(--font-handwritten)' }}>
              🧸 Stickers estilo infantil y tiernos
            </div>
          </div>
        </div>
      </div>

      {/* Flavors Grid */}
      <motion.div 
        className="flavors-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence>
          {filteredFlavors.length > 0 ? (
            filteredFlavors.map((flavor, index) => (
              <motion.div 
                key={flavor.id} 
                className="flavor-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="flavor-card-header-top">
                  <span className="flavor-card-category-tag">
                    {categories.find(c => c.id === flavor.category)?.name}
                  </span>
                  <span className="flavor-card-price-badge">$1.000</span>
                </div>

                {/* Polaroid product frame with actual photo */}
                <motion.div 
                  className="polaroid-frame"
                  whileHover={{ rotate: 2, scale: 1.05 }}
                >
                  <div className="polaroid-tape"></div>
                  <div className="polaroid-image-wrapper">
                    <img src={getImageUrl(flavor.image)} alt={flavor.name} />
                  </div>
                  <div className="polaroid-caption">
                    {flavor.emoji} {flavor.name}
                  </div>
                </motion.div>

                <p className="flavor-card-desc-text">{flavor.description}</p>
                
                <div className="flavor-card-list-details">
                  <div><strong>Relleno:</strong> {flavor.filling}</div>
                  <div><strong>Masa:</strong> {flavor.dough}</div>
                  <div><strong>Bañado:</strong> {flavor.coating}</div>
                </div>

                <div className="flavor-card-footer no-print">
                  <div className="quantity-selector">
                    <motion.button 
                      className="quantity-btn" 
                      onClick={() => handleQuantityChange(flavor.id, -1)}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Minus size={16} />
                    </motion.button>
                    <span className="quantity-value">{getQuantity(flavor.id)}</span>
                    <motion.button 
                      className="quantity-btn" 
                      onClick={() => handleQuantityChange(flavor.id, 1)}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                  <motion.button 
                    className="btn-card-add"
                    onClick={() => addToCart(flavor)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingCart size={16} style={{ marginRight: '0.5rem' }} />
                    Pedir
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search size={48} style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: 500, fontFamily: 'var(--font-handwritten)', fontSize: '1.8rem' }}>
                No encontramos ese sabor por aquí...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Shopping Cart Summary */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div 
            className="order-cart-panel no-print"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="order-cart-header">
              <h3 className="order-cart-title" style={{ fontFamily: 'var(--font-heading)' }}>
                <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} />
                Mi Pedido 
                <span style={{ fontSize: '0.95rem', backgroundColor: 'var(--accent-pink)', color: 'var(--accent-brown)', padding: '0.1rem 0.6rem', borderRadius: '999px', border: '1.5px solid var(--border-pencil)' }}>{totalItems}</span>
              </h3>
              <motion.button 
                className="order-cart-close" 
                onClick={() => setCart({})} 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="order-cart-items">
              {cartItemsArray.map(item => (
                <motion.div 
                  key={item.flavor.id} 
                  className="order-cart-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="order-cart-item-info">
                    <span className="order-cart-item-qty">{item.quantity}x</span>
                    <span style={{ fontWeight: 600 }}>{item.flavor.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>${(item.quantity * 1000).toLocaleString('es-CL')}</span>
                    <motion.button 
                      className="order-cart-item-remove"
                      onClick={() => removeFromCart(item.flavor.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="order-cart-totals" style={{ borderTop: '2px dashed var(--border-pencil)', paddingOver: '0.5rem' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--accent-brown)' }}>${totalPrice.toLocaleString('es-CL')}</span>
            </div>

            <motion.button 
              className="btn-whatsapp-order"
              onClick={handleWhatsAppCheckout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ border: '3px solid var(--border-pencil)', boxShadow: '3px 3px 0px var(--border-pencil)' }}
            >
              <ShoppingCart size={18} style={{ marginRight: '0.5rem' }} />
              Mandar Pedido por WhatsApp
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}

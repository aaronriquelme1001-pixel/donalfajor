import React, { useState } from 'react';
import { flavors, categories } from '../data/flavors';

export default function InteractiveCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState({});
  const [quantities, setQuantities] = useState({});

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
      {/* Crayon Header */}
      <div className="content-header">
        <span className="handdrawn-decor-sun" role="img" aria-label="sun">☀️</span>
        <h1 className="content-title">Menú de Sabores</h1>
        <p className="content-description">
          ¡Hola! Explora nuestra variedad de alfajores hechos a mano con cariño. Rellenos abundantes, tapas horneadas y coberturas crujientes. ¡Todos los sabores valen **$1.000 la unidad**!
        </p>
        <span className="handdrawn-decor-heart" role="img" aria-label="heart">❤️</span>
      </div>

      {/* Filters and Search Bar */}
      <div className="catalog-filters no-print">
        <div className="filter-group">
          <button 
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar sabor o relleno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Flavors Grid */}
      <div className="flavors-grid">
        {filteredFlavors.length > 0 ? (
          filteredFlavors.map(flavor => (
            <div key={flavor.id} className="flavor-card">
              <div className="flavor-card-header-top">
                <span className="flavor-card-category-tag">
                  {categories.find(c => c.id === flavor.category)?.name}
                </span>
                <span className="flavor-card-price-badge">$1.000</span>
              </div>

              {/* Polaroid product frame with actual photo */}
              <div className="polaroid-frame">
                <div className="polaroid-tape"></div>
                <div className="polaroid-image-wrapper">
                  <img src={flavor.image} alt={flavor.name} />
                </div>
                <div className="polaroid-caption">
                  {flavor.emoji} {flavor.name}
                </div>
              </div>

              <p className="flavor-card-desc-text">{flavor.description}</p>
              
              <div className="flavor-card-list-details">
                <div><strong>Relleno:</strong> {flavor.filling}</div>
                <div><strong>Masa:</strong> {flavor.dough}</div>
                <div><strong>Bañado:</strong> {flavor.coating}</div>
              </div>

              <div className="flavor-card-footer no-print">
                <div className="quantity-selector">
                  <button 
                    className="quantity-btn" 
                    onClick={() => handleQuantityChange(flavor.id, -1)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{getQuantity(flavor.id)}</span>
                  <button 
                    className="quantity-btn" 
                    onClick={() => handleQuantityChange(flavor.id, 1)}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="btn-card-add"
                  onClick={() => addToCart(flavor)}
                >
                  Pedir
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <p style={{ marginTop: '1rem', fontWeight: 500, fontFamily: 'var(--font-handwritten)', fontSize: '1.8rem' }}>
              No encontramos ese sabor por aquí...
            </p>
          </div>
        )}
      </div>

      {/* Floating Shopping Cart Summary */}
      {totalItems > 0 && (
        <div className="order-cart-panel no-print">
          <div className="order-cart-header">
            <h3 className="order-cart-title" style={{ fontFamily: 'var(--font-heading)' }}>
              🧺 Mi Pedido <span style={{ fontSize: '0.95rem', backgroundColor: 'var(--accent-pink)', color: 'var(--accent-brown)', padding: '0.1rem 0.6rem', borderRadius: '999px', border: '1.5px solid var(--border-pencil)' }}>{totalItems}</span>
            </h3>
            <button className="order-cart-close" onClick={() => setCart({})} style={{ fontWeight: 'bold' }}>Vaciar</button>
          </div>

          <div className="order-cart-items">
            {cartItemsArray.map(item => (
              <div key={item.flavor.id} className="order-cart-item">
                <div className="order-cart-item-info">
                  <span className="order-cart-item-qty">{item.quantity}x</span>
                  <span style={{ fontWeight: 600 }}>{item.flavor.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>${(item.quantity * 1000).toLocaleString('es-CL')}</span>
                  <button 
                    className="order-cart-item-remove"
                    onClick={() => removeFromCart(item.flavor.id)}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="order-cart-totals" style={{ borderTop: '2px dashed var(--border-pencil)', paddingOver: '0.5rem' }}>
            <span>Total:</span>
            <span style={{ color: 'var(--accent-brown)' }}>${totalPrice.toLocaleString('es-CL')}</span>
          </div>

          <button 
            className="btn-whatsapp-order"
            onClick={handleWhatsAppCheckout}
            style={{ border: '3px solid var(--border-pencil)', boxShadow: '3px 3px 0px var(--border-pencil)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.473 1.336 4.985l-1.42 5.187 5.311-1.392c1.455.795 3.09 1.213 4.752 1.213 5.506 0 9.989-4.482 9.989-9.99 0-5.507-4.482-9.99-9.989-9.99zm5.727 14.156c-.244.688-1.427 1.348-1.956 1.413-.483.059-.974.1-3.13-.736-2.756-1.07-4.524-3.864-4.662-4.048-.138-.184-1.12-1.488-1.12-2.839 0-1.35.704-2.013.955-2.274.252-.262.551-.328.736-.328.184 0 .368.002.528.01.166.008.388-.063.608.468.225.541.77 1.868.835 2.001.066.133.11.288.02.467-.09.18-.138.288-.276.444-.138.156-.291.348-.414.468-.138.134-.282.28-.12.56.162.28.72 1.185 1.543 1.918.823.733 1.517.96 1.737 1.07.22.11.348.093.478-.057.13-.15.556-.648.704-.87.148-.22.296-.184.499-.11.204.074 1.298.613 1.522.725.225.112.374.168.428.261.054.093.054.542-.19 1.23z"/>
            </svg>
            Mandar Pedido por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}

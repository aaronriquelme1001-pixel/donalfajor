import React, { useState } from 'react';
import { flavors, categories } from '../data/flavors';

export default function PrintableMenus() {
  const [activeLayout, setActiveLayout] = useState('full-menu'); // 'full-menu', 'split-lines', 'promo-poster'

  const handlePrint = () => {
    window.print();
  };

  // Group flavors by category
  const classics = flavors.filter(f => f.category === 'classics');
  const fruit = flavors.filter(f => f.category === 'fruit');
  const gourmet = flavors.filter(f => f.category === 'gourmet');

  return (
    <div className="printable-container">
      <div className="content-header no-print">
        <span className="handdrawn-decor-sun" role="img" aria-label="sun">☀️</span>
        <h1 className="content-title">Afiches y Menús Imprimibles</h1>
        <p className="content-description">
          Genera menús en alta definición para tu local físico. Elige entre el menú completo, las líneas separadas con fotos de referencia o el afiche de $1.000. Presiona el botón para imprimir o guardar como PDF.
        </p>
        <span className="handdrawn-decor-heart" role="img" aria-label="heart">❤️</span>
      </div>

      {/* Option Selectors - Hidden on Print */}
      <div className="print-options no-print">
        <button 
          className={`btn-secondary ${activeLayout === 'full-menu' ? 'btn-primary' : ''}`}
          onClick={() => setActiveLayout('full-menu')}
        >
          📄 Menú Completo (A4)
        </button>
        <button 
          className={`btn-secondary ${activeLayout === 'split-lines' ? 'btn-primary' : ''}`}
          onClick={() => setActiveLayout('split-lines')}
        >
          🖼️ Líneas con Fotos (3 Hojas)
        </button>
        <button 
          className={`btn-secondary ${activeLayout === 'promo-poster' ? 'btn-primary' : ''}`}
          onClick={() => setActiveLayout('promo-poster')}
        >
          📢 Afiche Promocional (A4)
        </button>

        <button 
          className="btn-primary" 
          onClick={handlePrint}
          style={{ backgroundColor: '#4E342E', color: 'white', marginLeft: 'auto' }}
        >
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>

      {/* Print Preview Container */}
      <div className="print-preview-container">
        
        {/* LAYOUT 1: FULL MENU */}
        {activeLayout === 'full-menu' && (
          <div className="print-page-a4">
            <span style={{ position: 'absolute', top: '15px', left: '20px', fontSize: '1.5rem', opacity: 0.2 }}>☁️</span>
            <span style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '1.5rem', opacity: 0.2 }}>☀️</span>
            
            {/* Header */}
            <div className="print-header">
              <div className="print-logo" style={{ borderRadius: '50%' }}>
                <img src="/logo.png" alt="Don Alfajor Logo" />
              </div>
              <h2 className="print-title">Don Alfajor</h2>
              <span className="print-subtitle">Menú de Sabores Artesanales de Autor ✨</span>
            </div>

            {/* Menu Body */}
            <div className="print-body">
              {/* Category 1 */}
              <div className="print-category-section">
                <h3 className="print-category-title">🧸 Clásicos y Dulces</h3>
                <div className="print-menu-grid">
                  {classics.map(f => (
                    <div key={f.id} className="print-menu-item">
                      <div className="print-item-header">
                        <span>{f.emoji} {f.name}</span>
                        <span className="print-item-dots"></span>
                        <span className="print-item-price">$1.000</span>
                      </div>
                      <p className="print-item-desc">{f.filling} • {f.coating}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2 */}
              <div className="print-category-section">
                <h3 className="print-category-title">🍋 Frutales y Exóticos</h3>
                <div className="print-menu-grid">
                  {fruit.map(f => (
                    <div key={f.id} className="print-menu-item">
                      <div className="print-item-header">
                        <span>{f.emoji} {f.name}</span>
                        <span className="print-item-dots"></span>
                        <span className="print-item-price">$1.000</span>
                      </div>
                      <p className="print-item-desc">{f.filling} • {f.coating}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 3 */}
              <div className="print-category-section">
                <h3 className="print-category-title">🍷 Línea Gourmet Premium</h3>
                <div className="print-menu-grid">
                  {gourmet.map(f => (
                    <div key={f.id} className="print-menu-item">
                      <div className="print-item-header">
                        <span>{f.emoji} {f.name}</span>
                        <span className="print-item-dots"></span>
                        <span className="print-item-price">$1.000</span>
                      </div>
                      <p className="print-item-desc">{f.filling} • {f.coating}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Banner */}
            <div className="print-footer-banner">
              <h3 style={{ fontFamily: 'var(--font-heading)' }}>TODOS LOS SABORES A $1.000 LA UNIDAD</h3>
              <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.25rem' }}>Hechos con cariño en nuestra pastelería familiar</p>
            </div>

            {/* Contacts */}
            <div className="print-contacts-footer">
              <div className="print-contact-item">
                <strong>WhatsApp:</strong> 979797420
              </div>
              <div className="print-contact-item">
                <strong>Recetas Caseras</strong>
              </div>
              <div className="print-contact-item">
                <strong>Venta Detalle y Mayor</strong>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 2: SPLIT PAGES (3 SHEETS WITH POLAROID PHOTOS) */}
        {activeLayout === 'split-lines' && (
          <>
            {/* Sheet 1: Classics */}
            <div className="print-page-a4" style={{ padding: '40px 50px' }}>
              <span style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '1.5rem', opacity: 0.2 }}>☀️</span>
              
              <div className="print-header">
                <div className="print-logo" style={{ borderRadius: '50%' }}>
                  <img src="/logo.png" alt="Don Alfajor Logo" />
                </div>
                <h2 className="print-title">Don Alfajor</h2>
                <span className="print-subtitle" style={{ color: 'var(--accent-pink)' }}>Línea Clásicos y Dulces 🧸</span>
              </div>

              {/* Flex list showing Polaroid + description side by side */}
              <div className="print-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
                {classics.map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: '100%', borderBottom: '2px dashed var(--border-pencil)', paddingBottom: '1rem' }}>
                    
                    {/* Small Polaroid */}
                    <div style={{ width: '140px', flexShrink: 0 }}>
                      <div className="polaroid-frame" style={{ padding: '8px 8px 16px', transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}>
                        <div className="polaroid-image-wrapper" style={{ height: '90px' }}>
                          <img src={f.image} alt={f.name} />
                        </div>
                        <div className="polaroid-caption" style={{ fontSize: '1rem', marginTop: '6px' }}>{f.emoji} {f.name}</div>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--accent-brown)' }}>{f.name}</span>
                        <span style={{ color: 'var(--accent-pink)' }}>$1.000</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.description}</p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {f.filling} • {f.coating} • {f.dough}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="print-footer-banner">
                <h3>TODOS LOS SABORES A $1.000</h3>
                <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem' }}>Pídelos al WhatsApp: 979797420</p>
              </div>
            </div>

            {/* Sheet 2: Fruits */}
            <div className="print-page-a4" style={{ padding: '40px 50px' }}>
              <span style={{ position: 'absolute', top: '15px', left: '20px', fontSize: '1.5rem', opacity: 0.2 }}>☁️</span>
              
              <div className="print-header">
                <div className="print-logo" style={{ borderRadius: '50%' }}>
                  <img src="/logo.png" alt="Don Alfajor Logo" />
                </div>
                <h2 className="print-title">Don Alfajor</h2>
                <span className="print-subtitle" style={{ color: 'var(--accent-blue)' }}>Línea Frutales y Exóticos 🍋</span>
              </div>

              <div className="print-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
                {fruit.map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: '100%', borderBottom: '2px dashed var(--border-pencil)', paddingBottom: '1rem' }}>
                    
                    {/* Small Polaroid */}
                    <div style={{ width: '140px', flexShrink: 0 }}>
                      <div className="polaroid-frame" style={{ padding: '8px 8px 16px', transform: `rotate(${i % 2 === 0 ? 2 : -2}deg)` }}>
                        <div className="polaroid-image-wrapper" style={{ height: '90px' }}>
                          <img src={f.image} alt={f.name} />
                        </div>
                        <div className="polaroid-caption" style={{ fontSize: '1rem', marginTop: '6px' }}>{f.emoji} {f.name}</div>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--accent-brown)' }}>{f.name}</span>
                        <span style={{ color: 'var(--accent-pink)' }}>$1.000</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.description}</p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {f.filling} • {f.coating} • {f.dough}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="print-footer-banner" style={{ backgroundColor: 'var(--accent-blue)' }}>
                <h3>FRESCURA NATURAL A $1.000</h3>
                <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem' }}>Pídelos al WhatsApp: 979797420</p>
              </div>
            </div>

            {/* Sheet 3: Gourmet */}
            <div className="print-page-a4" style={{ padding: '40px 50px' }}>
              <span style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '1.5rem', opacity: 0.2 }}>⭐️</span>
              
              <div className="print-header">
                <div className="print-logo" style={{ borderRadius: '50%' }}>
                  <img src="/logo.png" alt="Don Alfajor Logo" />
                </div>
                <h2 className="print-title">Don Alfajor</h2>
                <span className="print-subtitle" style={{ color: 'var(--accent-yellow)' }}>Línea Gourmet Premium 🍷</span>
              </div>

              <div className="print-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
                {gourmet.map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: '100%', borderBottom: '2px dashed var(--border-pencil)', paddingBottom: '1rem' }}>
                    
                    {/* Small Polaroid */}
                    <div style={{ width: '140px', flexShrink: 0 }}>
                      <div className="polaroid-frame" style={{ padding: '8px 8px 16px', transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}>
                        <div className="polaroid-image-wrapper" style={{ height: '90px' }}>
                          <img src={f.image} alt={f.name} />
                        </div>
                        <div className="polaroid-caption" style={{ fontSize: '1rem', marginTop: '6px' }}>{f.emoji} {f.name}</div>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--accent-brown)' }}>{f.name}</span>
                        <span style={{ color: 'var(--accent-pink)' }}>$1.000</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.description}</p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {f.filling} • {f.coating} • {f.dough}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="print-footer-banner" style={{ backgroundColor: 'var(--text-primary)', color: 'white' }}>
                <h3 style={{ color: 'var(--accent-yellow)' }}>SABORES EXCLUSIVOS A $1.000</h3>
                <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem' }}>Pídelos al WhatsApp: 979797420</p>
              </div>
            </div>
          </>
        )}

        {/* LAYOUT 3: PROMO POSTER */}
        {activeLayout === 'promo-poster' && (
          <div className="print-page-a4" style={{ padding: '60px', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
            <span className="handdrawn-decor-sun" style={{ top: '30px', right: '30px', fontSize: '3rem' }}>☀️</span>
            
            <div className="print-logo" style={{ width: '150px', height: '150px', borderRadius: '50%', borderWidth: '4px' }}>
              <img src="/logo.png" alt="Don Alfajor Logo" />
            </div>

            <div style={{ margin: '1rem 0' }}>
              <h1 style={{ fontSize: '4.2rem', color: 'var(--accent-brown)', fontFamily: 'var(--font-heading)', margin: 0, lineHeight: 1 }}>
                Don Alfajor
              </h1>
              <p style={{ fontSize: '1.4rem', fontFamily: 'var(--font-handwritten)', color: 'var(--text-secondary)', fontWeight: 'bold', marginTop: '0.5rem' }}>
                Sabores Artesanales Hechos con Amor 💕
              </p>
            </div>

            <div style={{
              border: '4px solid var(--border-pencil)',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              width: '100%',
              margin: '1.5rem 0',
              backgroundColor: '#FFFDF9',
              boxShadow: '6px 6px 0px var(--border-pencil)'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-handwritten)', letterSpacing: '1px' }}>
                ¡Todos nuestros sabores!
              </span>
              <h2 style={{ fontSize: '5.5rem', color: 'var(--accent-pink)', fontFamily: 'var(--font-heading)', margin: '0.2rem 0', lineHeight: 1 }}>
                $1.000
              </h2>
              <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-brown)' }}>
                UN MIL PESOS LA UNIDAD
              </span>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
                Clásicos • Frutales • Línea Gourmet de Autor
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--accent-brown)', fontFamily: 'var(--font-heading)' }}>¿Quieres hacer un pedido? 📝</h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-handwritten)', fontWeight: 'bold' }}>
                Escríbenos o llámanos directamente
              </p>
              
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                backgroundColor: '#E8F5E9', 
                color: '#1B5E20',
                border: '3px solid var(--border-pencil)',
                padding: '0.8rem 2.2rem',
                borderRadius: '50px',
                fontSize: '2.2rem',
                fontWeight: 'bold',
                alignSelf: 'center',
                margin: '0.8rem 0',
                fontFamily: 'var(--font-heading)',
                boxShadow: '4px 4px 0px var(--border-pencil)'
              }}>
                979797420
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-handwritten)' }}>
              Ventas al detalle y por mayor • Elaboración artesanal diaria
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

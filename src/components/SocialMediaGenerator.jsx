import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { flavors } from '../data/flavors';

const COLOR_THEMES = [
  { id: 'cream', name: 'Crema Papel', bg: '#FDFBF7', text: '#5D4037', accent: '#D37B57' },
  { id: 'pink', name: 'Rosa Tierno', bg: '#FFF0F0', text: '#5D4037', accent: '#F98F8F' },
  { id: 'blue', name: 'Celeste Nube', bg: '#F0F8FA', text: '#5D4037', accent: '#82C3C9' },
  { id: 'yellow', name: 'Amarillo Sol', bg: '#FFFDE7', text: '#5D4037', accent: '#FBC02D' },
  { id: 'cocoa', name: 'Marrón Chocolate', bg: '#4E342E', text: '#FFFDF9', accent: '#FFF176' }
];

export default function SocialMediaGenerator() {
  const [selectedFlavorId, setSelectedFlavorId] = useState(flavors[0].id);
  const [format, setFormat] = useState('post'); // 'post' (1:1) or 'story' (9:16)
  const [theme, setTheme] = useState(COLOR_THEMES[0]);
  const [customTagline, setCustomTagline] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [displayMode, setDisplayMode] = useState('photo'); // 'photo' (product picture) or 'logo' (emoji logo)
  const [showPrice, setShowPrice] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef(null);

  // Get active flavor
  const activeFlavor = flavors.find(f => f.id === selectedFlavorId) || flavors[0];

  // Sync custom text values when flavor changes
  useEffect(() => {
    setCustomTitle(activeFlavor.name);
    setCustomTagline(activeFlavor.tagline);
    setCustomDesc(activeFlavor.description);
    
    // Automatically match color presets to give a tierno matching look
    const matchingTheme = COLOR_THEMES.find(t => {
      if (activeFlavor.id === 'manjar-blanco') return t.id === 'cream';
      if (activeFlavor.id === 'manjar-negro') return t.id === 'cocoa';
      if (activeFlavor.id === 'frambuesa-blanco-negro') return t.id === 'pink';
      if (activeFlavor.id === 'maracuya-blanco-negro') return t.id === 'yellow';
      if (activeFlavor.id === 'lucuma-blanco-negro') return t.id === 'yellow';
      if (activeFlavor.id === 'coco') return t.id === 'blue';
      return false;
    });

    setTheme(matchingTheme || COLOR_THEMES[0]);
  }, [selectedFlavorId]);

  // Handle PNG Download via html2canvas
  const downloadPng = async () => {
    if (!canvasRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(canvasRef.current, {
        scale: 3, // Boost resolution for print-sharp texts
        useCORS: true,
        allowTaint: true,
        backgroundColor: theme.bg
      });
      
      const link = document.createElement('a');
      link.download = `don_alfajor_${activeFlavor.id}_${format}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Hubo un problema al generar la imagen. Inténtalo nuevamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const isDarkTheme = theme.bg === '#4E342E';

  return (
    <div className="generator-container">
      <div className="content-header">
        <span className="handdrawn-decor-sun" role="img" aria-label="sun">☀️</span>
        <h1 className="content-title">Creador de Publicaciones</h1>
        <p className="content-description">
          Genera tus imágenes de Instagram y Facebook en tiempo real. Configura el sabor, elige si deseas mostrar la **Foto Real** o el **Crayon Logo**, ajusta los colores y descarga un PNG listo para subir.
        </p>
        <span className="handdrawn-decor-heart" role="img" aria-label="heart">❤️</span>
      </div>

      <div className="generator-layout">
        {/* Left Side: Real-time Render Preview */}
        <div className="generator-preview-panel no-print">
          <div 
            ref={canvasRef}
            className={`canvas-wrapper ${format === 'post' ? 'instagram-post' : 'instagram-story'}`}
            style={{ 
              backgroundColor: theme.bg,
              borderColor: isDarkTheme ? '#FFFDF9' : 'var(--border-pencil)',
              borderStyle: 'solid',
              borderWidth: '4px'
            }}
          >
            <div className="canvas-template" style={{ color: theme.text, padding: format === 'post' ? '2.5rem' : '4rem 2.5rem' }}>
              {/* Crayon background scribbles */}
              <div className="canvas-bg-decorations">
                <span style={{ position: 'absolute', top: '25px', right: '25px', fontSize: '2.5rem', opacity: 0.15, transform: 'rotate(10deg)' }}>☁️</span>
                <span style={{ position: 'absolute', bottom: '80px', left: '20px', fontSize: '2.2rem', opacity: 0.15, transform: 'rotate(-15deg)' }}>⭐️</span>
                <span style={{ position: 'absolute', top: '40%', right: '15px', fontSize: '2rem', opacity: 0.1, transform: 'rotate(25deg)' }}>☀️</span>
              </div>

              {/* Logo Badge in Header */}
              <div className="canvas-logo-container">
                <div className="canvas-logo-circle" style={{ borderColor: isDarkTheme ? '#FFFDF9' : 'var(--border-pencil)', borderWidth: '3px' }}>
                  <img src="/logo.png" alt="Don Alfajor Logo" />
                </div>
                <div>
                  <div className="canvas-brand-name" style={{ color: isDarkTheme ? '#FFFDF9' : 'var(--accent-brown)', fontFamily: 'var(--font-heading)' }}>Don Alfajor</div>
                  <div className="canvas-brand-sub" style={{ color: theme.accent, fontFamily: 'var(--font-handwritten)', fontWeight: 'bold' }}>Sabores de Autor ✨</div>
                </div>
              </div>

              {/* Content Area */}
              <div className="canvas-content-box">
                {displayMode === 'photo' ? (
                  /* Polaroid Picture Frame */
                  <div className="canvas-polaroid-frame" style={{ borderColor: 'var(--border-pencil)', borderWidth: '4px' }}>
                    <div className="polaroid-tape"></div>
                    <div className="canvas-polaroid-img-box">
                      <img src={activeFlavor.image} alt={activeFlavor.name} />
                    </div>
                    <div className="canvas-polaroid-caption" style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--accent-brown)' }}>
                      {activeFlavor.emoji} {customTitle}
                    </div>
                  </div>
                ) : (
                  /* Big Logo/Emoji view */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '180px', 
                      height: '180px', 
                      borderRadius: '50%', 
                      border: '4px dashed ' + (isDarkTheme ? '#FFFDF9' : 'var(--border-pencil)'), 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '6.5rem',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      marginBottom: '1rem',
                      animation: 'spin 40s linear infinite'
                    }}>
                      {activeFlavor.emoji}
                    </div>
                    <h2 className="canvas-flavor-title" style={{ color: theme.accent, fontFamily: 'var(--font-handwritten)', fontSize: '3rem', fontWeight: 'bold' }}>
                      {customTitle}
                    </h2>
                  </div>
                )}
                
                {/* Text boxes */}
                {customTagline && (
                  <p className="canvas-flavor-tagline" style={{ 
                    fontFamily: 'var(--font-handwritten)', 
                    fontSize: '1.6rem', 
                    fontWeight: 'bold', 
                    color: isDarkTheme ? '#FFFDF9' : 'var(--text-secondary)',
                    margin: '0.5rem 0'
                  }}>
                    "{customTagline}"
                  </p>
                )}

                {customDesc && displayMode === 'logo' && (
                  <p className="canvas-flavor-description" style={{ fontSize: '0.9rem', color: theme.text, opacity: 0.9 }}>
                    {customDesc}
                  </p>
                )}

                {showPrice && (
                  <div className="canvas-price-tag" style={{ 
                    backgroundColor: 'var(--accent-yellow)', 
                    color: 'var(--accent-brown)', 
                    borderColor: 'var(--border-pencil)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'bold',
                    alignSelf: 'center',
                    marginTop: '0.75rem'
                  }}>
                    $1.000 c/u
                  </div>
                )}
              </div>

              {/* Footer with whatsapp details */}
              {showContact ? (
                <div className="canvas-footer" style={{ borderTopColor: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(93, 64, 55, 0.2)', color: theme.text, fontFamily: 'var(--font-handwritten)', fontSize: '1.4rem' }}>
                  <div className="canvas-footer-tel">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.473 1.336 4.985l-1.42 5.187 5.311-1.392c1.455.795 3.09 1.213 4.752 1.213 5.506 0 9.989-4.482 9.989-9.99 0-5.507-4.482-9.99-9.989-9.99zm5.727 14.156c-.244.688-1.427 1.348-1.956 1.413-.483.059-.974.1-3.13-.736-2.756-1.07-4.524-3.864-4.662-4.048-.138-.184-1.12-1.488-1.12-2.839 0-1.35.704-2.013.955-2.274.252-.262.551-.328.736-.328.184 0 .368.002.528.01.166.008.388-.063.608.468.225.541.77 1.868.835 2.001.066.133.11.288.02.467-.09.18-.138.288-.276.444-.138.156-.291.348-.414.468-.138.134-.282.28-.12.56.162.28.72 1.185 1.543 1.918.823.733 1.517.96 1.737 1.07.22.11.348.093.478-.057.13-.15.556-.648.704-.87.148-.22.296-.184.499-.11.204.074 1.298.613 1.522.725.225.112.374.168.428.261.054.093.054.542-.19 1.23z"/>
                    </svg>
                    <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>979797420</span>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>Artesanales de Autor ❤️</div>
                </div>
              ) : (
                <div style={{ height: '10px' }}></div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={downloadPng}
              disabled={isDownloading}
              style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}
            >
              {isDownloading ? (
                <>⏳ Generando PNG...</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar Imagen PNG
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Control Settings Form */}
        <div className="generator-control-panel no-print">
          <h3 className="control-section-title">Ajustes del Dibujo</h3>

          <div className="control-group">
            <label>Mostrar en Publicación</label>
            <div className="custom-toggle-btn">
              <button 
                className={`custom-toggle-option ${displayMode === 'photo' ? 'active' : ''}`}
                onClick={() => setDisplayMode('photo')}
              >
                📸 Foto de Producto
              </button>
              <button 
                className={`custom-toggle-option ${displayMode === 'logo' ? 'active' : ''}`}
                onClick={() => setDisplayMode('logo')}
              >
                🎨 Dibujo / Emoji
              </button>
            </div>
          </div>

          <div className="control-group">
            <label>Sabor a Mostrar</label>
            <select 
              value={selectedFlavorId} 
              onChange={(e) => setSelectedFlavorId(e.target.value)}
            >
              {flavors.map(f => (
                <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Formato</label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="post">Post Cuadrado (Instagram 1:1)</option>
              <option value="story">Historia Vertical (Instagram Story 9:16)</option>
            </select>
          </div>

          <div className="control-group">
            <label>Tema de Color</label>
            <div className="color-presets-grid">
              {COLOR_THEMES.map(t => (
                <button
                  key={t.id}
                  className={`color-preset-btn ${theme.id === t.id ? 'active' : ''}`}
                  style={{ backgroundColor: t.bg }}
                  title={t.name}
                  onClick={() => setTheme(t)}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Fondo: <strong>{theme.name}</strong>
            </span>
          </div>

          <div className="control-group">
            <label>Nombre del Sabor</label>
            <input 
              type="text" 
              value={customTitle} 
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label>Eslogan / Frase tierna</label>
            <input 
              type="text" 
              value={customTagline} 
              onChange={(e) => setCustomTagline(e.target.value)} 
            />
          </div>

          <div className="control-group">
            <label>Descripción corta</label>
            <textarea 
              rows="3" 
              value={customDesc} 
              onChange={(e) => setCustomDesc(e.target.value)} 
            />
          </div>

          <div className="control-group" style={{ flexDirection: 'row', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textTransform: 'none', letterSpacing: '0' }}>
              <input 
                type="checkbox" 
                checked={showPrice} 
                onChange={(e) => setShowPrice(e.target.checked)} 
                style={{ width: 'auto' }}
              />
              Mostrar Precio ($1.000)
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textTransform: 'none', letterSpacing: '0' }}>
              <input 
                type="checkbox" 
                checked={showContact} 
                onChange={(e) => setShowContact(e.target.checked)} 
                style={{ width: 'auto' }}
              />
              Mostrar Contacto
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

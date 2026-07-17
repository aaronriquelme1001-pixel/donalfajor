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

const FONT_OPTIONS = [
  { id: 'Fredoka', name: 'Redondeada (Fredoka)', family: 'var(--font-heading)' },
  { id: 'Gaegu', name: 'Mano Alzada (Gaegu)', family: 'var(--font-handwritten)' },
  { id: 'Caveat', name: 'Cursiva Tierna (Caveat)', family: "'Caveat', cursive" }
];

export default function SocialMediaGenerator() {
  const [selectedFlavorId, setSelectedFlavorId] = useState(flavors[0].id);
  const [format, setFormat] = useState('post'); // 'post' (1:1) or 'story' (9:16)
  
  // Custom Text States
  const [customTitle, setCustomTitle] = useState('');
  const [customTagline, setCustomTagline] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  
  // Canva Styling States
  const [displayMode, setDisplayMode] = useState('photo'); // 'photo' or 'logo'
  const [imageZoom, setImageZoom] = useState(1); // 1.0 to 3.0
  const [imageX, setImageX] = useState(0); // horizontal pan offset (px)
  const [imageY, setImageY] = useState(0); // vertical pan offset (px)
  const [polaroidRotation, setPolaroidRotation] = useState(-2); // -15 to 15 degrees
  const [photoType, setPhotoType] = useState('slice'); // 'slice' | 'wrapped1' | 'wrapped2'
  const [frameStyle, setFrameStyle] = useState('polaroid'); // 'polaroid' | 'circle' | 'border' | 'none'
  const [stickerText, setStickerText] = useState('none'); // 'none' | 'casero' | 'artesanal' | 'hecho_con_amor' | 'receta_casera'
  const [doodlesEnabled, setDoodlesEnabled] = useState(true);
  const [fontFamily, setFontFamily] = useState('Fredoka');
  const [titleFontSize, setTitleFontSize] = useState(2.2); // rem
  const [taglineFontSize, setTaglineFontSize] = useState(1.6); // rem
  const [descFontSize, setDescFontSize] = useState(0.9); // rem
  const [showPrice, setShowPrice] = useState(true);
  const [showContact, setShowContact] = useState(true);
  
  // Custom Colors
  const [theme, setTheme] = useState(COLOR_THEMES[0]);
  const [customBgColor, setCustomBgColor] = useState('#FDFBF7');
  const [customTextColor, setCustomTextColor] = useState('#5D4037');
  const [customAccentColor, setCustomAccentColor] = useState('#D37B57');

  // Custom Uploaded Image
  const [customImage, setCustomImage] = useState(null);
  
  // Download Formats and Quality
  const [downloadFormat, setDownloadFormat] = useState('image/png'); // 'image/png' or 'image/jpeg'
  const [downloadScale, setDownloadScale] = useState(2); // 1 (normal), 2 (HD), 3 (Super HD)
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get active flavor
  const activeFlavor = flavors.find(f => f.id === selectedFlavorId) || flavors[0];

  // Sync custom text values and default styling when flavor or format changes
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

    const activeTheme = matchingTheme || COLOR_THEMES[0];
    setTheme(activeTheme);
    setCustomBgColor(activeTheme.bg);
    setCustomTextColor(activeTheme.text);
    setCustomAccentColor(activeTheme.accent);

    // Set responsive font sizes based on format
    if (format === 'post') {
      setTitleFontSize(2.2);
      setTaglineFontSize(1.6);
      setDescFontSize(0.95);
    } else {
      setTitleFontSize(2.8);
      setTaglineFontSize(2.1);
      setDescFontSize(1.25);
    }
    
    // Reset zoom, rotation, and panning offsets
    setImageZoom(1.0);
    setPolaroidRotation(-2);
    setImageX(0);
    setImageY(0);
    setCustomImage(null); // Clear custom upload when flavor changes
  }, [selectedFlavorId, format]);

  const getProductPhoto = () => {
    if (photoType === 'wrapped1') return '/assets/flavors/wrapped-1.png';
    if (photoType === 'wrapped2') return '/assets/flavors/wrapped-2.png';
    return activeFlavor.image;
  };

  // Handle Preset Theme Clicks
  const handleThemeSelect = (selectedTheme) => {
    setTheme(selectedTheme);
    setCustomBgColor(selectedTheme.bg);
    setCustomTextColor(selectedTheme.text);
    setCustomAccentColor(selectedTheme.accent);
  };

  // Handle Custom Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle PNG/JPG Download via html2canvas
  const downloadImage = async () => {
    if (!canvasRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(canvasRef.current, {
        scale: downloadScale, // Canva-like output resolution scale multiplier
        useCORS: true,
        allowTaint: true,
        backgroundColor: customBgColor
      });
      
      const ext = downloadFormat === 'image/jpeg' ? 'jpg' : 'png';
      const link = document.createElement('a');
      link.download = `don_alfajor_${activeFlavor.id}_${format}_custom.${ext}`;
      link.href = canvas.toDataURL(downloadFormat, 0.95);
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Hubo un problema al generar la imagen. Inténtalo nuevamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const isDarkTheme = customBgColor === '#4E342E';
  const selectedFont = FONT_OPTIONS.find(f => f.id === fontFamily) || FONT_OPTIONS[0];

  return (
    <div className="generator-container">
      <div className="content-header">
        <span className="handdrawn-decor-sun" role="img" aria-label="sun">☀️</span>
        <h1 className="content-title">Creador de Publicaciones</h1>
        <p className="content-description">
          ¡Diseña como en Canva! Personaliza sabores, sube tus propias fotos, haz zoom, rota elementos, cambia colores de fondo y letras, y descarga en PNG o JPG con la resolución que elijas.
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
              backgroundColor: customBgColor,
              borderColor: isDarkTheme ? '#FFFDF9' : 'var(--border-pencil)',
              borderStyle: 'solid',
              borderWidth: '4px'
            }}
          >
            <div 
              className="canvas-template" 
              style={{ 
                color: customTextColor, 
                padding: format === 'post' ? '2.5rem' : '4rem 2.5rem',
                fontFamily: selectedFont.family
              }}
            >
              {/* Crayon background scribbles */}
              {doodlesEnabled && (
                <div className="canvas-bg-decorations">
                  <span style={{ position: 'absolute', top: '25px', left: '25px', fontSize: '2rem', opacity: 0.15, transform: 'rotate(-10deg)' }}>☀️</span>
                  <span style={{ position: 'absolute', top: '25px', right: '25px', fontSize: '2.5rem', opacity: 0.15, transform: 'rotate(10deg)' }}>☁️</span>
                  <span style={{ position: 'absolute', bottom: '80px', left: '20px', fontSize: '2.2rem', opacity: 0.15, transform: 'rotate(-15deg)' }}>⭐️</span>
                  <span style={{ position: 'absolute', bottom: '80px', right: '25px', fontSize: '2.2rem', opacity: 0.15, transform: 'rotate(15deg)' }}>🍪</span>
                  <span style={{ position: 'absolute', top: '45%', left: '15px', fontSize: '1.8rem', opacity: 0.1, transform: 'rotate(-5deg)' }}>❤️</span>
                </div>
              )}

              {/* Logo Badge in Header */}
              <div className="canvas-logo-container">
                <div className="canvas-logo-wrap">
                  <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="canvas-logo" />
                </div>
                <div>
                  <div className="canvas-brand-name" style={{ color: customTextColor }}>Don Alfajor</div>
                  <div className="canvas-brand-sub" style={{ color: customAccentColor, fontFamily: 'var(--font-handwritten)', fontWeight: 'bold' }}>Sabores de Autor ✨</div>
                </div>
              </div>

              {/* Content Area */}
              <div className="canvas-content-box" style={{ position: 'relative', width: '100%' }}>
                {displayMode === 'photo' ? (
                  <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {/* Sticker Badge Overlay */}
                    {stickerText !== 'none' && (
                      <div 
                        className="sticker-badge-overlay"
                        style={{
                          position: 'absolute',
                          top: frameStyle === 'circle' ? '5px' : '-10px',
                          right: frameStyle === 'circle' ? '18%' : '10%',
                          width: '65px',
                          height: '65px',
                          borderRadius: '50%',
                          border: '2.5px solid var(--border-pencil)',
                          backgroundColor: '#FFF176', // Yellow sticker
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          color: '#5D4037',
                          boxShadow: '3px 3px 0px rgba(93,64,55,0.2)',
                          transform: 'rotate(15deg)',
                          zIndex: 10,
                          padding: '4px',
                          lineHeight: '1.15'
                        }}
                      >
                        {stickerText === 'casero' && <span>⭐<br/>Casero</span>}
                        {stickerText === 'artesanal' && <span>🧸<br/>Artesanal</span>}
                        {stickerText === 'hecho_con_amor' && <span>❤️<br/>Con Amor</span>}
                        {stickerText === 'receta_casera' && <span>✨<br/>Receta</span>}
                      </div>
                    )}

                    {frameStyle === 'polaroid' && (
                      /* Polaroid Picture Frame */
                      <div 
                        className="canvas-polaroid-frame" 
                        style={{ 
                          borderColor: 'var(--border-pencil)', 
                          borderWidth: '4px',
                          transform: `rotate(${polaroidRotation}deg)`,
                          transition: 'none',
                          position: 'relative'
                        }}
                      >
                        <div className="polaroid-tape"></div>
                        <div className="canvas-polaroid-img-box" style={{ overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={customImage || `${import.meta.env.BASE_URL.replace(/\/$/, '')}${getProductPhoto()}`} 
                            alt={activeFlavor.name} 
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transform: `scale(${imageZoom}) translate(${imageX}px, ${imageY}px)`,
                              transformOrigin: 'center',
                              transition: 'none'
                            }}
                          />
                        </div>
                        <div className="canvas-polaroid-caption" style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--accent-brown)', fontSize: '1.2rem', marginTop: '8px' }}>
                          {activeFlavor.emoji} {customTitle}
                        </div>
                      </div>
                    )}

                    {frameStyle === 'circle' && (
                      /* Circular Photo Frame */
                      <div 
                        style={{
                          width: format === 'post' ? '220px' : '280px',
                          height: format === 'post' ? '220px' : '280px',
                          borderRadius: '50%',
                          border: '4px solid var(--border-pencil)',
                          boxShadow: '5px 5px 0px rgba(93,64,55,0.15)',
                          backgroundColor: 'white',
                          padding: '8px',
                          overflow: 'hidden',
                          position: 'relative',
                          transform: `rotate(${polaroidRotation}deg)`,
                          zIndex: 2
                        }}
                      >
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={customImage || `${import.meta.env.BASE_URL.replace(/\/$/, '')}${getProductPhoto()}`} 
                            alt={activeFlavor.name} 
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transform: `scale(${imageZoom}) translate(${imageX}px, ${imageY}px)`,
                              transformOrigin: 'center',
                              transition: 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {frameStyle === 'border' && (
                      /* Double pencil border rectangular photo */
                      <div 
                        style={{
                          width: '90%',
                          height: format === 'post' ? '210px' : '320px',
                          border: '4px double var(--border-pencil)',
                          boxShadow: '5px 5px 0px rgba(93,64,55,0.15)',
                          backgroundColor: 'white',
                          padding: '6px',
                          overflow: 'hidden',
                          position: 'relative',
                          transform: `rotate(${polaroidRotation}deg)`,
                          zIndex: 2
                        }}
                      >
                        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={customImage || `${import.meta.env.BASE_URL.replace(/\/$/, '')}${getProductPhoto()}`} 
                            alt={activeFlavor.name} 
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transform: `scale(${imageZoom}) translate(${imageX}px, ${imageY}px)`,
                              transformOrigin: 'center',
                              transition: 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {frameStyle === 'none' && (
                      /* Borderless/full-width crop */
                      <div 
                        style={{
                          width: '100%',
                          height: format === 'post' ? '220px' : '360px',
                          boxShadow: '0px 4px 10px rgba(93,64,55,0.1)',
                          overflow: 'hidden',
                          position: 'relative',
                          borderRadius: '12px',
                          zIndex: 2
                        }}
                      >
                        <img 
                          src={customImage || `${import.meta.env.BASE_URL.replace(/\/$/, '')}${getProductPhoto()}`} 
                          alt={activeFlavor.name} 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${imageZoom}) translate(${imageX}px, ${imageY}px)`,
                            transformOrigin: 'center',
                            transition: 'none'
                          }}
                        />
                      </div>
                    )}
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
                      marginBottom: '1rem'
                    }}>
                      {activeFlavor.emoji}
                    </div>
                    <h2 
                      className="canvas-flavor-title" 
                      style={{ 
                        color: customAccentColor, 
                        fontFamily: selectedFont.family, 
                        fontSize: `${titleFontSize}rem`, 
                        fontWeight: 'bold' 
                      }}
                    >
                      {customTitle}
                    </h2>
                  </div>
                )}
                
                {/* Text boxes */}
                {customTagline && (
                  <p 
                    className="canvas-flavor-tagline" 
                    style={{ 
                      fontFamily: selectedFont.family, 
                      fontSize: `${taglineFontSize}rem`, 
                      fontWeight: 'bold', 
                      color: isDarkTheme ? '#FFFDF9' : 'var(--text-secondary)',
                      margin: '0.4rem 0'
                    }}
                  >
                    "{customTagline}"
                  </p>
                )}

                {customDesc && displayMode === 'logo' && (
                  <p 
                    className="canvas-flavor-description" 
                    style={{ 
                      fontSize: `${descFontSize}rem`, 
                      color: customTextColor, 
                      opacity: 0.9,
                      fontFamily: selectedFont.family
                    }}
                  >
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
                <div className="canvas-footer" style={{ borderTopColor: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(93, 64, 55, 0.2)', color: customTextColor, fontFamily: 'var(--font-handwritten)', fontSize: '1.4rem' }}>
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
        </div>

        {/* Right Side: Canva Control Panel */}
        <div className="generator-control-panel no-print" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          
          {/* SECTION 1: CONTENT */}
          <h3 className="control-section-title">✍️ Contenido</h3>
          
          <div className="control-group">
            <label>Sabor Base</label>
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
            <label>Tipo de Vista</label>
            <div className="custom-toggle-btn">
              <button 
                className={`custom-toggle-option ${displayMode === 'photo' ? 'active' : ''}`}
                onClick={() => setDisplayMode('photo')}
              >
                📸 Foto Producto
              </button>
              <button 
                className={`custom-toggle-option ${displayMode === 'logo' ? 'active' : ''}`}
                onClick={() => setDisplayMode('logo')}
              >
                🎨 Dibujo / Emoji
              </button>
            </div>
          </div>

          {displayMode === 'photo' && (
            <>
              <div className="control-group">
                <label>Selección de Foto</label>
                <select 
                  value={photoType} 
                  onChange={(e) => {
                    setPhotoType(e.target.value);
                    setCustomImage(null); // Clear custom upload if switching preset photo
                  }}
                  style={{ marginBottom: '0.5rem' }}
                >
                  <option value="slice">📸 Corte Transversal (Sabor Relleno)</option>
                  <option value="wrapped1">🍬 Producto Envuelto (Presentación Grupal)</option>
                  <option value="wrapped2">🍬 Producto Envuelto (Presentación Trío)</option>
                </select>
              </div>

              <div className="control-group">
                <label>Subir Foto Personalizada (Canva)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-primary" 
                    onClick={() => fileInputRef.current.click()}
                    style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.95rem', backgroundColor: 'var(--accent-yellow)', borderColor: 'var(--border-pencil)' }}
                  >
                    📸 Subir Foto Personalizada (Canva Uploader)
                  </button>
                  {customImage && (
                    <button 
                      className="btn-secondary" 
                      onClick={() => setCustomImage(null)}
                      style={{ padding: '0.5rem 0.8rem', color: '#C2185B' }}
                      title="Restaurar foto original"
                    >
                      🔄 Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="control-group">
                <label>Zoom de la Foto ({imageZoom.toFixed(2)}x)</label>
                <input 
                  type="range" 
                  min="1.0" 
                  max="3.0" 
                  step="0.05" 
                  value={imageZoom} 
                  onChange={(e) => setImageZoom(parseFloat(e.target.value))} 
                />
              </div>

              <div className="control-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Mover Horizontal ({imageX}px)</label>
                  <input 
                    type="range" 
                    min="-150" 
                    max="150" 
                    step="2" 
                    value={imageX} 
                    onChange={(e) => setImageX(parseInt(e.target.value))} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Mover Vertical ({imageY}px)</label>
                  <input 
                    type="range" 
                    min="-150" 
                    max="150" 
                    step="2" 
                    value={imageY} 
                    onChange={(e) => setImageY(parseInt(e.target.value))} 
                  />
                </div>
              </div>

              <div className="control-group">
                <label>Rotación del Marco ({polaroidRotation}°)</label>
                <input 
                  type="range" 
                  min="-15" 
                  max="15" 
                  step="1" 
                  value={polaroidRotation} 
                  onChange={(e) => setPolaroidRotation(parseInt(e.target.value))} 
                />
              </div>
            </>
          )}

          <div className="control-group">
            <label>Título del Alfajor</label>
            <input 
              type="text" 
              value={customTitle} 
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label>Eslogan / Frase</label>
            <input 
              type="text" 
              value={customTagline} 
              onChange={(e) => setCustomTagline(e.target.value)} 
            />
          </div>

          {displayMode === 'logo' && (
            <div className="control-group">
              <label>Descripción Corta</label>
              <textarea 
                rows="2" 
                value={customDesc} 
                onChange={(e) => setCustomDesc(e.target.value)} 
              />
            </div>
          )}

          {/* SECTION 2: CANVA STYLE */}
          <h3 className="control-section-title" style={{ marginTop: '1.5rem' }}>🎨 Estilo Canva</h3>

          <div className="control-group">
            <label>Formato de Medios</label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="post">Post Cuadrado (Instagram 1:1)</option>
              <option value="story">Historia Vertical (Story 9:16)</option>
            </select>
          </div>

          <div className="control-group">
            <label>Estilo de Marco de Foto</label>
            <select 
              value={frameStyle} 
              onChange={(e) => setFrameStyle(e.target.value)}
            >
              <option value="polaroid">🖼️ Polaroid Clásica</option>
              <option value="circle">💮 Pegatina Circular (Sticker)</option>
              <option value="border">✍️ Marco Lápiz Doble</option>
              <option value="none">✨ Sin Marco / Minimalista</option>
            </select>
          </div>

          <div className="control-group">
            <label>Pegatina Decorativa (Sticker)</label>
            <select 
              value={stickerText} 
              onChange={(e) => setStickerText(e.target.value)}
            >
              <option value="none">🚫 Ninguna</option>
              <option value="casero">⭐ Casero</option>
              <option value="artesanal">🧸 100% Artesanal</option>
              <option value="hecho_con_amor">❤️ Con Amor</option>
              <option value="receta_casera">✨ Receta Casera</option>
            </select>
          </div>

          <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: 'row', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="doodles-toggle" 
              checked={doodlesEnabled} 
              onChange={(e) => setDoodlesEnabled(e.target.checked)} 
              style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
            />
            <label htmlFor="doodles-toggle" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>🎨 Activar Dibujitos de Fondo</label>
          </div>

          <div className="control-group">
            <label>Tipografía del Texto</label>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {FONT_OPTIONS.map(font => (
                <option key={font.id} value={font.id}>{font.name}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Tamaño del Título ({titleFontSize.toFixed(1)}rem)</label>
            <input 
              type="range" 
              min="1.2" 
              max="4.5" 
              step="0.1" 
              value={titleFontSize} 
              onChange={(e) => setTitleFontSize(parseFloat(e.target.value))} 
            />
          </div>

          <div className="control-group">
            <label>Tamaño del Eslogan ({taglineFontSize.toFixed(1)}rem)</label>
            <input 
              type="range" 
              min="1.0" 
              max="3.5" 
              step="0.1" 
              value={taglineFontSize} 
              onChange={(e) => setTaglineFontSize(parseFloat(e.target.value))} 
            />
          </div>

          <div className="control-group">
            <label>Temas Rápidos</label>
            <div className="color-presets-grid">
              {COLOR_THEMES.map(t => (
                <button
                  key={t.id}
                  className={`color-preset-btn ${customBgColor === t.bg ? 'active' : ''}`}
                  style={{ backgroundColor: t.bg }}
                  title={t.name}
                  onClick={() => handleThemeSelect(t)}
                />
              ))}
            </div>
          </div>

          <div className="control-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Fondo</label>
              <input 
                type="color" 
                value={customBgColor} 
                onChange={(e) => setCustomBgColor(e.target.value)}
                style={{ width: '100%', height: '35px', padding: '1px', cursor: 'pointer', border: '2px solid var(--border-pencil)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Letras</label>
              <input 
                type="color" 
                value={customTextColor} 
                onChange={(e) => setCustomTextColor(e.target.value)}
                style={{ width: '100%', height: '35px', padding: '1px', cursor: 'pointer', border: '2px solid var(--border-pencil)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Detalles</label>
              <input 
                type="color" 
                value={customAccentColor} 
                onChange={(e) => setCustomAccentColor(e.target.value)}
                style={{ width: '100%', height: '35px', padding: '1px', cursor: 'pointer', border: '2px solid var(--border-pencil)' }}
              />
            </div>
          </div>

          <div className="control-group" style={{ flexDirection: 'row', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', textTransform: 'none', letterSpacing: '0', fontSize: '0.85rem' }}>
              <input 
                type="checkbox" 
                checked={showPrice} 
                onChange={(e) => setShowPrice(e.target.checked)} 
                style={{ width: 'auto' }}
              />
              Precio
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', textTransform: 'none', letterSpacing: '0', fontSize: '0.85rem' }}>
              <input 
                type="checkbox" 
                checked={showContact} 
                onChange={(e) => setShowContact(e.target.checked)} 
                style={{ width: 'auto' }}
              />
              Contacto
            </label>
          </div>

          {/* SECTION 3: EXPORT */}
          <h3 className="control-section-title" style={{ marginTop: '1.5rem' }}>💾 Descarga</h3>

          <div className="control-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem' }}>Formato</label>
              <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
                <option value="image/png">PNG transparente</option>
                <option value="image/jpeg">JPG liviano</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem' }}>Resolución</label>
              <select value={downloadScale} onChange={(e) => setDownloadScale(parseInt(e.target.value))}>
                <option value="1">1x (Web)</option>
                <option value="2">2x (Alta Definición)</option>
                <option value="3">3x (Máxima / Impresión)</option>
              </select>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={downloadImage}
            disabled={isDownloading}
            style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isDownloading ? (
              <>⏳ Generando...</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Descargar Publicación
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

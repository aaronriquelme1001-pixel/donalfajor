import React from 'react';

export default function StickerSheet() {
  const stickerCount = 16; // 4x4 grid per page
  const stickers = Array.from({ length: stickerCount });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="stickers-container">
      <div className="content-header no-print">
        <span className="handdrawn-decor-sun" role="img" aria-label="sun">☀️</span>
        <h1 className="content-title">Etiquetas para Envolturas</h1>
        <p className="content-description">
          Imprime tus propias etiquetas adhesivas circulares para sellar los envoltorios. Diseñadas para hojas autoadhesivas tamaño A4/Carta, cada círculo incluye la ilustración de tus tiernos personajes y tu WhatsApp.
        </p>
        <span className="handdrawn-decor-heart" role="img" aria-label="heart">❤️</span>
      </div>

      {/* Control Actions - Hidden on Print */}
      <div className="print-options no-print" style={{ justifyContent: 'center' }}>
        <button 
          className="btn-primary" 
          onClick={handlePrint}
          style={{ backgroundColor: '#4E342E', color: 'white' }}
        >
          🖨️ Imprimir Planilla de Stickers (PDF)
        </button>
      </div>

      {/* Sticker Sheet Preview */}
      <div className="print-preview-container">
        <div className="print-page-a4" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
          
          <div className="sticker-sheet-grid">
            {stickers.map((_, index) => (
              <div key={index} className="circular-sticker">
                <div className="sticker-border-circle">
                  {/* Decorative curved text */}
                  <span className="sticker-decor">★ Casero ★</span>
                  
                  {/* Mascot image - circular crop */}
                  <img 
                    className="sticker-logo-img" 
                    src="/logo.png" 
                    alt="Don Alfajor Mascot Logo" 
                  />

                  {/* Brand name */}
                  <h4 className="sticker-title">Don Alfajor</h4>
                  
                  {/* WhatsApp */}
                  <div className="sticker-whatsapp">
                    <span>979797420</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="no-print" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '10px', fontFamily: 'var(--font-handwritten)' }}>
            Etiquetas circulares de ~55mm. Perfectas para papel adhesivo troquelado o para recortar con tijeras.
          </div>
        </div>
      </div>
    </div>
  );
}

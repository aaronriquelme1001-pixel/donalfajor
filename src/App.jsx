import React, { useState } from 'react';
import InteractiveCatalog from './components/InteractiveCatalog';
import SocialMediaGenerator from './components/SocialMediaGenerator';
import PrintableMenus from './components/PrintableMenus';
import StickerSheet from './components/StickerSheet';

export default function App() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'generator', 'print', 'stickers'

  return (
    <div className="app-container">
      {/* Sidebar Navigation - Hidden on print */}
      <aside className="app-sidebar no-print">
        <div className="brand-section">
          <div className="brand-logo-container">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Don Alfajor Mascot Logo" />
          </div>
          <h2 className="brand-name">Don Alfajor</h2>
          <span className="brand-subtitle">Sabores de Autor 🎨</span>
        </div>

        <nav className="nav-menu">
          <li className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('menu')}>
              <span className="nav-icon" style={{ fontSize: '1.2rem' }}>📱</span>
              <span>Menú Digital</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'generator' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('generator')}>
              <span className="nav-icon" style={{ fontSize: '1.2rem' }}>📸</span>
              <span>Creador de Posts</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'print' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('print')}>
              <span className="nav-icon" style={{ fontSize: '1.2rem' }}>🖨️</span>
              <span>Afiches A4</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'stickers' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('stickers')}>
              <span className="nav-icon" style={{ fontSize: '1.2rem' }}>🏷️</span>
              <span>Stickers Wrapper</span>
            </button>
          </li>
        </nav>

        <div className="nav-footer">
          <div>Haz tu pedido o consulta:</div>
          <div className="nav-footer-phone">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
              <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.473 1.336 4.985l-1.42 5.187 5.311-1.392c1.455.795 3.09 1.213 4.752 1.213 5.506 0 9.989-4.482 9.989-9.99 0-5.507-4.482-9.99-9.989-9.99zm5.727 14.156c-.244.688-1.427 1.348-1.956 1.413-.483.059-.974.1-3.13-.736-2.756-1.07-4.524-3.864-4.662-4.048-.138-.184-1.12-1.488-1.12-2.839 0-1.35.704-2.013.955-2.274.252-.262.551-.328.736-.328.184 0 .368.002.528.01.166.008.388-.063.608.468.225.541.77 1.868.835 2.001.066.133.11.288.02.467-.09.18-.138.288-.276.444-.138.156-.291.348-.414.468-.138.134-.282.28-.12.56.162.28.72 1.185 1.543 1.918.823.733 1.517.96 1.737 1.07.22.11.348.093.478-.057.13-.15.556-.648.704-.87.148-.22.296-.184.499-.11.204.074 1.298.613 1.522.725.225.112.374.168.428.261.054.093.054.542-.19 1.23z"/>
            </svg>
            <span>979797420</span>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="app-content">
        {activeTab === 'menu' && <InteractiveCatalog />}
        {activeTab === 'generator' && <SocialMediaGenerator />}
        {activeTab === 'print' && <PrintableMenus />}
        {activeTab === 'stickers' && <StickerSheet />}
      </main>
    </div>
  );
}

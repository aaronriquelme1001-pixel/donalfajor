import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Image, Printer, Tag, Phone, Sun, Moon } from 'lucide-react';
import InteractiveCatalog from './components/InteractiveCatalog';
import SocialMediaGenerator from './components/SocialMediaGenerator';
import PrintableMenus from './components/PrintableMenus';
import StickerSheet from './components/StickerSheet';

export default function App() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'generator', 'print', 'stickers'
  const [darkMode, setDarkMode] = useState(false);

  const navItems = [
    { id: 'menu', icon: Smartphone, label: 'Menú Digital', emoji: '📱' },
    { id: 'generator', icon: Image, label: 'Creador de Posts', emoji: '📸' },
    { id: 'print', icon: Printer, label: 'Afiches A4', emoji: '🖨️' },
    { id: 'stickers', icon: Tag, label: 'Stickers Wrapper', emoji: '🏷️' },
  ];

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar Navigation - Hidden on print */}
      <aside className="app-sidebar no-print">
        <div className="brand-section">
          <motion.div 
            className="brand-logo-container"
            whileHover={{ rotate: -8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Don Alfajor Mascot Logo" />
          </motion.div>
          <h2 className="brand-name">Don Alfajor</h2>
          <span className="brand-subtitle">Sabores de Autor 🎨</span>
          
          {/* Dark Mode Toggle */}
          <motion.button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <motion.li 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <button onClick={() => setActiveTab(item.id)}>
                <span className="nav-icon">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            </motion.li>
          ))}
        </nav>

        <div className="nav-footer">
          <div>Haz tu pedido o consulta:</div>
          <div className="nav-footer-phone">
            <Phone size={16} />
            <span>979797420</span>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="app-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'menu' && <InteractiveCatalog />}
            {activeTab === 'generator' && <SocialMediaGenerator />}
            {activeTab === 'print' && <PrintableMenus />}
            {activeTab === 'stickers' && <StickerSheet />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

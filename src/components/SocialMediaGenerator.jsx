import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, Download, Palette, Type, 
  Layout, Settings, Sparkles, Upload, X, 
  Check, RotateCw, ZoomIn, Move, Edit3
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { useFlavors } from '../hooks/useFlavors';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

// Will be populated dynamically from useFlavors
let GALLERY_PRESET = [
  { id: 'wrapped-1', label: 'Envueltos 1', src: '/assets/flavors/wrapped-1.png' },
  { id: 'wrapped-2', label: 'Envueltos 2', src: '/assets/flavors/wrapped-2.png' },
];

const COLOR_THEMES = [
  { id: 'cream',  bg: '#FDFBF7', text: '#5D4037', accent: '#D37B57' },
  { id: 'pink',   bg: '#FFF0F0', text: '#5D4037', accent: '#F98F8F' },
  { id: 'blue',   bg: '#F0F8FA', text: '#5D4037', accent: '#82C3C9' },
  { id: 'yellow', bg: '#FFFDE7', text: '#5D4037', accent: '#FBC02D' },
  { id: 'cocoa',  bg: '#4E342E', text: '#FFFDF9', accent: '#FFF176' },
];

const FONTS = [
  { id: 'fredoka',     name: 'Redondeada (Fredoka)',   family: 'var(--font-heading)' },
  { id: 'handwritten', name: 'Mano Alzada (Gaegu)',     family: 'var(--font-handwritten)' },
  { id: 'caveat',      name: 'Cursiva Tierna (Caveat)', family: "'Caveat', cursive" },
];

const CW = 400;

function buildElements(flavor, format, theme) {
  const isPost = format === 'post';
  const ch = isPost ? 430 : 730;
  return [
    { id: 'photo', type: 'image', src: flavor.image, frameStyle: 'polaroid',
      zoom: 1, panX: 0, panY: 0, rotation: -2,
      x: isPost ? 70 : 60, y: isPost ? 65 : 95,
      width: isPost ? 260 : 280, height: isPost ? 205 : 350 },
    { id: 'logo', type: 'logo', x: 12, y: 12, size: 52 },
    { id: 'brand', type: 'text', content: 'Don Alfajor',
      x: 72, y: 14, width: 220, fontSize: 22,
      fontFamily: 'var(--font-heading)', color: theme.text, bold: true, textAlign: 'left' },
    { id: 'brand-sub', type: 'text', content: 'Sabores de Autor',
      x: 72, y: 40, width: 220, fontSize: 13,
      fontFamily: 'var(--font-handwritten)', color: theme.accent, bold: false, textAlign: 'left' },
    { id: 'title', type: 'text', content: flavor.name,
      x: 16, y: isPost ? 292 : 472, width: CW - 32,
      fontSize: isPost ? 28 : 36, fontFamily: 'var(--font-heading)',
      color: theme.text, bold: true, textAlign: 'center' },
    { id: 'tagline', type: 'text', content: flavor.tagline,
      x: 16, y: isPost ? 332 : 524, width: CW - 32,
      fontSize: isPost ? 15 : 20, fontFamily: 'var(--font-heading)',
      color: theme.accent, bold: false, textAlign: 'center' },
    { id: 'price', type: 'pill', content: '$1.000 c/u',
      x: isPost ? 140 : 130, y: isPost ? 368 : 604,
      width: 120, height: 34, fontSize: 15, color: '#5D4037', bg: '#FBC02D' },
    { id: 'footer', type: 'text', content: 'Don Alfajor  |  979797420',
      x: 16, y: isPost ? ch - 38 : ch - 50, width: CW - 32,
      fontSize: 11, fontFamily: 'var(--font-heading)',
      color: theme.text, bold: false, textAlign: 'center' },
  ];
}

function CanvasEl({ el, isSelected, isEditing, onPointerDown, onResizeStart, onDoubleClick, onChange }) {
  const wrap = {
    position: 'absolute', left: el.x, top: el.y,
    width: el.type === 'logo' ? el.size : el.width,
    height: ['image','pill','logo'].includes(el.type)
      ? (el.type === 'logo' ? el.size : el.height) : undefined,
    cursor: 'pointer', zIndex: isSelected ? 100 : 1,
    outline: isSelected ? '2px dashed #2196F3' : 'none',
    outlineOffset: '3px', boxSizing: 'border-box', touchAction: 'none',
  };

  const Handles = isSelected ? (
    ['tl','tr','bl','br'].map(p => {
      const s = {
        position: 'absolute', width: 12, height: 12,
        background: '#2196F3', border: '2px solid white', borderRadius: 3, zIndex: 102,
        cursor: (p === 'tl' || p === 'br') ? 'nwse-resize' : 'nesw-resize',
      };
      if (p === 'tl') { s.top = -6; s.left = -6; }
      if (p === 'tr') { s.top = -6; s.right = -6; }
      if (p === 'bl') { s.bottom = -6; s.left = -6; }
      if (p === 'br') { s.bottom = -6; s.right = -6; }
      return <div key={p} style={s} onPointerDown={(e) => { e.stopPropagation(); onResizeStart(e, p); }} />;
    })
  ) : null;

  if (el.type === 'text') {
    const ts = {
      fontSize: el.fontSize, fontFamily: el.fontFamily, color: el.color,
      fontWeight: el.bold ? 'bold' : 'normal', textAlign: el.textAlign,
      lineHeight: 1.25, width: '100%', wordBreak: 'break-word',
    };
    return (
      <div style={wrap} onPointerDown={onPointerDown} onDoubleClick={onDoubleClick}>
        {isEditing
          ? <div contentEditable suppressContentEditableWarning autoFocus
              style={{ ...ts, outline: 'none', minHeight: '1em', cursor: 'text' }}
              onBlur={(e) => onChange({ content: e.target.innerText })}
            >{el.content}</div>
          : <div style={{ ...ts, pointerEvents: 'none' }}>{el.content}</div>}
        {Handles}
      </div>
    );
  }

  if (el.type === 'pill') {
    return (
      <div style={wrap} onPointerDown={onPointerDown} onDoubleClick={onDoubleClick}>
        <div style={{
          width: '100%', height: '100%', background: el.bg, borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: el.fontSize, fontFamily: 'var(--font-heading)',
          color: el.color, fontWeight: 'bold', border: '2px solid rgba(93,64,55,0.3)',
        }}>
          {isEditing
            ? <span contentEditable suppressContentEditableWarning autoFocus
                style={{ outline: 'none', minWidth: 20 }}
                onBlur={(e) => onChange({ content: e.target.innerText })}
              >{el.content}</span>
            : el.content}
        </div>
        {Handles}
      </div>
    );
  }

  if (el.type === 'image') {
    const imgSrc = el.src?.startsWith('data:') ? el.src : BASE + el.src;
    const imgStyle = {
      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
      transform: 'scale(' + (el.zoom||1) + ') translate(' + (el.panX||0) + 'px,' + (el.panY||0) + 'px)',
      transformOrigin: 'center',
    };
    let inner;
    if (el.frameStyle === 'polaroid') {
      inner = (
        <div style={{
          background: 'white', padding: '7px 7px 26px 7px',
          boxShadow: '4px 4px 12px rgba(93,64,55,0.25)',
          border: '3px solid #5D4037',
          transform: 'rotate(' + (el.rotation||0) + 'deg)',
          width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
        }}>
          <div style={{ width: '100%', height: 'calc(100% - 20px)', overflow: 'hidden' }}>
            <img src={imgSrc} alt="" style={imgStyle} />
          </div>
        </div>
      );
    } else if (el.frameStyle === 'circle') {
      inner = (
        <div style={{ borderRadius: '50%', overflow: 'hidden', border: '4px solid #5D4037', width: '100%', height: '100%', boxSizing: 'border-box' }}>
          <img src={imgSrc} alt="" style={imgStyle} />
        </div>
      );
    } else {
      inner = (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 10 }}>
          <img src={imgSrc} alt="" style={imgStyle} />
        </div>
      );
    }
    return (
      <div style={wrap} onPointerDown={onPointerDown} onDoubleClick={onDoubleClick}>
        {inner}{Handles}
      </div>
    );
  }

  if (el.type === 'logo') {
    return (
      <div style={{ ...wrap, borderRadius: '50%', overflow: 'hidden', border: '2px solid #5D4037', background: 'white' }}
        onPointerDown={onPointerDown}>
        <img src={BASE + '/logo.png'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {Handles}
      </div>
    );
  }
  return null;
}

export default function SocialMediaGenerator() {
  const { flavors, loading } = useFlavors();
  const [selectedFlavorId, setSelectedFlavorId] = useState('');
  const [format, setFormat]     = useState('post');
  const [bgColor, setBgColor]   = useState(COLOR_THEMES[0].bg);
  const [doodles, setDoodles]   = useState(true);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId]   = useState(null);
  const [downloadFormat, setDownloadFormat] = useState('image/png');
  const [downloadScale, setDownloadScale]   = useState(2);
  const [isDownloading, setIsDownloading]   = useState(false);
  const [customGallery, setCustomGallery]   = useState([]);
  const [activeControlPanel, setActiveControlPanel] = useState('flavor');

  const canvasRef    = useRef(null);
  const fileInputRef = useRef(null);
  const dragRef      = useRef(null);

  // Update gallery preset when flavors load
  useEffect(() => {
    if (flavors.length > 0) {
      GALLERY_PRESET = [
        { id: 'wrapped-1', label: 'Envueltos 1', src: '/assets/flavors/wrapped-1.png' },
        { id: 'wrapped-2', label: 'Envueltos 2', src: '/assets/flavors/wrapped-2.png' },
        ...flavors.map(f => ({ id: f.id, label: f.name, src: f.image })),
      ];
      if (!selectedFlavorId) {
        setSelectedFlavorId(flavors[0].id);
      }
    }
  }, [flavors, selectedFlavorId]);

  const activeFlavor = flavors.find(f => f.id === selectedFlavorId) || flavors[0];
  const canvasH      = format === 'post' ? 430 : 730;

  useEffect(() => {
    const theme = COLOR_THEMES[0];
    setElements(buildElements(activeFlavor, format, theme));
    setBgColor(theme.bg);
    setSelectedId(null);
    setEditingId(null);
  }, [selectedFlavorId, format]); // eslint-disable-line

  const updateEl = useCallback((id, updates) =>
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  , []);

  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const o  = d.orig;
      if (d.type === 'move') { updateEl(d.id, { x: o.x + dx, y: o.y + dy }); return; }
      if (o.type === 'text' || o.type === 'pill') {
        const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        updateEl(d.id, { fontSize: Math.max(8, o.fontSize + delta * 0.18) });
        return;
      }
      if (o.type === 'logo') { updateEl(d.id, { size: Math.max(28, o.size + (dx+dy)*0.5) }); return; }
      if (o.type === 'image') {
        let nx=o.x, ny=o.y, nw=o.width, nh=o.height;
        const h = d.handle;
        if (h === 'br') { nw=Math.max(60,o.width+dx);  nh=Math.max(60,o.height+dy); }
        if (h === 'bl') { nw=Math.max(60,o.width-dx);  nh=Math.max(60,o.height+dy);  nx=o.x+dx; }
        if (h === 'tr') { nw=Math.max(60,o.width+dx);  nh=Math.max(60,o.height-dy);  ny=o.y+dy; }
        if (h === 'tl') { nw=Math.max(60,o.width-dx);  nh=Math.max(60,o.height-dy);  nx=o.x+dx; ny=o.y+dy; }
        updateEl(d.id, { width:nw, height:nh, x:nx, y:ny });
      }
    };
    const onUp = () => { dragRef.current = null; };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
  }, [updateEl]);

  const handleElPointerDown = (e, id) => {
    if (editingId === id) return;
    e.stopPropagation(); e.preventDefault();
    setSelectedId(id);
    const el = elements.find(el => el.id === id);
    dragRef.current = { type: 'move', id, startX: e.clientX, startY: e.clientY, orig: { ...el } };
  };

  const handleResizeStart = (e, id, handle) => {
    e.stopPropagation(); e.preventDefault();
    const el = elements.find(el => el.id === id);
    dragRef.current = { type: 'resize', id, handle, startX: e.clientX, startY: e.clientY, orig: { ...el } };
  };

  const applyTheme = (t) => {
    setBgColor(t.bg);
    setElements(prev => prev.map(el => {
      if (['brand','title','footer'].includes(el.id)) return { ...el, color: t.text };
      if (['brand-sub','tagline'].includes(el.id))    return { ...el, color: t.accent };
      return el;
    }));
  };

  const applyFont = (family) =>
    setElements(prev => prev.map(el => el.type === 'text' ? { ...el, fontFamily: family } : el));

  const applyGalleryImage = (src) => {
    const sel    = elements.find(el => el.id === selectedId && el.type === 'image');
    const target = sel || elements.find(el => el.type === 'image');
    if (target) updateEl(target.id, { src });
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setCustomGallery(prev => [...prev, { id: 'custom-' + Date.now(), label: file.name, src: dataUrl, isCustom: true }]);
      applyGalleryImage(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const downloadImage = async () => {
    if (!canvasRef.current || isDownloading) return;
    setEditingId(null); setSelectedId(null);
    setIsDownloading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      const canvas = await html2canvas(canvasRef.current, {
        scale: downloadScale, useCORS: true, allowTaint: true, backgroundColor: bgColor,
      });
      const ext  = downloadFormat === 'image/jpeg' ? 'jpg' : 'png';
      const link = document.createElement('a');
      link.download = 'don_alfajor_' + activeFlavor.id + '_' + format + '.' + ext;
      link.href = canvas.toDataURL(downloadFormat, 0.95);
      link.click();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al generar la imagen.');
    } finally {
      setIsDownloading(false);
    }
  };

  const allGallery = [...GALLERY_PRESET, ...customGallery];
  const selectedEl = elements.find(el => el.id === selectedId);
  const isDark     = bgColor === '#4E342E';

  if (loading) {
    return (
      <div className="generator-container" style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Cargando sabores...</p>
      </div>
    );
  }

  return (
    <div className="generator-container">
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
        <h1 className="content-title">Creador de Publicaciones</h1>
        <p className="content-description">
          Clic para seleccionar · Doble clic para editar texto · Arrastra para mover · Esquinas azules para redimensionar · Galería de fotos incluida
        </p>
        <motion.div 
          className="handdrawn-decor-heart"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Edit3 size={24} className="text-pink-400" />
        </motion.div>
      </motion.div>

      <div className="generator-layout">
        <motion.div 
          className="generator-preview-panel no-print"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="format-selector">
            {[
              { id: 'post', label: 'Post Cuadrado', icon: Layout },
              { id: 'story', label: 'Historia Vertical', icon: ImageIcon }
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                className={`format-btn ${format === id ? 'active' : ''}`}
                onClick={() => setFormat(id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>

          <div
            ref={canvasRef}
            style={{
              position:'relative', width:CW, height:canvasH,
              backgroundColor:bgColor, borderRadius:14, overflow:'hidden',
              border: '4px solid ' + (isDark ? '#FFFDF9' : '#5D4037'),
              boxSizing:'border-box', flexShrink:0,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) { setSelectedId(null); setEditingId(null); } }}
          >
            {doodles && (
              <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
                <span style={{ position:'absolute', top:'4%',  left:'5%',  fontSize:'1.8rem', opacity:0.1, transform:'rotate(-10deg)' }}>☀️</span>
                <span style={{ position:'absolute', top:'4%',  right:'5%', fontSize:'2rem',   opacity:0.1, transform:'rotate(10deg)'  }}>☁️</span>
                <span style={{ position:'absolute', bottom:'14%', left:'4%',  fontSize:'1.5rem', opacity:0.1 }}>⭐</span>
                <span style={{ position:'absolute', bottom:'14%', right:'4%', fontSize:'1.2rem', opacity:0.1 }}>❤️</span>
              </div>
            )}
            {elements.map(el => (
              <CanvasEl
                key={el.id} el={el}
                isSelected={selectedId === el.id}
                isEditing={editingId === el.id}
                onPointerDown={(e) => handleElPointerDown(e, el.id)}
                onResizeStart={(e, h) => handleResizeStart(e, el.id, h)}
                onDoubleClick={() => setEditingId(el.id)}
                onChange={(upd) => updateEl(el.id, upd)}
              />
            ))}
          </div>

          {selectedEl && (
            <motion.div 
              className="canvas-hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selectedEl.type === 'image'
                ? '📸 Foto seleccionada — elige una imagen de la galería para cambiarla'
                : selectedEl.type === 'text'
                ? '✏️ Doble clic para editar · Arrastra para mover · Esquinas para tamaño'
                : '🤏 Arrastra para mover · Esquinas para redimensionar'}
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className="generator-control-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="control-tabs">
            {[
              { id: 'flavor', label: 'Sabor', icon: Sparkles },
              { id: 'gallery', label: 'Fotos', icon: ImageIcon },
              { id: 'style', label: 'Estilo', icon: Palette },
              { id: 'element', label: 'Elemento', icon: Settings },
              { id: 'export', label: 'Exportar', icon: Download }
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                className={`control-tab ${activeControlPanel === id ? 'active' : ''}`}
                onClick={() => setActiveControlPanel(id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeControlPanel === 'flavor' && (
              <motion.div
                key="flavor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="control-content"
              >
                <div className="control-group">
                  <label>Seleccionar Sabor</label>
                  <select value={selectedFlavorId} onChange={(e) => setSelectedFlavorId(e.target.value)}>
                    {flavors.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {activeControlPanel === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="control-content"
              >
                <p className="control-hint">
                  {selectedEl?.type === 'image'
                    ? 'Clic en miniatura para cambiar la foto'
                    : 'Selecciona la foto en el canvas, luego elige aquí'}
                </p>
                <div className="photo-gallery-grid">
                  {allGallery.map(img => {
                    const thumb = img.isCustom ? img.src : BASE + img.src;
                    return (
                      <motion.div 
                        key={img.id} 
                        className="photo-gallery-thumb"
                        onClick={() => applyGalleryImage(img.isCustom ? img.src : img.src)}
                        title={img.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={thumb} alt={img.label}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                          onError={(e) => { e.target.style.display='none'; }} />
                      </motion.div>
                    );
                  })}
                  <motion.div 
                    className="photo-gallery-thumb photo-gallery-upload"
                    onClick={() => fileInputRef.current?.click()} 
                    title="Subir nueva foto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload size={24} />
                    <span>Subir</span>
                  </motion.div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleGalleryUpload} />
              </motion.div>
            )}

            {activeControlPanel === 'style' && (
              <motion.div
                key="style"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="control-content"
              >
                <div className="control-group">
                  <label>Temas Rápidos</label>
                  <div className="theme-colors">
                    {COLOR_THEMES.map(t => (
                      <motion.div 
                        key={t.id} 
                        onClick={() => applyTheme(t)} 
                        title={t.id}
                        className={`theme-color ${bgColor === t.bg ? 'active' : ''}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{ background: t.bg }}
                      />
                    ))}
                  </div>
                </div>
                <div className="control-group">
                  <label>Color de Fondo</label>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Fuente Global</label>
                  <select onChange={(e) => applyFont(e.target.value)}>
                    {FONTS.map(f => <option key={f.id} value={f.family}>{f.name}</option>)}
                  </select>
                </div>
                <div className="control-group">
                  <label>Decoración</label>
                  <div className="checkbox-wrapper">
                    <input type="checkbox" id="doodles-t" checked={doodles}
                      onChange={(e) => setDoodles(e.target.checked)} />
                    <label htmlFor="doodles-t">Dibujitos de fondo</label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeControlPanel === 'element' && (
              <motion.div
                key="element"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="control-content"
              >
                {!selectedEl ? (
                  <p className="control-hint">Selecciona un elemento en el canvas para editarlo</p>
                ) : selectedEl.type === 'text' ? (
                  <>
                    <div className="control-group">
                      <label>Color</label>
                      <input type="color" value={selectedEl.color}
                        onChange={(e) => updateEl(selectedEl.id, { color: e.target.value })} />
                    </div>
                    <div className="control-group">
                      <label>Tamaño ({Math.round(selectedEl.fontSize)}px)</label>
                      <input type="range" min="8" max="80" value={selectedEl.fontSize}
                        onChange={(e) => updateEl(selectedEl.id, { fontSize: Number(e.target.value) })} />
                    </div>
                    <div className="control-group">
                      <label>Alineación</label>
                      <div className="text-align-buttons">
                        {['left','center','right'].map(a => (
                          <motion.button
                            key={a}
                            className={`align-btn ${selectedEl.textAlign === a ? 'active' : ''}`}
                            onClick={() => updateEl(selectedEl.id, { textAlign: a })}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {a === 'left' ? 'Izquierda' : a === 'center' ? 'Centro' : 'Derecha'}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="control-group">
                      <label>Estilo</label>
                      <motion.button
                        className={`bold-btn ${selectedEl.bold ? 'active' : ''}`}
                        onClick={() => updateEl(selectedEl.id, { bold: !selectedEl.bold })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Type size={16} />
                        <span>Negrita</span>
                      </motion.button>
                    </div>
                  </>
                ) : selectedEl.type === 'image' ? (
                  <>
                    <div className="control-group">
                      <label>Marco</label>
                      <select value={selectedEl.frameStyle}
                        onChange={(e) => updateEl(selectedEl.id, { frameStyle: e.target.value })}>
                        <option value="polaroid">Polaroid</option>
                        <option value="circle">Circular</option>
                        <option value="plain">Sin Marco</option>
                      </select>
                    </div>
                    <div className="control-group">
                      <label>Zoom ({(selectedEl.zoom||1).toFixed(1)}x)</label>
                      <input type="range" min="1" max="3" step="0.05" value={selectedEl.zoom||1}
                        onChange={(e) => updateEl(selectedEl.id, { zoom: Number(e.target.value) })} />
                    </div>
                    <div className="control-group">
                      <label>Pan Horizontal ({selectedEl.panX||0}px)</label>
                      <input type="range" min="-120" max="120" value={selectedEl.panX||0}
                        onChange={(e) => updateEl(selectedEl.id, { panX: Number(e.target.value) })} />
                    </div>
                    <div className="control-group">
                      <label>Pan Vertical ({selectedEl.panY||0}px)</label>
                      <input type="range" min="-120" max="120" value={selectedEl.panY||0}
                        onChange={(e) => updateEl(selectedEl.id, { panY: Number(e.target.value) })} />
                    </div>
                    {selectedEl.frameStyle === 'polaroid' && (
                      <div className="control-group">
                        <label>Rotación ({selectedEl.rotation||0}°)</label>
                        <input type="range" min="-15" max="15" value={selectedEl.rotation||0}
                          onChange={(e) => updateEl(selectedEl.id, { rotation: Number(e.target.value) })} />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="control-hint">Tipo de elemento no soportado</p>
                )}
              </motion.div>
            )}

            {activeControlPanel === 'export' && (
              <motion.div
                key="export"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="control-content"
              >
                <div className="control-group">
                  <label>Formato</label>
                  <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPG</option>
                  </select>
                </div>
                <div className="control-group">
                  <label>Resolución</label>
                  <select value={downloadScale} onChange={(e) => setDownloadScale(Number(e.target.value))}>
                    <option value={1}>Normal (1x)</option>
                    <option value={2}>HD (2x)</option>
                    <option value={3}>Super HD (3x)</option>
                  </select>
                </div>
                <motion.button 
                  className="btn-download-canva" 
                  onClick={downloadImage} 
                  disabled={isDownloading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isDownloading ? (
                    <>
                      <RotateCw size={18} className="animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Descargar {downloadFormat === 'image/png' ? 'PNG' : 'JPG'}</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { flavors } from '../data/flavors';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

const GALLERY_PRESET = [
  { id: 'wrapped-1', label: 'Envueltos 1', src: '/assets/flavors/wrapped-1.png' },
  { id: 'wrapped-2', label: 'Envueltos 2', src: '/assets/flavors/wrapped-2.png' },
  ...flavors.map(f => ({ id: f.id, label: f.name, src: f.image })),
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
  const [selectedFlavorId, setSelectedFlavorId] = useState(flavors[0].id);
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

  const canvasRef    = useRef(null);
  const fileInputRef = useRef(null);
  const dragRef      = useRef(null);

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

  return (
    <div className="generator-container">
      <div className="content-header">
        <span className="handdrawn-decor-sun" role="img" aria-label="sun">☀️</span>
        <h1 className="content-title">Creador de Publicaciones</h1>
        <p className="content-description">
          Clic para seleccionar · Doble clic para editar texto · Arrastra para mover · Esquinas azules para redimensionar · Galeria de fotos incluida
        </p>
        <span className="handdrawn-decor-heart" role="img" aria-label="heart">❤️</span>
      </div>

      <div className="generator-layout">
        <div className="generator-preview-panel no-print">
          <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem', justifyContent:'center' }}>
            {[['post','📷 Post Cuadrado'],['story','📱 Historia Vertical']].map(([val,lbl]) => (
              <button key={val}
                className={'quick-filter-btn' + (format === val ? ' active' : '')}
                onClick={() => setFormat(val)}>{lbl}</button>
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
            <div className="canvas-hint">
              {selectedEl.type === 'image'
                ? '📸 Foto seleccionada — elige una imagen de la galeria para cambiarla'
                : selectedEl.type === 'text'
                ? '✏️ Doble clic para editar · Arrastra para mover · Esquinas para tamaño'
                : '🤏 Arrastra para mover · Esquinas para redimensionar'}
            </div>
          )}
        </div>

        <div className="generator-control-panel">
          <div className="control-section-title">🍬 Sabor Base</div>
          <div className="control-group">
            <select value={selectedFlavorId} onChange={(e) => setSelectedFlavorId(e.target.value)}>
              {flavors.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
            </select>
          </div>

          <div className="control-section-title">📸 Galeria de Fotos</div>
          <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', margin:'-0.25rem 0 0.5rem' }}>
            {selectedEl?.type === 'image'
              ? 'Clic en miniatura para cambiar la foto'
              : 'Selecciona la foto en el canvas, luego elige aqui'}
          </p>
          <div className="photo-gallery-grid">
            {allGallery.map(img => {
              const thumb = img.isCustom ? img.src : BASE + img.src;
              return (
                <div key={img.id} className="photo-gallery-thumb"
                  onClick={() => applyGalleryImage(img.isCustom ? img.src : img.src)}
                  title={img.label}>
                  <img src={thumb} alt={img.label}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={(e) => { e.target.style.display='none'; }} />
                </div>
              );
            })}
            <div className="photo-gallery-thumb photo-gallery-upload"
              onClick={() => fileInputRef.current?.click()} title="Subir nueva foto">
              <span style={{ fontSize:'1.5rem', lineHeight:1 }}>+</span>
              <span style={{ fontSize:'0.6rem', marginTop:3 }}>Subir</span>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleGalleryUpload} />

          <div className="control-section-title">🎨 Fondo y Colores</div>
          <div className="control-group">
            <label>Temas Rapidos</label>
            <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
              {COLOR_THEMES.map(t => (
                <div key={t.id} onClick={() => applyTheme(t)} title={t.id}
                  style={{
                    width:28, height:28, borderRadius:'50%', background:t.bg,
                    border: bgColor === t.bg ? '3px solid #2196F3' : '2px solid #5D4037',
                    cursor:'pointer', flexShrink:0,
                  }} />
              ))}
            </div>
          </div>
          <div className="control-group">
            <label>Color de Fondo</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              style={{ width:'100%', height:36, border:'none', borderRadius:8, cursor:'pointer' }} />
          </div>

          <div className="control-section-title">Tipografia</div>
          <div className="control-group">
            <label>Fuente Global</label>
            <select onChange={(e) => applyFont(e.target.value)}>
              {FONTS.map(f => <option key={f.id} value={f.family}>{f.name}</option>)}
            </select>
          </div>

          {selectedEl?.type === 'text' && (
            <>
              <div className="control-section-title">Texto Seleccionado</div>
              <div className="control-group">
                <label>Color</label>
                <input type="color" value={selectedEl.color}
                  onChange={(e) => updateEl(selectedEl.id, { color: e.target.value })}
                  style={{ width:'100%', height:36, border:'none', borderRadius:8, cursor:'pointer' }} />
              </div>
              <div className="control-group">
                <label>Tamaño ({Math.round(selectedEl.fontSize)}px)</label>
                <input type="range" min="8" max="80" value={selectedEl.fontSize}
                  onChange={(e) => updateEl(selectedEl.id, { fontSize: Number(e.target.value) })} />
              </div>
              <div className="control-group">
                <div style={{ display:'flex', gap:'0.4rem' }}>
                  <button
                    style={{ flex:1, padding:'0.4rem', borderRadius:6, border:'2px solid var(--border-pencil)',
                      background: selectedEl.bold ? '#FBC02D' : 'white',
                      fontWeight:'bold', cursor:'pointer' }}
                    onClick={() => updateEl(selectedEl.id, { bold: !selectedEl.bold })}>B</button>
                  {['left','center','right'].map(a => (
                    <button key={a}
                      style={{ flex:1, padding:'0.4rem', borderRadius:6, border:'2px solid var(--border-pencil)',
                        background: selectedEl.textAlign === a ? '#FBC02D' : 'white',
                        cursor:'pointer', fontSize:'0.7rem' }}
                      onClick={() => updateEl(selectedEl.id, { textAlign: a })}>
                      {a === 'left' ? 'Iz' : a === 'center' ? 'Ce' : 'De'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedEl?.type === 'image' && (
            <>
              <div className="control-section-title">Foto Seleccionada</div>
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
                  <label>Rotacion ({selectedEl.rotation||0} grados)</label>
                  <input type="range" min="-15" max="15" value={selectedEl.rotation||0}
                    onChange={(e) => updateEl(selectedEl.id, { rotation: Number(e.target.value) })} />
                </div>
              )}
            </>
          )}

          <div className="control-section-title">Decoracion</div>
          <div className="control-group" style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexDirection:'row' }}>
            <input type="checkbox" id="doodles-t" checked={doodles}
              onChange={(e) => setDoodles(e.target.checked)}
              style={{ width:'auto', margin:0, cursor:'pointer' }} />
            <label htmlFor="doodles-t" style={{ margin:0, cursor:'pointer', fontSize:'0.9rem' }}>Dibujitos de fondo</label>
          </div>

          <div className="control-section-title">Descargar</div>
          <div className="control-group">
            <label>Formato</label>
            <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
            </select>
          </div>
          <div className="control-group">
            <label>Resolucion</label>
            <select value={downloadScale} onChange={(e) => setDownloadScale(Number(e.target.value))}>
              <option value={1}>Normal (1x)</option>
              <option value={2}>HD (2x)</option>
              <option value={3}>Super HD (3x)</option>
            </select>
          </div>
          <button className="btn-download-canva" onClick={downloadImage} disabled={isDownloading}
            style={{ width:'100%', marginTop:'0.5rem' }}>
            {isDownloading ? 'Generando...' : 'Descargar ' + (downloadFormat === 'image/png' ? 'PNG' : 'JPG')}
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { flavors } from '../data/flavors';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

// Gallery of all product images available for swapping
const GALLERY = [
  { id: 'wrapped-1', label: 'Envueltos 1', src: '/assets/flavors/wrapped-1.png' },
  { id: 'wrapped-2', label: 'Envueltos 2', src: '/assets/flavors/wrapped-2.png' },
  ...flavors.map(f => ({ id: f.id, label: f.name, src: f.image })),
];

// Editable text component - click to edit inline
function ET({ children, style, tag: Tag = 'span', editMode, className }) {
  const [val, setVal] = useState(children);
  const ref = useRef(null);
  if (!editMode) return <Tag className={className} style={style}>{val}</Tag>;
  return (
    <Tag
      className={className}
      contentEditable
      suppressContentEditableWarning
      ref={ref}
      style={{
        ...style,
        outline: '2px dashed #2196F3',
        outlineOffset: '2px',
        borderRadius: '3px',
        cursor: 'text',
        minWidth: '1ch',
        display: 'inline-block',
      }}
      onBlur={(e) => setVal(e.target.innerText)}
    >{val}</Tag>
  );
}

// Editable image component - shows gallery picker in edit mode (uses portal to escape overflow:hidden)
function EImg({ src, alt, style, editMode, onChangeSrc, customGallery }) {
  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const overlayRef = useRef(null);
  const fileRef = useRef(null);
  const [curSrc, setCurSrc] = useState(src);

  const select = (newSrc) => {
    setCurSrc(newSrc);
    onChangeSrc?.(newSrc);
    setOpen(false);
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    if (overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + window.scrollY + 6,
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 230),
      });
    }
    setOpen(v => !v);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const timer = setTimeout(() => document.addEventListener('pointerdown', close), 50);
    return () => { clearTimeout(timer); document.removeEventListener('pointerdown', close); };
  }, [open]);

  const allGallery = [...GALLERY, ...(customGallery || [])];

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%', height: '100%' }}>
      <img
        src={curSrc?.startsWith('data:') ? curSrc : BASE + curSrc}
        alt={alt}
        style={style}
        onError={(e) => { e.target.style.opacity = '0.3'; }}
      />
      {editMode && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(33,150,243,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', borderRadius: 6,
            border: '2px dashed #2196F3',
            fontSize: '0.72rem', fontWeight: 'bold', color: '#1565C0',
            textAlign: 'center',
          }}
        >
          📷 Cambiar
        </div>
      )}
      {open && ReactDOM.createPortal(
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: popupPos.top,
            left: popupPos.left,
            zIndex: 99999,
            background: 'white',
            border: '2px solid #2196F3',
            borderRadius: 12,
            padding: '0.6rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 58px)',
            gap: '0.35rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
            maxHeight: '260px',
            overflowY: 'auto',
            width: '220px',
          }}
        >
          {allGallery.map(img => {
            const thumb = img.isCustom ? img.src : BASE + img.src;
            return (
              <div key={img.id}
                onClick={() => select(img.isCustom ? img.src : img.src)}
                title={img.label}
                style={{
                  width: 58, height: 58, borderRadius: 8, overflow: 'hidden',
                  cursor: 'pointer', border: '2px solid transparent',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2196F3'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <img src={thumb} alt={img.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display='none'; }} />
              </div>
            );
          })}
          <div onClick={() => fileRef.current?.click()}
            style={{
              width: 58, height: 58, borderRadius: 8,
              border: '2px dashed #2196F3',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '0.6rem', color: '#2196F3',
              background: '#f0f8ff',
            }}
          >
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>+</span>
            <span>Subir</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = (ev) => select(ev.target.result);
              reader.readAsDataURL(f);
              e.target.value = '';
            }} />
        </div>,
        document.body
      )}
    </div>
  );
}


export default function PrintableMenus() {
  const [activeLayout, setActiveLayout] = useState('full-menu');
  const [editMode, setEditMode] = useState(false);
  const [customGallery] = useState([]);

  const classics = flavors.filter(f => f.category === 'classics');
  const fruit    = flavors.filter(f => f.category === 'fruit');
  const gourmet  = flavors.filter(f => f.category === 'gourmet');

  const handlePrint = () => {
    setEditMode(false);
    setTimeout(() => window.print(), 200);
  };

  const em = editMode; // shorthand

  return (
    <div className="printable-container">
      <div className="content-header no-print">
        <span className="handdrawn-decor-sun" role="img" aria-label="sun">☀️</span>
        <h1 className="content-title">Afiches y Menus Imprimibles</h1>
        <p className="content-description">
          Elige el diseño, activa el modo edicion para modificar textos e imagenes directamente en el afiche y luego imprime o guarda como PDF.
        </p>
        <span className="handdrawn-decor-heart" role="img" aria-label="heart">❤️</span>
      </div>

      <div className="print-options no-print">
        <button
          className={'btn-secondary' + (activeLayout === 'full-menu' ? ' btn-primary' : '')}
          onClick={() => setActiveLayout('full-menu')}>
          Menu Completo (A4)
        </button>
        <button
          className={'btn-secondary' + (activeLayout === 'split-lines' ? ' btn-primary' : '')}
          onClick={() => setActiveLayout('split-lines')}>
          Lineas con Fotos (3 Hojas)
        </button>
        <button
          className={'btn-secondary' + (activeLayout === 'promo-poster' ? ' btn-primary' : '')}
          onClick={() => setActiveLayout('promo-poster')}>
          Afiche Promocional (A4)
        </button>

        {/* Edit mode toggle */}
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            padding: '0.5rem 1.1rem',
            borderRadius: 10,
            border: '2px solid ' + (editMode ? '#2196F3' : 'var(--border-pencil)'),
            background: editMode ? '#E3F2FD' : 'white',
            color: editMode ? '#1565C0' : 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
          }}>
          {editMode ? '✅ Editando' : '✏️ Editar Textos e Imagenes'}
        </button>

        <button
          className="btn-primary"
          onClick={handlePrint}
          style={{ backgroundColor: '#4E342E', color: 'white', marginLeft: 'auto' }}>
          Imprimir / Guardar PDF
        </button>
      </div>

      {editMode && (
        <div className="no-print" style={{
          background: '#E3F2FD', border: '2px solid #2196F3', borderRadius: 10,
          padding: '0.6rem 1rem', margin: '0 0 0.75rem', fontSize: '0.85rem',
          color: '#1565C0', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span>✏️</span>
          <span>
            Modo Edicion activo: Clic en cualquier texto para editarlo · Clic en imagen para cambiarla
          </span>
        </div>
      )}

      <div className="print-preview-container">

        {/* LAYOUT 1: FULL MENU */}
        {activeLayout === 'full-menu' && (
          <div className="print-page-a4">
            <span style={{ position:'absolute', top:'15px', left:'20px', fontSize:'1.5rem', opacity:0.2 }}>☁️</span>
            <span style={{ position:'absolute', top:'15px', right:'20px', fontSize:'1.5rem', opacity:0.2 }}>☀️</span>
            <span style={{ position:'absolute', bottom:'65px', left:'20px', fontSize:'1.5rem', opacity:0.15 }}>⭐</span>
            <span style={{ position:'absolute', bottom:'65px', right:'20px', fontSize:'1.5rem', opacity:0.15 }}>❤️</span>

            <div className="print-header">
              <div className="print-logo" style={{ borderRadius:'50%' }}>
                <img src={BASE + '/logo.png'} alt="Don Alfajor Logo" />
              </div>
              <ET tag="h2" className="print-title" editMode={em}>Don Alfajor</ET>
              <ET tag="span" className="print-subtitle" editMode={em}>Menu de Sabores Artesanales de Autor</ET>
            </div>

            <div className="print-body">
              <div className="print-category-section">
                <ET tag="h3" className="print-category-title" editMode={em}>Clasicos y Dulces</ET>
                <div className="print-menu-grid">
                  {classics.map(f => (
                    <div key={f.id} className="print-menu-item">
                      <div className="print-item-header">
                        <ET editMode={em}>{f.emoji + ' ' + f.name}</ET>
                        <span className="print-item-dots"></span>
                        <ET className="print-item-price" editMode={em}>$1.000</ET>
                      </div>
                      <ET tag="p" className="print-item-desc" editMode={em}>{f.filling + ' - ' + f.coating}</ET>
                    </div>
                  ))}
                </div>
              </div>

              <div className="print-category-section">
                <ET tag="h3" className="print-category-title" editMode={em}>Frutales y Exoticos</ET>
                <div className="print-menu-grid">
                  {fruit.map(f => (
                    <div key={f.id} className="print-menu-item">
                      <div className="print-item-header">
                        <ET editMode={em}>{f.emoji + ' ' + f.name}</ET>
                        <span className="print-item-dots"></span>
                        <ET className="print-item-price" editMode={em}>$1.000</ET>
                      </div>
                      <ET tag="p" className="print-item-desc" editMode={em}>{f.filling + ' - ' + f.coating}</ET>
                    </div>
                  ))}
                </div>
              </div>

              <div className="print-category-section">
                <ET tag="h3" className="print-category-title" editMode={em}>Linea Gourmet Premium</ET>
                <div className="print-menu-grid">
                  {gourmet.map(f => (
                    <div key={f.id} className="print-menu-item">
                      <div className="print-item-header">
                        <ET editMode={em}>{f.emoji + ' ' + f.name}</ET>
                        <span className="print-item-dots"></span>
                        <ET className="print-item-price" editMode={em}>$1.000</ET>
                      </div>
                      <ET tag="p" className="print-item-desc" editMode={em}>{f.filling + ' - ' + f.coating}</ET>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="print-footer-banner">
              <ET tag="h3" style={{ fontFamily:'var(--font-heading)' }} editMode={em}>TODOS LOS SABORES A $1.000 LA UNIDAD</ET>
              <ET tag="p" style={{ fontFamily:'var(--font-handwritten)', fontSize:'1.25rem' }} editMode={em}>Hechos con carino en nuestra pasteleria familiar</ET>
            </div>

            <div className="print-contacts-footer">
              <div className="print-contact-item"><strong>WhatsApp:</strong> <ET editMode={em}>979797420</ET></div>
              <div className="print-contact-item"><ET editMode={em}>Recetas Caseras</ET></div>
              <div className="print-contact-item"><ET editMode={em}>Venta Detalle y Mayor</ET></div>
            </div>
          </div>
        )}

        {/* LAYOUT 2: SPLIT LINES WITH PHOTOS */}
        {activeLayout === 'split-lines' && (
          <>
            {/* Sheet 1: Classics */}
            <div className="print-page-a4" style={{ padding:'25px 45px' }}>
              <span style={{ position:'absolute', top:'15px', right:'20px', fontSize:'1.5rem', opacity:0.2 }}>☀️</span>
              <span style={{ position:'absolute', bottom:'60px', left:'20px', fontSize:'1.5rem', opacity:0.15 }}>⭐</span>
              <span style={{ position:'absolute', bottom:'60px', right:'20px', fontSize:'1.5rem', opacity:0.15 }}>❤️</span>

              <div className="print-header">
                <div className="print-logo" style={{ borderRadius:'50%' }}>
                  <img src={BASE + '/logo.png'} alt="Don Alfajor Logo" />
                </div>
                <ET tag="h2" className="print-title" editMode={em}>Don Alfajor</ET>
                <ET tag="span" className="print-subtitle" style={{ color:'var(--accent-pink)' }} editMode={em}>Linea Clasicos y Dulces</ET>
              </div>

              <div className="print-body" style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                {classics.map((f, i) => (
                  <div key={f.id} style={{ display:'flex', gap:'1.2rem', alignItems:'center', width:'100%', borderBottom:'2px dashed var(--border-pencil)', paddingBottom:'0.5rem' }}>
                    <div style={{ width:'110px', flexShrink:0 }}>
                      <div className="polaroid-frame" style={{ padding:'6px 6px 12px', transform:'rotate(' + (i%2===0?-2:2) + 'deg)', width:'100%' }}>
                        <div className="polaroid-image-wrapper" style={{ height:'70px' }}>
                          <EImg src={f.image} alt={f.name} editMode={em} customGallery={customGallery}
                            style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                        <div className="polaroid-caption" style={{ fontSize:'0.85rem', marginTop:'4px' }}>
                          <ET editMode={em}>{f.emoji + ' ' + f.name}</ET>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.1rem', marginBottom:'0.15rem' }}>
                        <ET style={{ color:'var(--accent-brown)' }} editMode={em}>{f.name}</ET>
                        <ET style={{ color:'var(--accent-pink)' }} editMode={em}>$1.000</ET>
                      </div>
                      <ET tag="p" style={{ fontSize:'0.85rem', color:'var(--text-primary)', margin:'0 0 2px 0', lineHeight:'1.25', display:'block' }} editMode={em}>{f.description}</ET>
                      <ET style={{ fontSize:'0.7rem', color:'var(--text-secondary)', display:'block' }} editMode={em}>{f.filling + ' - ' + f.coating}</ET>
                    </div>
                  </div>
                ))}
              </div>

              <div className="print-footer-banner">
                <ET tag="h3" editMode={em}>TODOS LOS SABORES A $1.000</ET>
                <ET tag="p" style={{ fontFamily:'var(--font-handwritten)', fontSize:'1.2rem' }} editMode={em}>Pídelos al WhatsApp: 979797420</ET>
              </div>
            </div>

            {/* Sheet 2: Fruits */}
            <div className="print-page-a4" style={{ padding:'25px 45px' }}>
              <span style={{ position:'absolute', top:'15px', left:'20px', fontSize:'1.5rem', opacity:0.2 }}>☁️</span>
              <span style={{ position:'absolute', bottom:'60px', left:'20px', fontSize:'1.5rem', opacity:0.15 }}>☀️</span>
              <span style={{ position:'absolute', bottom:'60px', right:'20px', fontSize:'1.5rem', opacity:0.15 }}>⭐</span>

              <div className="print-header">
                <div className="print-logo" style={{ borderRadius:'50%' }}>
                  <img src={BASE + '/logo.png'} alt="Don Alfajor Logo" />
                </div>
                <ET tag="h2" className="print-title" editMode={em}>Don Alfajor</ET>
                <ET tag="span" className="print-subtitle" style={{ color:'var(--accent-blue)' }} editMode={em}>Linea Frutales y Exoticos</ET>
              </div>

              <div className="print-body" style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                {fruit.map((f, i) => (
                  <div key={f.id} style={{ display:'flex', gap:'1.2rem', alignItems:'center', width:'100%', borderBottom:'2px dashed var(--border-pencil)', paddingBottom:'0.5rem' }}>
                    <div style={{ width:'110px', flexShrink:0 }}>
                      <div className="polaroid-frame" style={{ padding:'6px 6px 12px', transform:'rotate(' + (i%2===0?2:-2) + 'deg)', width:'100%' }}>
                        <div className="polaroid-image-wrapper" style={{ height:'70px' }}>
                          <EImg src={f.image} alt={f.name} editMode={em} customGallery={customGallery}
                            style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                        <div className="polaroid-caption" style={{ fontSize:'0.85rem', marginTop:'4px' }}>
                          <ET editMode={em}>{f.emoji + ' ' + f.name}</ET>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.1rem', marginBottom:'0.15rem' }}>
                        <ET style={{ color:'var(--accent-brown)' }} editMode={em}>{f.name}</ET>
                        <ET style={{ color:'var(--accent-pink)' }} editMode={em}>$1.000</ET>
                      </div>
                      <ET tag="p" style={{ fontSize:'0.85rem', color:'var(--text-primary)', margin:'0 0 2px 0', lineHeight:'1.25', display:'block' }} editMode={em}>{f.description}</ET>
                      <ET style={{ fontSize:'0.7rem', color:'var(--text-secondary)', display:'block' }} editMode={em}>{f.filling + ' - ' + f.coating}</ET>
                    </div>
                  </div>
                ))}
              </div>

              <div className="print-footer-banner" style={{ backgroundColor:'var(--accent-blue)' }}>
                <ET tag="h3" editMode={em}>FRESCURA NATURAL A $1.000</ET>
                <ET tag="p" style={{ fontFamily:'var(--font-handwritten)', fontSize:'1.2rem' }} editMode={em}>Pídelos al WhatsApp: 979797420</ET>
              </div>
            </div>

            {/* Sheet 3: Gourmet */}
            <div className="print-page-a4" style={{ padding:'25px 45px' }}>
              <span style={{ position:'absolute', top:'15px', right:'20px', fontSize:'1.5rem', opacity:0.2 }}>⭐️</span>
              <span style={{ position:'absolute', bottom:'60px', left:'20px', fontSize:'1.5rem', opacity:0.15 }}>☁️</span>
              <span style={{ position:'absolute', bottom:'60px', right:'20px', fontSize:'1.5rem', opacity:0.15 }}>❤️</span>

              <div className="print-header">
                <div className="print-logo" style={{ borderRadius:'50%' }}>
                  <img src={BASE + '/logo.png'} alt="Don Alfajor Logo" />
                </div>
                <ET tag="h2" className="print-title" editMode={em}>Don Alfajor</ET>
                <ET tag="span" className="print-subtitle" style={{ color:'var(--accent-yellow)' }} editMode={em}>Linea Gourmet Premium</ET>
              </div>

              <div className="print-body" style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                {gourmet.map((f, i) => (
                  <div key={f.id} style={{ display:'flex', gap:'1.2rem', alignItems:'center', width:'100%', borderBottom:'2px dashed var(--border-pencil)', paddingBottom:'0.5rem' }}>
                    <div style={{ width:'110px', flexShrink:0 }}>
                      <div className="polaroid-frame" style={{ padding:'6px 6px 12px', transform:'rotate(' + (i%2===0?-2:2) + 'deg)', width:'100%' }}>
                        <div className="polaroid-image-wrapper" style={{ height:'70px' }}>
                          <EImg src={f.image} alt={f.name} editMode={em} customGallery={customGallery}
                            style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                        <div className="polaroid-caption" style={{ fontSize:'0.85rem', marginTop:'4px' }}>
                          <ET editMode={em}>{f.emoji + ' ' + f.name}</ET>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.1rem', marginBottom:'0.15rem' }}>
                        <ET style={{ color:'var(--accent-brown)' }} editMode={em}>{f.name}</ET>
                        <ET style={{ color:'var(--accent-pink)' }} editMode={em}>$1.000</ET>
                      </div>
                      <ET tag="p" style={{ fontSize:'0.85rem', color:'var(--text-primary)', margin:'0 0 2px 0', lineHeight:'1.25', display:'block' }} editMode={em}>{f.description}</ET>
                      <ET style={{ fontSize:'0.7rem', color:'var(--text-secondary)', display:'block' }} editMode={em}>{f.filling + ' - ' + f.coating}</ET>
                    </div>
                  </div>
                ))}
              </div>

              <div className="print-footer-banner" style={{ backgroundColor:'var(--text-primary)', color:'white' }}>
                <ET tag="h3" style={{ color:'var(--accent-yellow)' }} editMode={em}>SABORES EXCLUSIVOS A $1.000</ET>
                <ET tag="p" style={{ fontFamily:'var(--font-handwritten)', fontSize:'1.2rem' }} editMode={em}>Pídelos al WhatsApp: 979797420</ET>
              </div>
            </div>
          </>
        )}

        {/* LAYOUT 3: PROMO POSTER */}
        {activeLayout === 'promo-poster' && (
          <div className="print-page-a4" style={{ padding:'45px 60px', display:'flex', flexDirection:'column', justifyContent:'space-between', alignItems:'center', textAlign:'center' }}>
            <span className="handdrawn-decor-sun" style={{ top:'30px', right:'30px', fontSize:'3rem' }}>☀️</span>

            <div className="print-logo" style={{ width:'150px', height:'150px', borderRadius:'50%', borderWidth:'4px', margin:'0 auto' }}>
              <img src={BASE + '/logo.png'} alt="Don Alfajor Logo" />
            </div>

            <div style={{ margin:'1rem 0' }}>
              <ET tag="h1" style={{ fontSize:'4.2rem', color:'var(--accent-brown)', fontFamily:'var(--font-heading)', margin:0, lineHeight:1, display:'block' }} editMode={em}>Don Alfajor</ET>
              <ET tag="p" style={{ fontSize:'1.4rem', fontFamily:'var(--font-handwritten)', color:'var(--text-secondary)', fontWeight:'bold', marginTop:'0.5rem', display:'block' }} editMode={em}>Sabores Artesanales Hechos con Amor</ET>
            </div>

            <div style={{ border:'4px solid var(--border-pencil)', borderRadius:'24px', padding:'2.5rem 2rem', width:'100%', margin:'1.5rem 0', backgroundColor:'#FFFDF9', boxShadow:'6px 6px 0px var(--border-pencil)' }}>
              <ET tag="span" style={{ fontSize:'1.5rem', fontWeight:'bold', color:'var(--text-primary)', fontFamily:'var(--font-handwritten)', letterSpacing:'1px', display:'block' }} editMode={em}>Todos nuestros sabores!</ET>
              <ET tag="h2" style={{ fontSize:'5.5rem', color:'var(--accent-pink)', fontFamily:'var(--font-heading)', margin:'0.2rem 0', lineHeight:1, display:'block' }} editMode={em}>$1.000</ET>
              <ET tag="span" style={{ fontSize:'1.3rem', fontWeight:'bold', color:'var(--accent-brown)', display:'block' }} editMode={em}>UN MIL PESOS LA UNIDAD</ET>
              <ET tag="p" style={{ fontSize:'0.95rem', color:'var(--text-muted)', marginTop:'0.8rem', display:'block' }} editMode={em}>Clasicos - Frutales - Linea Gourmet de Autor</ET>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', width:'100%' }}>
              <ET tag="h3" style={{ fontSize:'1.6rem', color:'var(--accent-brown)', fontFamily:'var(--font-heading)' }} editMode={em}>Quieres hacer un pedido?</ET>
              <ET tag="p" style={{ fontSize:'1.1rem', color:'var(--text-secondary)', fontFamily:'var(--font-handwritten)', fontWeight:'bold' }} editMode={em}>Escribenos o llamanos directamente</ET>

              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', backgroundColor:'#E8F5E9', color:'#1B5E20', border:'3px solid var(--border-pencil)', padding:'0.8rem 2.2rem', borderRadius:'50px', fontSize:'2.2rem', fontWeight:'bold', alignSelf:'center', margin:'0.8rem 0', fontFamily:'var(--font-heading)', boxShadow:'4px 4px 0px var(--border-pencil)' }}>
                <ET editMode={em}>979797420</ET>
              </div>
            </div>

            <ET tag="div" style={{ fontSize:'0.9rem', color:'var(--text-muted)', fontFamily:'var(--font-handwritten)' }} editMode={em}>
              Ventas al detalle y por mayor - Elaboracion artesanal diaria
            </ET>
          </div>
        )}
      </div>
    </div>
  );
}
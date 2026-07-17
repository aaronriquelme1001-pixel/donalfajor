import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { flavors, categories } from '../src/data/flavors.js';

// Setup directories
const OUTPUT_DIR = path.resolve('dist/assets/ready_to_use');
const INSTAGRAM_POSTS_DIR = path.join(OUTPUT_DIR, 'instagram_posts');
const INSTAGRAM_STORIES_DIR = path.join(OUTPUT_DIR, 'instagram_stories');
const PRINT_DIR = path.join(OUTPUT_DIR, 'print');

// Ensure directories exist
fs.mkdirSync(INSTAGRAM_POSTS_DIR, { recursive: true });
fs.mkdirSync(INSTAGRAM_STORIES_DIR, { recursive: true });
fs.mkdirSync(PRINT_DIR, { recursive: true });

// Read CSS and logo
const cssContent = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');
const logoBuffer = fs.readFileSync(path.resolve('public/logo.png'));
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

// Convert all flavor images to Base64 for offline headless rendering
const flavorImagesBase64 = {};
for (const flavor of flavors) {
  const imgPath = path.resolve(`public${flavor.image}`);
  const imgBuffer = fs.readFileSync(imgPath);
  flavorImagesBase64[flavor.id] = `data:image/png;base64,${imgBuffer.toString('base64')}`;
}

// HTML wrapper helper
function getHtmlWrapper(content, format = 'post') {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        ${cssContent}
        
        /* Headless adjustments */
        body {
          margin: 0;
          padding: 0;
          background-color: transparent;
        }
        
        .render-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        
        /* Scale overrides for 1080x1080 Instagram Post */
        .canvas-wrapper.instagram-post {
          width: 1080px;
          height: 1080px;
          border-width: 8px !important;
          box-shadow: none !important;
        }
        .canvas-wrapper.instagram-post .canvas-template {
          padding: 4.5rem;
        }
        .canvas-wrapper.instagram-post .canvas-logo-circle {
          width: 110px;
          height: 110px;
          border-width: 4px !important;
        }
        .canvas-wrapper.instagram-post .canvas-brand-name {
          font-size: 3rem !important;
        }
        .canvas-wrapper.instagram-post .canvas-brand-sub {
          font-size: 1.8rem !important;
        }
        .canvas-wrapper.instagram-post .canvas-polaroid-frame {
          max-width: 580px;
          border-width: 6px !important;
          padding: 24px 24px 44px;
        }
        .canvas-wrapper.instagram-post .canvas-polaroid-img-box {
          height: 380px;
          border-width: 4px !important;
        }
        .canvas-wrapper.instagram-post .canvas-polaroid-caption {
          font-size: 3.5rem;
          margin-top: 15px;
        }
        .canvas-wrapper.instagram-post .canvas-flavor-tagline {
          font-size: 2.4rem !important;
          margin: 1rem 0 2rem !important;
        }
        .canvas-wrapper.instagram-post .canvas-price-tag {
          font-size: 3rem !important;
          border-width: 4px !important;
          padding: 0.5rem 2.2rem !important;
        }
        .canvas-wrapper.instagram-post .canvas-footer {
          font-size: 1.9rem !important;
          padding-top: 2rem;
          border-top-width: 4px !important;
        }
        
        /* Scale overrides for 1080x1920 Instagram Story */
        .canvas-wrapper.instagram-story {
          width: 1080px;
          height: 1920px;
          border-width: 10px !important;
          box-shadow: none !important;
        }
        .canvas-wrapper.instagram-story .canvas-template {
          padding: 7rem 5rem;
        }
        .canvas-wrapper.instagram-story .canvas-logo-circle {
          width: 130px;
          height: 130px;
          border-width: 5px !important;
        }
        .canvas-wrapper.instagram-story .canvas-brand-name {
          font-size: 3.5rem !important;
        }
        .canvas-wrapper.instagram-story .canvas-brand-sub {
          font-size: 2.2rem !important;
        }
        .canvas-wrapper.instagram-story .canvas-polaroid-frame {
          max-width: 750px;
          border-width: 8px !important;
          padding: 30px 30px 60px;
        }
        .canvas-wrapper.instagram-story .canvas-polaroid-img-box {
          height: 520px;
          border-width: 5px !important;
        }
        .canvas-wrapper.instagram-story .canvas-polaroid-caption {
          font-size: 4.8rem;
          margin-top: 20px;
        }
        .canvas-wrapper.instagram-story .canvas-flavor-tagline {
          font-size: 3.2rem !important;
          margin: 1.5rem 0 3rem !important;
        }
        .canvas-wrapper.instagram-story .canvas-price-tag {
          font-size: 4rem !important;
          border-width: 5px !important;
          padding: 0.8rem 3rem !important;
        }
        .canvas-wrapper.instagram-story .canvas-footer {
          font-size: 2.4rem !important;
          padding-top: 2rem;
          border-top-width: 4px !important;
        }
        
        /* A4 sheets overrides for Puppeteer print */
        .print-page-a4 {
          width: 794px;
          height: 1123px;
          margin: 0;
          box-shadow: none !important;
          padding: 50px;
        }
      </style>
    </head>
    <body>
      <div class="render-container">
        ${content}
      </div>
    </body>
    </html>
  `;
}

// Modern font loading wrapper
async function setPageContent(page, html, format) {
  await page.setContent(getHtmlWrapper(html, format), { waitUntil: 'load', timeout: 10000 });
  try {
    await page.evaluateHandle(() => document.fonts.ready);
  } catch (e) {
    console.warn('Advertencia: Timeout al cargar fuentes, continuando...');
  }
}

// Theme match mapping
const themesMap = {
  'manjar-blanco': COLOR_THEMES()[0], // cream
  'manjar-negro': COLOR_THEMES()[4],  // cocoa
  'frambuesa-blanco-negro': COLOR_THEMES()[1], // pink
  'maracuya-blanco-negro': COLOR_THEMES()[3], // yellow
  'lucuma-blanco-negro': COLOR_THEMES()[3], // yellow
  'coco': COLOR_THEMES()[2], // blue
};

function COLOR_THEMES() {
  return [
    { id: 'cream', bg: '#FDFBF7', text: '#5D4037', accent: '#D37B57' },
    { id: 'pink', bg: '#FFF0F0', text: '#5D4037', accent: '#F98F8F' },
    { id: 'blue', bg: '#F0F8FA', text: '#5D4037', accent: '#82C3C9' },
    { id: 'yellow', bg: '#FFFDE7', text: '#5D4037', accent: '#FBC02D' },
    { id: 'cocoa', bg: '#4E342E', text: '#FFFDF9', accent: '#FFF176' }
  ];
}

function getTheme(flavor) {
  return themesMap[flavor.id] || COLOR_THEMES()[0];
}

async function run() {
  console.log('Iniciando generador de archivos multimedia tiernos de Don Alfajor...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 1. GENERATE INSTAGRAM POSTS (1080x1080)
  console.log('Generando publicaciones de Instagram con Fotos Reales (1:1)...');
  await page.setViewport({ width: 1080, height: 1080 });
  for (const flavor of flavors) {
    const theme = getTheme(flavor);
    const flavorImage = flavorImagesBase64[flavor.id];
    const isDark = theme.bg === '#4E342E';
    
    const htmlContent = `
      <div class="canvas-wrapper instagram-post" style="background-color: ${theme.bg}; border-color: ${isDark ? '#FFFDF9' : 'var(--border-pencil)'};">
        <div class="canvas-template" style="color: ${theme.text};">
          <div class="canvas-bg-decorations">
            <span style="position: absolute; top: 40px; right: 60px; fontSize: 4.5rem; opacity: 0.15; transform: rotate(10deg);">☁️</span>
            <span style="position: absolute; bottom: 120px; left: 40px; fontSize: 4rem; opacity: 0.15; transform: rotate(-15deg);">⭐️</span>
          </div>
          
          <div class="canvas-logo-container">
            <div class="canvas-logo-circle" style="border-color: ${isDark ? '#FFFDF9' : 'var(--border-pencil)'};">
              <img src="${logoBase64}" alt="Logo">
            </div>
            <div>
              <div class="canvas-brand-name" style="color: ${isDark ? '#FFFDF9' : 'var(--accent-brown)'};">Don Alfajor</div>
              <div class="canvas-brand-sub" style="color: ${theme.accent};">Sabores de Autor ✨</div>
            </div>
          </div>
          
          <div class="canvas-content-box">
            <div class="canvas-polaroid-frame" style="border-color: var(--border-pencil);">
              <div class="polaroid-tape"></div>
              <div class="canvas-polaroid-img-box">
                <img src="${flavorImage}" alt="${flavor.name}">
              </div>
              <div class="canvas-polaroid-caption" style="color: var(--accent-brown);">
                ${flavor.emoji} ${flavor.name}
              </div>
            </div>
            
            <p class="canvas-flavor-tagline" style="color: ${isDark ? '#FFFDF9' : 'var(--text-secondary)'}; font-family: var(--font-handwritten); font-weight: bold;">
              "${flavor.tagline}"
            </p>
            
            <div class="canvas-price-tag" style="background-color: var(--accent-yellow); color: var(--accent-brown); border-color: var(--border-pencil);">$1.000 c/u</div>
          </div>
          
          <div class="canvas-footer" style="border-top-color: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(93,64,55,0.2)'}; color: ${theme.text}; font-family: var(--font-handwritten);">
            <div class="canvas-footer-tel">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.473 1.336 4.985l-1.42 5.187 5.311-1.392c1.455.795 3.09 1.213 4.752 1.213 5.506 0 9.989-4.482 9.989-9.99 0-5.507-4.482-9.99-9.989-9.99zm5.727 14.156c-.244.688-1.427 1.348-1.956 1.413-.483.059-.974.1-3.13-.736-2.756-1.07-4.524-3.864-4.662-4.048-.138-.184-1.12-1.488-1.12-2.839 0-1.35.704-2.013.955-2.274.252-.262.551-.328.736-.328.184 0 .368.002.528.01.166.008.388-.063.608.468.225.541.77 1.868.835 2.001.066.133.11.288.02.467-.09.18-.138.288-.276.444-.138.156-.291.348-.414.468-.138.134-.282.28-.12.56.162.28.72 1.185 1.543 1.918.823.733 1.517.96 1.737 1.07.22.11.348.093.478-.057.13-.15.556-.648.704-.87.148-.22.296-.184.499-.11.204.074 1.298.613 1.522.725.225.112.374.168.428.261.054.093.054.542-.19 1.23z"/>
              </svg>
              <span style="font-weight: bold; margin-left: 8px;">979797420</span>
            </div>
            <div style="font-weight: bold;">Recetas Hechas con Amor ❤️</div>
          </div>
        </div>
      </div>
    `;
    
    await setPageContent(page, htmlContent, 'post');
    const outputPath = path.join(INSTAGRAM_POSTS_DIR, `post_${flavor.id}.png`);
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`✓ Creado: ${path.basename(outputPath)}`);
  }

  // 2. GENERATE INSTAGRAM STORIES (1080x1920)
  console.log('Generando historias de Instagram con Fotos Reales (9:16)...');
  await page.setViewport({ width: 1080, height: 1920 });
  for (const flavor of flavors) {
    const theme = getTheme(flavor);
    const flavorImage = flavorImagesBase64[flavor.id];
    const isDark = theme.bg === '#4E342E';
    
    const htmlContent = `
      <div class="canvas-wrapper instagram-story" style="background-color: ${theme.bg}; border-color: ${isDark ? '#FFFDF9' : 'var(--border-pencil)'};">
        <div class="canvas-template" style="color: ${theme.text};">
          <div class="canvas-bg-decorations">
            <span style="position: absolute; top: 60px; right: 60px; fontSize: 5rem; opacity: 0.15; transform: rotate(10deg);">☁️</span>
            <span style="position: absolute; bottom: 150px; left: 50px; fontSize: 4.5rem; opacity: 0.15; transform: rotate(-15deg);">⭐️</span>
          </div>
          
          <div class="canvas-logo-container">
            <div class="canvas-logo-circle" style="border-color: ${isDark ? '#FFFDF9' : 'var(--border-pencil)'};">
              <img src="${logoBase64}" alt="Logo">
            </div>
            <div>
              <div class="canvas-brand-name" style="color: ${isDark ? '#FFFDF9' : 'var(--accent-brown)'};">Don Alfajor</div>
              <div class="canvas-brand-sub" style="color: ${theme.accent};">Sabores de Autor ✨</div>
            </div>
          </div>
          
          <div class="canvas-content-box">
            <div class="canvas-polaroid-frame" style="border-color: var(--border-pencil);">
              <div class="polaroid-tape"></div>
              <div class="canvas-polaroid-img-box">
                <img src="${flavorImage}" alt="${flavor.name}">
              </div>
              <div class="canvas-polaroid-caption" style="color: var(--accent-brown);">
                ${flavor.emoji} ${flavor.name}
              </div>
            </div>
            
            <p class="canvas-flavor-tagline" style="color: ${isDark ? '#FFFDF9' : 'var(--text-secondary)'}; font-family: var(--font-handwritten); font-weight: bold;">
              "${flavor.tagline}"
            </p>
            
            <div class="canvas-price-tag" style="background-color: var(--accent-yellow); color: var(--accent-brown); border-color: var(--border-pencil);">$1.000 c/u</div>
          </div>
          
          <div class="canvas-footer" style="border-top-color: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(93,64,55,0.2)'}; color: ${theme.text}; font-family: var(--font-handwritten);">
            <div class="canvas-footer-tel">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.473 1.336 4.985l-1.42 5.187 5.311-1.392c1.455.795 3.09 1.213 4.752 1.213 5.506 0 9.989-4.482 9.989-9.99 0-5.507-4.482-9.99-9.989-9.99zm5.727 14.156c-.244.688-1.427 1.348-1.956 1.413-.483.059-.974.1-3.13-.736-2.756-1.07-4.524-3.864-4.662-4.048-.138-.184-1.12-1.488-1.12-2.839 0-1.35.704-2.013.955-2.274.252-.262.551-.328.736-.328.184 0 .368.002.528.01.166.008.388-.063.608.468.225.541.77 1.868.835 2.001.066.133.11.288.02.467-.09.18-.138.288-.276.444-.138.156-.291.348-.414.468-.138.134-.282.28-.12.56.162.28.72 1.185 1.543 1.918.823.733 1.517.96 1.737 1.07.22.11.348.093.478-.057.13-.15.556-.648.704-.87.148-.22.296-.184.499-.11.204.074 1.298.613 1.522.725.225.112.374.168.428.261.054.093.054.542-.19 1.23z"/>
              </svg>
              <span style="font-weight: bold; margin-left: 8px;">979797420</span>
            </div>
            <div style="font-weight: bold;">Recetas Hechas con Amor ❤️</div>
          </div>
        </div>
      </div>
    `;
    
    await setPageContent(page, htmlContent, 'story');
    const outputPath = path.join(INSTAGRAM_STORIES_DIR, `story_${flavor.id}.png`);
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`✓ Creado: ${path.basename(outputPath)}`);
  }

  // 3. GENERATE PRINTABLE MENUS (A4 PDFs)
  console.log('Generando documentos PDF tiernos para imprimir (A4)...');
  await page.setViewport({ width: 794, height: 1123 });

  const classics = flavors.filter(f => f.category === 'classics');
  const fruit = flavors.filter(f => f.category === 'fruit');
  const gourmet = flavors.filter(f => f.category === 'gourmet');

  // A4 PDF 1: Full Menu
  const fullMenuHtml = `
    <div class="print-page-a4">
      <span style="position: absolute; top: 15px; left: 20px; fontSize: 1.5rem; opacity: 0.2;">☁️</span>
      <span style="position: absolute; top: 15px; right: 20px; fontSize: 1.5rem; opacity: 0.2;">☀️</span>
      
      <div class="print-header">
        <div class="print-logo" style="border-radius: 50%;">
          <img src="${logoBase64}" alt="Logo">
        </div>
        <h2 class="print-title">Don Alfajor</h2>
        <span class="print-subtitle">Menú de Sabores Artesanales de Autor ✨</span>
      </div>
      <div class="print-body">
        <div class="print-category-section">
          <h3 class="print-category-title">🧸 Clásicos y Dulces</h3>
          <div class="print-menu-grid">
            ${classics.map(f => `
              <div class="print-menu-item">
                <div class="print-item-header">
                  <span>${f.emoji} ${f.name}</span>
                  <span class="print-item-dots"></span>
                  <span class="print-item-price">$1.000</span>
                </div>
                <p class="print-item-desc">${f.filling} • ${f.coating}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="print-category-section">
          <h3 class="print-category-title">🍋 Frutales y Exóticos</h3>
          <div class="print-menu-grid">
            ${fruit.map(f => `
              <div class="print-menu-item">
                <div class="print-item-header">
                  <span>${f.emoji} ${f.name}</span>
                  <span class="print-item-dots"></span>
                  <span class="print-item-price">$1.000</span>
                </div>
                <p class="print-item-desc">${f.filling} • ${f.coating}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="print-category-section">
          <h3 class="print-category-title">🍷 Línea Gourmet Premium</h3>
          <div class="print-menu-grid">
            ${gourmet.map(f => `
              <div class="print-menu-item">
                <div class="print-item-header">
                  <span>${f.emoji} ${f.name}</span>
                  <span class="print-item-dots"></span>
                  <span class="print-item-price">$1.000</span>
                </div>
                <p class="print-item-desc">${f.filling} • ${f.coating}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="print-footer-banner">
        <h3>TODOS LOS SABORES A $1.000 LA UNIDAD</h3>
        <p style="font-family: var(--font-handwritten); font-size: 1.25rem;">Hechos con cariño en nuestra pastelería familiar</p>
      </div>
      <div class="print-contacts-footer">
        <div class="print-contact-item"><strong>WhatsApp:</strong> 979797420</div>
        <div class="print-contact-item"><strong>Recetas Caseras</strong></div>
        <div class="print-contact-item"><strong>Venta Detalle y Mayor</strong></div>
      </div>
    </div>
  `;
  await setPageContent(page, fullMenuHtml, 'print');
  await page.pdf({
    path: path.join(PRINT_DIR, 'menu_completo_a4.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });
  console.log('✓ Creado: menu_completo_a4.pdf');

  // A4 PDF 2: Promo Poster
  const promoPosterHtml = `
    <div class="print-page-a4" style="padding: 60px; justify-content: space-between; align-items: center; text-align: center;">
      <span class="handdrawn-decor-sun" style="top: 30px; right: 30px; fontSize: 3rem;">☀️</span>
      
      <div class="print-logo" style="width: 150px; height: 150px; border-radius: 50%; border-width: 4px;">
        <img src="${logoBase64}" alt="Logo">
      </div>
      
      <div style="margin: 1rem 0;">
        <h1 style="font-size: 4.2rem; color: var(--accent-brown); font-family: var(--font-heading); margin: 0; line-height: 1;">Don Alfajor</h1>
        <p style="font-size: 1.4rem; fontFamily: var(--font-handwritten); color: var(--text-secondary); fontWeight: bold; marginTop: 0.5rem;">Sabores Artesanales Hechos con Amor 💕</p>
      </div>
      
      <div style="border: 4px solid var(--border-pencil); border-radius: 24px; padding: 2.5rem 2rem; width: 100%; margin: 1.5rem 0; background-color: #FFFDF9; box-shadow: 6px 6px 0px var(--border-pencil);">
        <span style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary); fontFamily: var(--font-handwritten); letterSpacing: 1px;">¡Todos nuestros sabores!</span>
        <h2 style="font-size: 5.5rem; color: var(--accent-pink); font-family: var(--font-heading); margin: 0.2rem 0; line-height: 1;">$1.000</h2>
        <span style="font-size: 1.3rem; font-weight: bold; color: var(--accent-brown);">UN MIL PESOS LA UNIDAD</span>
        <p style="font-size: 0.95rem; color: var(--text-muted); marginTop: 0.8rem;">Clásicos • Frutales • Línea Gourmet de Autor</p>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">
        <h3 style="font-size: 1.6rem; color: var(--accent-brown); font-family: var(--font-heading); margin: 0;">¿Quieres hacer un pedido? 📝</h3>
        <p style="font-size: 1.1rem; color: var(--text-secondary); fontFamily: var(--font-handwritten); fontWeight: bold; margin: 0;">Escríbenos directamente</p>
        <div style="display: inline-flex; alignItems: center; gap: 0.5rem; background-color: #E8F5E9; color: #1B5E20; border: 3px solid var(--border-pencil); padding: 0.8rem 2.2rem; border-radius: 50px; font-size: 2.2rem; font-weight: bold; align-self: center; margin: 0.8rem 0; font-family: var(--font-heading); box-shadow: 4px 4px 0px var(--border-pencil);">
          979797420
        </div>
      </div>
      <div style="font-size: 0.9rem; color: var(--text-muted); fontFamily: var(--font-handwritten);">Ventas al detalle y por mayor • Elaboración artesanal diaria</div>
    </div>
  `;
  await setPageContent(page, promoPosterHtml, 'print');
  await page.pdf({
    path: path.join(PRINT_DIR, 'afiche_promocional_a4.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });
  console.log('✓ Creado: afiche_promocional_a4.pdf');

  // A4 PDF 3: Sticker Label Sheets (16 circles)
  const stickersHtml = `
    <div class="print-page-a4" style="padding: 30px; display: flex; flex-direction: column;">
      <div class="sticker-sheet-grid">
        ${Array.from({ length: 16 }).map(() => `
          <div class="circular-sticker">
            <div class="sticker-border-circle">
              <span class="sticker-decor">★ Casero ★</span>
              <img class="sticker-logo-img" src="${logoBase64}" alt="Logo">
              <h4 class="sticker-title">Don Alfajor</h4>
              <div class="sticker-whatsapp">
                <span>979797420</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  await setPageContent(page, stickersHtml, 'print');
  await page.pdf({
    path: path.join(PRINT_DIR, 'planilla_etiquetas_a4.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });
  console.log('✓ Creado: planilla_etiquetas_a4.pdf');

  // Separated Lines Menus (3 sheets with Polaroid pictures)
  const lineDetails = [
    { name: 'Clásicos y Dulces', data: classics, accent: '#F98F8F', bg: '#FFFDF9', text: 'var(--text-primary)', emoji: '🧸' },
    { name: 'Frutales y Exóticos', data: fruit, accent: '#82C3C9', bg: '#FFFDF9', text: 'var(--text-primary)', emoji: '🍋' },
    { name: 'Línea Gourmet', data: gourmet, accent: '#FFF176', bg: '#FFFDF9', text: 'var(--text-primary)', emoji: '🍷' }
  ];

  for (const line of lineDetails) {
    const lineHtml = `
      <div class="print-page-a4" style="background-color: ${line.bg}; padding: 40px 50px;">
        <span style="position: absolute; top: 15px; right: 20px; fontSize: 1.5rem; opacity: 0.2;">☀️</span>
        
        <div class="print-header" style="border-bottom-color: ${line.accent};">
          <div class="print-logo" style="border-radius: 50%;">
            <img src="${logoBase64}" alt="Logo">
          </div>
          <h2 class="print-title">Don Alfajor</h2>
          <span class="print-subtitle" style="color: ${line.accent}; font-weight: 700;">Línea ${line.name} ${line.emoji}</span>
        </div>
        
        <div class="print-body" style="display: flex; flexDirection: column; gap: 1.5rem; justifyContent: center; margin: 2rem 0;">
          ${line.data.map((f, i) => `
            <div style="display: flex; gap: 2rem; alignItems: center; width: 100%; border-bottom: 2px dashed var(--border-pencil); padding-bottom: 1rem;">
              
              <!-- Small Polaroid -->
              <div style="width: 140px; flex-shrink: 0;">
                <div class="polaroid-frame" style="padding: 8px 8px 16px; transform: rotate(${i % 2 === 0 ? -2 : 2}deg); width: 100%;">
                  <div class="polaroid-image-wrapper" style="height: 90px;">
                    <img src="${flavorImagesBase64[f.id]}" alt="${f.name}">
                  </div>
                  <div class="polaroid-caption" style="font-size: 1rem; margin-top: 6px;">${f.emoji} ${f.name}</div>
                </div>
              </div>
              
              <!-- Info -->
              <div style="flex: 1;">
                <div style="display: flex; justifyContent: space-between; fontWeight: bold; fontSize: 1.25rem; marginBottom: 0.25rem;">
                  <span style="color: var(--accent-brown);">${f.name}</span>
                  <span style="color: var(--accent-pink);">${f.emoji} $1.000</span>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-primary); margin: 0;">${f.description}</p>
                <div style="font-size: 0.75rem; color: var(--text-secondary); marginTop: 0.25rem;">
                  ${f.filling} • ${f.coating} • ${f.dough}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="print-footer-banner" style="background-color: ${line.accent};">
          <h3>TODOS LOS SABORES A $1.000</h3>
          <p style="font-family: var(--font-handwritten); font-size: 1.2rem;">Pídelos al WhatsApp: 979797420</p>
        </div>
      </div>
    `;
    
    await setPageContent(page, lineHtml, 'print');
    const filename = `afiche_linea_${line.name.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}_a4.pdf`;
    await page.pdf({
      path: path.join(PRINT_DIR, filename),
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });
    console.log(`✓ Creado: ${filename}`);
  }

  await browser.close();
  console.log('¡Generación tierna completada con éxito! Todos los recursos con fotos reales están listos.');
}

run().catch(err => {
  console.error('Error durante la generación de assets:', err);
  process.exit(1);
});

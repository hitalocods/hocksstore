/**
 * ATELIER // COLEÇÃO 2026
 * - Seção 01: Roda de Arrastar até a Órbita com sin(θ)/cos(θ) em CSS transform: matrix() (Tênis)
 * - Seção 02: Trilho SVG Curvo (SVGPathElement.getPointAtLength) com deslize centralizado e Spotlight (Camisas)
 */

let bagItemsCount = 0;
const bagCountEl = document.getElementById('bagCount');
const storeLogoEl = document.getElementById('storeLogo');

// ============================================================================
// CONTROLE DE TROCA ENTRE AS COLEÇÕES (TÊNIS <-> CAMISAS)
// ============================================================================
const tabStage1 = document.getElementById('tabStage1');
const tabStage2 = document.getElementById('tabStage2');
const stage1Container = document.getElementById('stage1Container');
const stage2Container = document.getElementById('stage2Container');

function switchStage(stageNumber) {
  if (stageNumber === 1) {
    stage1Container.classList.remove('hidden-stage');
    stage2Container.classList.add('hidden-stage');
    tabStage1.classList.add('active');
    tabStage2.classList.remove('active');
    storeLogoEl.innerHTML = 'AETHER<span>KICKS</span>';
  } else if (stageNumber === 2) {
    stage2Container.classList.remove('hidden-stage');
    stage1Container.classList.add('hidden-stage');
    tabStage2.classList.add('active');
    tabStage1.classList.remove('active');
    storeLogoEl.innerHTML = 'ATELIER<span>ARCHIVE</span>';
    requestAnimationFrame(() => updateCurvedRailLayout());
  }
}

tabStage1.addEventListener('click', () => switchStage(1));
tabStage2.addEventListener('click', () => switchStage(2));

// ============================================================================
// SEÇÃO 1: RODA DE ARRASTAR ATÉ A ÓRBITA (TÊNIS — CSS MATRIX)
// ============================================================================
const SNEAKERS = [
  {
    id: 'aj12-retro',
    series: 'ARCHIVE EDITION // 01',
    sku: 'SKU-AJ12-2026',
    title: 'AIR JORDAN 12 RETRO',
    bgWord: 'JORDAN',
    colorway: 'Crimson Red / White / Carbon Black',
    price: 'R$ 1.299,00',
    desc: 'Silhueta icônica com amortecimento Zoom Air em toda a extensão, placa em fibra de carbono no mediopé e sobreposições inspiradas no sol nascente.',
    image: 'assets/sneakers/sneaker-1.png?v=2'
  },
  {
    id: 'air-max-pulse',
    series: 'AIR SERIES // 02',
    sku: 'SKU-AMP-2026',
    title: 'AIR MAX 1 SE',
    bgWord: 'AIRMAX',
    colorway: 'Pure Platinum / Magma Orange / Sail',
    price: 'R$ 1.149,90',
    desc: 'Entressola clássica com janela Air visível no calcanhar e sobreposições em camurça premium calibradas para uso urbano.',
    image: 'assets/sneakers/sneaker-2.png?v=2'
  },
  {
    id: 'dunk-low-pro',
    series: 'COURT LAB // 03',
    sku: 'SKU-DNK-2026',
    title: 'FLYKNIT VAPOR EMERALD',
    bgWord: 'VAPOR',
    colorway: 'Emerald Volt / Summit White',
    price: 'R$ 1.379,90',
    desc: 'Trama Flyknit respirável de peça única com cabos Flywire integrados e solado flexível de baixa densidade.',
    image: 'assets/sneakers/sneaker-3.png?v=2'
  },
  {
    id: 'zoom-vapor-nit',
    series: 'PERFORMANCE // 04',
    sku: 'SKU-ZVN-2026',
    title: 'AIR MAX 1 COBALT',
    bgWord: 'COBALT',
    colorway: 'Cobalt Bliss / Pure Platinum',
    price: 'R$ 1.199,00',
    desc: 'Design atemporal de Tinker Hatfield reinventado em azul cobalto com amortecimento Air encapsulado de alta resposta.',
    image: 'assets/sneakers/sneaker-4.png?v=2'
  },
  {
    id: 'acg-terra-apex',
    series: 'OUTDOOR LAB // 05',
    sku: 'SKU-ACG-2026',
    title: 'FLYKNIT ROYAL INDIGO',
    bgWord: 'INDIGO',
    colorway: 'Hyper Royal / Volt Glow / Ice',
    price: 'R$ 1.349,00',
    desc: 'Malha engenheirada ultraleve em tom índigo profundo com transição anatômica e tração geometrizada.',
    image: 'assets/sneakers/sneaker-5.png?v=2'
  },
  {
    id: 'court-legacy-lux',
    series: 'BESPOKE // 06',
    sku: 'SKU-CLL-2026',
    title: 'AIR MAX 1 CONCORD',
    bgWord: 'CONCORD',
    colorway: 'Dark Concord / Warm Alabaster',
    price: 'R$ 1.249,90',
    desc: 'Edição limitada em violeta Concord com acabamento fosco artesanal e palmilha anatômica de memória.',
    image: 'assets/sneakers/sneaker-6.png?v=2'
  }
];

const orbitViewport = document.getElementById('orbitViewport');
const orbitItemsLayer = document.getElementById('orbitItemsLayer');
const orbitThumbs = document.getElementById('orbitThumbs');
const orbitBgWord = document.getElementById('orbitBgWord');
const heroFloorShadow = document.getElementById('heroFloorShadow');

const productSeries = document.getElementById('productSeries');
const productSku = document.getElementById('productSku');
const productTitle = document.getElementById('productTitle');
const productColorway = document.getElementById('productColorway');
const productPrice = document.getElementById('productPrice');
const productDesc = document.getElementById('productDesc');

const TOTAL_SNEAKERS = SNEAKERS.length;
const STEP_ANGLE = (Math.PI * 2) / TOTAL_SNEAKERS;

let currentAngle = 0;
let targetAngle = 0;
let angularVelocity = 0;
let isDraggingOrbit = false;
let lastPointerX = 0;
let totalDragMoved = 0;
let activeSneakerIndex = 0;

const itemElements = [];
const thumbElements = [];

function initOrbitDOM() {
  orbitItemsLayer.innerHTML = '';
  orbitThumbs.innerHTML = '';

  SNEAKERS.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'orbit-item';
    el.dataset.index = index;
    el.innerHTML = `
      <div class="orbit-item__card">
        <div class="orbit-item__img-wrap">
          <img class="orbit-item__img" src="${item.image}" alt="${item.title}" draggable="false" />
          <span class="orbit-item__tag">0${index + 1} · ${item.title}</span>
        </div>
      </div>
    `;
    el.addEventListener('click', () => {
      if (totalDragMoved < 8) rotateToIndex(index);
    });
    orbitItemsLayer.appendChild(el);
    itemElements.push(el);

    const thumb = document.createElement('button');
    thumb.className = 'orbit-thumb' + (index === 0 ? ' active' : '');
    thumb.setAttribute('aria-label', `Ver ${item.title}`);
    thumb.innerHTML = `<img src="${item.image}" alt="${item.title}" />`;
    thumb.addEventListener('click', () => rotateToIndex(index));
    orbitThumbs.appendChild(thumb);
    thumbElements.push(thumb);
  });
}

function rotateToIndex(index) {
  const desiredBaseAngle = -index * STEP_ANGLE;
  let diff = (desiredBaseAngle - targetAngle) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  targetAngle += diff;
}

function snapToNearestSlot() {
  const nearestSlot = Math.round(-targetAngle / STEP_ANGLE);
  targetAngle = -nearestSlot * STEP_ANGLE;
}

function updateActiveSneakerUI(newIndex) {
  if (newIndex === activeSneakerIndex) return;
  activeSneakerIndex = newIndex;
  const item = SNEAKERS[activeSneakerIndex];
  productSeries.textContent = item.series;
  productSku.textContent = item.sku;
  productTitle.textContent = item.title;
  productColorway.textContent = item.colorway;
  productPrice.textContent = item.price;
  productDesc.textContent = item.desc;
  orbitBgWord.textContent = item.bgWord;

  thumbElements.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === activeSneakerIndex);
  });
}

function renderOrbitFrame() {
  if (!stage1Container.classList.contains('hidden-stage')) {
    if (!isDraggingOrbit) {
      const delta = targetAngle - currentAngle;
      currentAngle += delta * 0.12;
      angularVelocity = delta * 0.12;
    }

    const stageWidth = orbitViewport.clientWidth || window.innerWidth;
    const isMobile = stageWidth < 680;
    const radiusX = isMobile
      ? Math.max(115, Math.min(220, stageWidth * 0.34))
      : Math.min(355, stageWidth * 0.36);
    const radiusY = isMobile
      ? Math.max(54, Math.min(82, stageWidth * 0.17))
      : 108;
    const verticalOffset = isMobile ? -10 : -14;
    const minScale = isMobile ? 0.36 : 0.38;
    const scaleRange = isMobile ? 0.74 : 0.78;

    let frontMostIndex = 0;
    let maxCosValue = -2;

    for (let i = 0; i < TOTAL_SNEAKERS; i++) {
      const theta = currentAngle + i * STEP_ANGLE;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      const depth = (cosT + 1) * 0.5;

      const tx = sinT * radiusX;
      const ty = cosT * radiusY + verticalOffset;
      const scale = minScale + Math.pow(depth, 1.65) * scaleRange;

      const tiltRad = (-sinT * 0.07) + Math.max(-0.2, Math.min(0.2, angularVelocity * 1.45));
      const cosRot = Math.cos(tiltRad);
      const sinRot = Math.sin(tiltRad);

      const a = scale * cosRot;
      const b = scale * sinRot;
      const c = -scale * sinRot;
      const d = scale * cosRot;

      const el = itemElements[i];
      el.style.transform = `matrix(${a.toFixed(4)}, ${b.toFixed(4)}, ${c.toFixed(4)}, ${d.toFixed(4)}, ${tx.toFixed(2)}, ${ty.toFixed(2)})`;

      const zIndex = Math.round(depth * 100);
      el.style.zIndex = String(zIndex);
      el.style.opacity = (0.34 + depth * 0.66).toFixed(3);

      const blurPx = Math.max(0, (1 - depth) * (isMobile ? 1.8 : 2.6));
      const brightness = 0.88 + depth * 0.12;
      el.style.filter = `blur(${blurPx.toFixed(2)}px) brightness(${brightness.toFixed(2)})`;

      if (cosT > maxCosValue) {
        maxCosValue = cosT;
        frontMostIndex = i;
      }
    }

    itemElements.forEach((el, idx) => {
      el.classList.toggle('is-front', idx === frontMostIndex);
    });
    updateActiveSneakerUI(frontMostIndex);

    const shadowY = isMobile ? 92 : 148;
    const shadowScale = 0.72 + Math.max(0, maxCosValue) * 0.34;
    heroFloorShadow.style.transform = `translateY(${shadowY}px) scale(${shadowScale.toFixed(3)})`;
    heroFloorShadow.style.opacity = (0.35 + Math.max(0, maxCosValue) * 0.65).toFixed(2);
  }

  requestAnimationFrame(renderOrbitFrame);
}

orbitViewport.addEventListener('pointerdown', (e) => {
  isDraggingOrbit = true;
  lastPointerX = e.clientX;
  totalDragMoved = 0;
  angularVelocity = 0;
  orbitViewport.classList.add('is-dragging');
  try { orbitViewport.setPointerCapture(e.pointerId); } catch (_) {}
});

orbitViewport.addEventListener('pointermove', (e) => {
  if (!isDraggingOrbit) return;
  const dx = e.clientX - lastPointerX;
  lastPointerX = e.clientX;
  totalDragMoved += Math.abs(dx);

  const stageWidth = orbitViewport.clientWidth || window.innerWidth;
  const sensitivity = stageWidth < 680 ? 0.0085 : 0.0055;
  const deltaAngle = dx * sensitivity;

  currentAngle += deltaAngle;
  targetAngle = currentAngle;
  angularVelocity = deltaAngle;
});

function endOrbitDrag() {
  if (!isDraggingOrbit) return;
  isDraggingOrbit = false;
  orbitViewport.classList.remove('is-dragging');
  targetAngle = currentAngle + angularVelocity * 8;
  snapToNearestSlot();
}

orbitViewport.addEventListener('pointerup', endOrbitDrag);
orbitViewport.addEventListener('pointercancel', endOrbitDrag);

document.getElementById('prevOrbitBtn').addEventListener('click', () => {
  targetAngle += STEP_ANGLE;
  snapToNearestSlot();
});
document.getElementById('nextOrbitBtn').addEventListener('click', () => {
  targetAngle -= STEP_ANGLE;
  snapToNearestSlot();
});

const sizeGrid = document.getElementById('sizeGrid');
sizeGrid.addEventListener('click', (e) => {
  const pill = e.target.closest('.size-pill');
  if (!pill) return;
  sizeGrid.querySelectorAll('.size-pill').forEach((b) => b.classList.remove('active'));
  pill.classList.add('active');
});

const addToBagBtn = document.getElementById('addToBagBtn');
addToBagBtn.addEventListener('click', () => {
  bagItemsCount += 1;
  bagCountEl.textContent = String(bagItemsCount);
  const span = addToBagBtn.querySelector('span');
  const orig = span.textContent;
  span.textContent = 'Adicionado à sacola ✓';
  setTimeout(() => { span.textContent = orig; }, 1200);
});


// ============================================================================
// SEÇÃO 2: TRILHO SVG CURVO COM DESLIZE CENTRALIZADO + SPOTLIGHT (CAMISAS)
// ============================================================================
const SHIRTS = [
  {
    id: 'obsidian-tee',
    look: 'LOOK 01 // ARCHIVE',
    title: 'OBSIDIAN HEAVYWEIGHT TEE',
    fabric: 'Algodão Japonês 320g · Tingimento Mineral',
    price: 'R$ 429,00',
    desc: 'Camiseta boxy de alta gramatura com gola canelada dupla de 2.8cm e caimento arquitetônico estruturado.',
    image: 'assets/shirts/shirt-1.png?v=1'
  },
  {
    id: 'indigo-chambray',
    look: 'LOOK 02 // WORKWEAR',
    title: 'INDIGO CHAMBRAY OVERSHIRT',
    fabric: '100% Linho & Algodão Índigo Natural',
    price: 'R$ 649,00',
    desc: 'Camisa de manga longa tecida em tear antigo com micro-textura pontilhada e lavagem enzimática suave.',
    image: 'assets/shirts/shirt-2.png?v=1'
  },
  {
    id: 'sand-edition',
    look: 'LOOK 03 // TOKYO LAB',
    title: 'VINTAGE SAND GRAPHIC TEE',
    fabric: 'Malha Cardada Orgânica 280g',
    price: 'R$ 389,00',
    desc: 'Estampa serigráfica à base de água em azul cobalto sobre algodão cru não alvejado de toque macio.',
    image: 'assets/shirts/shirt-3.png?v=1'
  },
  {
    id: 'emerald-work',
    look: 'LOOK 04 // ARCHIVE',
    title: 'FOREST EMERALD WORK SHIRT',
    fabric: '100% Algodão Egípcio 340g',
    price: 'R$ 689,00',
    desc: 'Construção estruturada de alfaiataria utilitária com tingimento reativo em verde esmeralda profundo e botões escuros.',
    image: 'assets/shirts/shirt-4.png?v=1'
  },
  {
    id: 'oxblood-tee',
    look: 'LOOK 05 // STUDIO',
    title: 'OXBLOOD BURGUNDY BOX TEE',
    fabric: 'Jersey Compactado 310g · Toque Seco',
    price: 'R$ 449,00',
    desc: 'Silhueta ombro-caído em tom vinho Oxblood com costuras reversas reforçadas e selo tipográfico no peito.',
    image: 'assets/shirts/shirt-5.png?v=1'
  },
  {
    id: 'glacier-slate',
    look: 'LOOK 06 // EDITION',
    title: 'GLACIER SLATE GRAPHIC TEE',
    fabric: 'Algodão Pima Peruano 275g',
    price: 'R$ 419,00',
    desc: 'Tom cinza glacial frio combinado com gráfica contrastante em verde oliva ácido e acabamento anti-pilling.',
    image: 'assets/shirts/shirt-6.png?v=1'
  },
  {
    id: 'olive-utility',
    look: 'LOOK 07 // FIELD LAB',
    title: 'OLIVE DRAB UTILITY SHIRT',
    fabric: 'Sarja Leve Escovada 295g',
    price: 'R$ 669,00',
    desc: 'Inspirada em arquivos militares de 1970, com colarinho reforçado e respirabilidade térmica para meia-estação.',
    image: 'assets/shirts/shirt-7.png?v=1'
  },
  {
    id: 'midnight-navy',
    look: 'LOOK 08 // BESPOKE',
    title: 'MIDNIGHT NAVY STUDIO TEE',
    fabric: 'Algodão Supima Mercerizado 300g',
    price: 'R$ 439,00',
    desc: 'Acabamento acetinado discreto em azul marinho noturno com retenção de cor permanente e corte contemporâneo.',
    image: 'assets/shirts/shirt-8.png?v=1'
  }
];

const railStage = document.getElementById('railStage');
const railSvg = document.getElementById('railSvg');
const curvedRailPath = document.getElementById('curvedRailPath');
const railHooksGroup = document.getElementById('railHooksGroup');
const railGarmentsLayer = document.getElementById('railGarmentsLayer');
const railSpotlightGlow = document.getElementById('railSpotlightGlow');
const railPrevBtn = document.getElementById('railPrevBtn');
const railNextBtn = document.getElementById('railNextBtn');

// Elementos do Dock de Produto da Etapa 2
const railSeries = document.getElementById('railSeries');
const railFabric = document.getElementById('railFabric');
const railTitle = document.getElementById('railTitle');
const railDesc = document.getElementById('railDesc');
const railPrice = document.getElementById('railPrice');

const garmentEls = [];
const hookCircleEls = [];

const TOTAL_SHIRTS = SHIRTS.length;
let railCurrentPos = 3; // Começa com a camisa #04 exatamente no centro
let railTargetPos = 3;
let railVelocity = 0;
let isDraggingRail = false;
let railLastX = 0;
let railDragMoved = 0;
let activeShirtIndex = -1;

function initCurvedRailDOM() {
  railGarmentsLayer.innerHTML = '';
  railHooksGroup.innerHTML = '';
  railGarmentsLayer.classList.add('has-active-spotlight');

  SHIRTS.forEach((shirt, idx) => {
    const hookCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hookCircle.setAttribute('r', '5.5');
    hookCircle.setAttribute('class', 'rail-hook-ring');
    railHooksGroup.appendChild(hookCircle);
    hookCircleEls.push(hookCircle);

    const el = document.createElement('div');
    el.className = 'rail-garment';
    el.dataset.index = idx;
    el.innerHTML = `
      <div class="rail-garment__stem"></div>
      <img class="rail-garment__img" src="${shirt.image}" alt="${shirt.title}" draggable="false" />
      <div class="rail-garment__floating-tag">${shirt.price}</div>
    `;

    el.addEventListener('click', () => {
      if (railDragMoved < 8) {
        glideRailToIndex(idx);
      }
    });

    railGarmentsLayer.appendChild(el);
    garmentEls.push(el);
  });
}

function glideRailToIndex(targetIdx) {
  let diff = (targetIdx - railTargetPos) % TOTAL_SHIRTS;
  if (diff > TOTAL_SHIRTS / 2) diff -= TOTAL_SHIRTS;
  if (diff < -TOTAL_SHIRTS / 2) diff += TOTAL_SHIRTS;
  railTargetPos = Math.round(railTargetPos + diff);
}

function stepRail(deltaSteps) {
  railTargetPos = Math.round(railTargetPos + deltaSteps);
}

function snapRailToNearest() {
  railTargetPos = Math.round(railTargetPos);
}

function updateActiveShirtUI(centerIdx) {
  const normIdx = ((centerIdx % TOTAL_SHIRTS) + TOTAL_SHIRTS) % TOTAL_SHIRTS;
  if (normIdx === activeShirtIndex) return;
  activeShirtIndex = normIdx;

  const item = SHIRTS[activeShirtIndex];
  railSeries.textContent = item.look;
  railFabric.textContent = item.fabric;
  railTitle.textContent = item.title;
  railDesc.textContent = item.desc;
  railPrice.textContent = item.price;
}

function updateCurvedRailLayout() {
  if (!curvedRailPath) return;

  if (!isDraggingRail) {
    const delta = railTargetPos - railCurrentPos;
    railCurrentPos += delta * 0.11;
    railVelocity = delta * 0.11;
  }

  const totalLen = curvedRailPath.getTotalLength();
  const stageRect = railStage.getBoundingClientRect();
  const svgRect = railSvg.getBoundingClientRect();
  const stageW = stageRect.width || window.innerWidth;
  const svgH = svgRect.height || 220;
  const isMobile = stageW < 768;

  const slotStep = isMobile ? 0.135 : 0.115;

  let closestIndex = 0;
  let minAbsSlotDist = 999;

  for (let i = 0; i < TOTAL_SHIRTS; i++) {
    let relSlot = (i - railCurrentPos) % TOTAL_SHIRTS;
    if (relSlot > TOTAL_SHIRTS / 2) relSlot -= TOTAL_SHIRTS;
    if (relSlot < -TOTAL_SHIRTS / 2) relSlot += TOTAL_SHIRTS;

    const absSlot = Math.abs(relSlot);
    if (absSlot < minAbsSlotDist) {
      minAbsSlotDist = absSlot;
      closestIndex = i;
    }

    const centerGapPush = Math.sign(relSlot) * Math.min(absSlot, 1.0) * (isMobile ? 0.048 : 0.042);
    const rawT = 0.5 + relSlot * slotStep + centerGapPush;
    const clampedT = Math.max(0.02, Math.min(0.98, rawT));

    const lenAtShirt = clampedT * totalLen;
    const pt = curvedRailPath.getPointAtLength(lenAtShirt);

    const deltaL = 4;
    const pBefore = curvedRailPath.getPointAtLength(Math.max(0, lenAtShirt - deltaL));
    const pAfter = curvedRailPath.getPointAtLength(Math.min(totalLen, lenAtShirt + deltaL));
    const tangentRad = Math.atan2(pAfter.y - pBefore.y, pAfter.x - pBefore.x);
    const tangentDeg = (tangentRad * 180) / Math.PI;

    const hookCircle = hookCircleEls[i];
    hookCircle.setAttribute('cx', pt.x.toFixed(1));
    hookCircle.setAttribute('cy', pt.y.toFixed(1));

    const edgeFade = rawT < 0.03 || rawT > 0.97 ? 0 : 1;
    hookCircle.style.opacity = String(edgeFade);

    const pixelX = (pt.x / 1400) * stageW;
    const pixelY = (pt.y / 240) * svgH;

    const centerProximity = Math.max(0, 1 - absSlot * 1.15);
    const isCenterSpotlight = absSlot < 0.45;

    hookCircle.classList.toggle('is-active', isCenterSpotlight);

    const baseScale = isMobile ? 0.86 : 0.88;
    const boostScale = isMobile ? 0.52 : 0.42;
    const scale = baseScale + Math.pow(centerProximity, 1.5) * boostScale;

    const swingDeg = Math.max(-10, Math.min(10, -railVelocity * 24));
    const rotDeg = (tangentDeg * 0.32 * (1 - centerProximity)) + swingDeg;
    const liftY = -centerProximity * 6;

    const el = garmentEls[i];
    el.style.left = `${pixelX.toFixed(1)}px`;
    el.style.top = `${pixelY.toFixed(1)}px`;
    el.style.transform = `translate(-50%, ${liftY.toFixed(1)}px) rotate(${rotDeg.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    el.style.zIndex = String(Math.round(50 - absSlot * 10));
    el.classList.toggle('is-spotlight', isCenterSpotlight);

    if (edgeFade === 0) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    } else {
      el.style.opacity = '';
      el.style.pointerEvents = 'auto';
    }

    if (isCenterSpotlight) {
      railSpotlightGlow.style.left = `${pixelX.toFixed(1)}px`;
    }
  }

  updateActiveShirtUI(closestIndex);
}

function renderStage2Loop() {
  if (!stage2Container.classList.contains('hidden-stage')) {
    updateCurvedRailLayout();
  }
  requestAnimationFrame(renderStage2Loop);
}

railPrevBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  stepRail(-1);
});

railNextBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  stepRail(1);
});

railStage.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.rail-nav-arrow')) return;
  isDraggingRail = true;
  railLastX = e.clientX;
  railDragMoved = 0;
  railVelocity = 0;
  railStage.classList.add('is-dragging');
  try { railStage.setPointerCapture(e.pointerId); } catch (_) {}
});

railStage.addEventListener('pointermove', (e) => {
  if (!isDraggingRail) return;
  const dx = e.clientX - railLastX;
  railLastX = e.clientX;
  railDragMoved += Math.abs(dx);

  const stageW = railStage.clientWidth || window.innerWidth;
  const sensitivity = stageW < 768 ? 0.0065 : 0.0038;
  const deltaSlots = -dx * sensitivity;

  railCurrentPos += deltaSlots;
  railTargetPos = railCurrentPos;
  railVelocity = deltaSlots;
});

function endRailDrag() {
  if (!isDraggingRail) return;
  isDraggingRail = false;
  railStage.classList.remove('is-dragging');
  railTargetPos = railCurrentPos + railVelocity * 6;
  snapRailToNearest();
}

railStage.addEventListener('pointerup', endRailDrag);
railStage.addEventListener('pointercancel', endRailDrag);

window.addEventListener('keydown', (e) => {
  if (!stage2Container.classList.contains('hidden-stage')) {
    if (e.key === 'ArrowLeft') {
      stepRail(-1);
    } else if (e.key === 'ArrowRight') {
      stepRail(1);
    }
  } else {
    if (e.key === 'ArrowLeft') {
      targetAngle += STEP_ANGLE;
      snapToNearestSlot();
    } else if (e.key === 'ArrowRight') {
      targetAngle -= STEP_ANGLE;
      snapToNearestSlot();
    }
  }
});

const railSizes = document.getElementById('railSizes');
railSizes.addEventListener('click', (e) => {
  const btn = e.target.closest('.rail-size-btn');
  if (!btn) return;
  railSizes.querySelectorAll('.rail-size-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
});

const railBuyBtn = document.getElementById('railBuyBtn');
railBuyBtn.addEventListener('click', () => {
  bagItemsCount += 1;
  bagCountEl.textContent = String(bagItemsCount);
  const firstSpan = railBuyBtn.querySelector('span');
  const origText = firstSpan.textContent;
  firstSpan.textContent = 'Peça adicionada ✓';
  setTimeout(() => {
    firstSpan.textContent = origText;
  }, 1200);
});

initOrbitDOM();
initCurvedRailDOM();
requestAnimationFrame(renderOrbitFrame);
requestAnimationFrame(renderStage2Loop);

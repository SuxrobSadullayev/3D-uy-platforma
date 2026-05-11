// script.js - single-file app logic (final clean)

const STORAGE_ORDERS = 'orders';
const STORAGE_FAVORITES = 'favorites';

const houses = [
  { id: 1, title: 'Panoramik Uy', price: 85000, rooms: 3, area: 120, img: 'images/house1.svg', model: 'models/house.glb', description: "Panoramik ko'rinish, zamonaviy ta'mirlash." },
  { id: 2, title: 'Zamonaviy Studia', price: 42000, rooms: 1, area: 45, img: 'images/house2.svg', description: 'Yengil va ixcham studia.' },
  { id: 3, title: 'Kattaroq Villa', price: 125000, rooms: 4, area: 240, img: 'images/house3.svg', description: 'Katta hovli va lyuks sharoitlar.' }
];
// script.js - final clean single-file app

const STORAGE_ORDERS = 'orders';
const STORAGE_FAVORITES = 'favorites';

const houses = [
  { id: 1, title: 'Panoramik Uy', price: 85000, rooms: 3, area: 120, img: 'images/house1.svg', model: 'models/house.glb', description: "Panoramik ko'rinish, zamonaviy ta'mirlash." },
  { id: 2, title: 'Zamonaviy Studia', price: 42000, rooms: 1, area: 45, img: 'images/house2.svg', description: 'Yengil va ixcham studia.' },
  { id: 3, title: 'Kattaroq Villa', price: 125000, rooms: 4, area: 240, img: 'images/house3.svg', description: 'Katta hovli va lyuks sharoitlar.' }
];

let orders = [];
let favorites = [];

function loadState() {
  try { orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS) || '[]'); } catch (e) { orders = []; }
  try { favorites = JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || '[]'); } catch (e) { favorites = []; }
}

function saveState() {
  // script.js - final clean single-file app

  const STORAGE_ORDERS = 'orders';
  const STORAGE_FAVORITES = 'favorites';

  const houses = [
    { id: 1, title: 'Panoramik Uy', price: 85000, rooms: 3, area: 120, img: 'images/house1.svg', model: 'models/house.glb', description: "Panoramik ko'rinish, zamonaviy ta'mirlash." },
    { id: 2, title: 'Zamonaviy Studia', price: 42000, rooms: 1, area: 45, img: 'images/house2.svg', description: 'Yengil va ixcham studia.' },
    { id: 3, title: 'Kattaroq Villa', price: 125000, rooms: 4, area: 240, img: 'images/house3.svg', description: 'Katta hovli va lyuks sharoitlar.' }
  ];

  let orders = [];
  let favorites = [];

  function loadState() {
    try { orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS) || '[]'); } catch (e) { orders = []; }
    try { favorites = JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || '[]'); } catch (e) { favorites = []; }
  }

  function saveState() {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
    localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favorites));
  }

  function $(id) { return document.getElementById(id); }

  function toast(text, type = 'info', duration = 2200) {
    const el = $('toast'); if (!el) return; el.textContent = text; el.className = 'toast ' + type; el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, duration);
  }

  function isFavorite(id) { return favorites.includes(id); }
  function toggleFavorite(id) {
    const i = favorites.indexOf(id);
    if (i === -1) favorites.push(id); else favorites.splice(i, 1);
    saveState(); showFavorites(); applyAllFilters();
  }

  function findHouseById(id) { return houses.find(h => h.id === id); }

  function showHouses(list) {
    const cont = $('house-list'); if (!cont) return;
    if (!list) list = houses.slice();
    if (!list.length) { cont.innerHTML = '<p class="muted">Hech qanday uy topilmadi</p>'; return; }
    cont.innerHTML = list.map(h => `
      <div class="card">
        <img src="${h.img}" alt="${h.title}" />
        <div class="card-body">
          <h3>${h.title}</h3>
          <p class="meta">${h.rooms} xonali · ${h.area} m²</p>
          <p class="price">$${h.price.toLocaleString()}</p>
          <div class="card-actions">
            <button class="btn" onclick="openViewerModal(${h.id})">3D ko'rish</button>
            <button class="btn" onclick="showHouse(${h.id})">Batafsil</button>
            <button class="btn btn-ghost" onclick="toggleFavorite(${h.id})">${isFavorite(h.id)?'💖':'🤍'}</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function showHouse(id) {
    const h = findHouseById(id); const info = $('info'); if (!h || !info) return;
    info.innerHTML = `
      <div class="detail">
        <h2>${h.title} ${isFavorite(h.id)?'💖':''}</h2>
        <p class="meta">${h.rooms} xonali · ${h.area} m² · $${h.price.toLocaleString()}</p>
        <img src="${h.img}" alt="${h.title}" style="width:100%;height:160px;object-fit:cover;border-radius:6px;" />
        <p style="margin-top:8px">${h.description}</p>
        <h4>Buyurtma yuborish</h4>
        <div class="order-form">
          <input id="order-name" placeholder="Ism" />
          <input id="order-phone" placeholder="Telefon" />
          <textarea id="order-note" placeholder="Izoh (ixtiyoriy)"></textarea>
          <button class="btn" onclick="submitOrderById(${h.id})">Buyurtma yuborish</button>
        </div>
      </div>
    `;
    info.scrollIntoView({ behavior: 'smooth' });
  }

  function submitOrderById(houseId) {
    const h = findHouseById(houseId); if (!h) return;
    const name = ($('order-name') || { value: '' }).value.trim();
    const phone = ($('order-phone') || { value: '' }).value.trim();
    const note = ($('order-note') || { value: '' }).value.trim();
    if (!name || !phone) { toast('Iltimos, ism va telefon kiriting', 'error'); return; }
    orders.push({ userName: name, userPhone: phone, house: h.title, note, createdAt: new Date().toISOString() });
    saveState(); showOrders(); toast('Buyurtma qabul qilindi', 'success');
  }

  function showOrders() {
    const el = $('orders-list'); if (!el) return;
    if (!orders.length) { el.innerHTML = '<p class="muted">Buyurtmalar yo‘q</p>'; return; }
    el.innerHTML = orders.map((o, i) => `
      <div class="order-item">
        <div>
          <p style="margin:0 0 4px 0;font-size:13px;"><b>${o.userName}</b></p>
          <p style="margin:0 0 4px 0;font-size:12px;color:#b0b8c1;">📞 ${o.userPhone}</p>
          <p style="margin:0 0 6px 0;font-size:12px;color:#7a8290;"><i>${o.house}</i></p>
          <p style="margin-top:6px;font-size:12px;">${o.note||''}</p>
        </div>
        <div>
          <button class="btn-small" onclick="deleteOrder(${i})">🗑 O'chirish</button>
        </div>
      </div>
    `).join('');
  }

  function deleteOrder(i) { if (i < 0 || i >= orders.length) return; orders.splice(i, 1); saveState(); showOrders(); toast('Buyurtma o‘chirildi', 'info'); }
  function clearOrders() { if (!confirm('Barcha buyurtmalar o‘chirilsinmi?')) return; orders = []; saveState(); showOrders(); }

  function exportOrdersCSV() {
    if (!orders.length) { toast('Eksport uchun buyurtma yo‘q', 'error'); return; }
    const header = ['Ism', 'Telefon', 'Uy', 'Izoh', 'Yaratilgan'];
    const rows = orders.map(o => [o.userName, o.userPhone, o.house, o.note || '', o.createdAt]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast('✅ CSV ga eksport qilindi', 'success');
  }

  function showFavorites() {
    const el = $('favorites-list'); if (!el) return;
    const list = favorites.map(id => findHouseById(id)).filter(Boolean);
    if (!list.length) { el.innerHTML = '<p class="muted">Sevimlilar bo`sh</p>'; return; }
    el.innerHTML = list.map(h => `
      <div class="fav-item"><img src="${h.img}" alt=""/><div><strong>${h.title}</strong><div class="muted">${h.rooms} xonali · $${h.price.toLocaleString()}</div></div><div><button class="btn-small" onclick="toggleFavorite(${h.id})">${isFavorite(h.id)?'💖':'🤍'}</button></div></div>
    `).join('');
  }

  function applyAllFilters() {
    const q = ($('search') || { value: '' }).value.trim().toLowerCase();
    const rooms = Number(($('rooms-filter') || { vaUylue: 0 }).value) || 0;
    const maxPrice = Number(($('max-price') || { value: '' }).value) || 0;
    const sort = ($('sort') || { value: '' }).value || '';
    let filtered = houses.slice();
    if (q) filtered = filtered.filter(h => (h.title + ' ' + (h.description || '')).toLowerCase().includes(q));
    if (rooms > 0) filtered = filtered.filter(h => h.rooms === rooms);
    if (maxPrice > 0) filtered = filtered.filter(h => h.price <= maxPrice);
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'area-desc') filtered.sort((a, b) => b.area - a.area);
    showHouses(filtered);
  }

  function clearFilters() { if ($('search')) $('search').value = ''; if ($('rooms-filter')) $('rooms-filter').value = ''; if ($('max-price')) $('max-price').value = ''; if ($('sort')) $('sort').value = ''; applyAllFilters(); }

  // 3D Viewer (basic, with placeholder)
  let viewerState = { renderer: null, scene: null, camera: null, animId: null };

  function openViewerModal(id) { const modal = $('viewer-modal'); if (!modal) return; modal.classList.remove('hidden'); start3DViewerModal(findHouseById(id)); }
  function closeViewerModal() { const modal = $('viewer-modal'); if (!modal) return; modal.classList.add('hidden'); stop3DViewer(); }

  function stop3DViewer() {
    if (viewerState.animId) cancelAnimationFrame(viewerState.animId);
    if (viewerState.renderer) {
      try { viewerState.renderer.dispose(); } catch (e) {}
      const cont = $('viewer'); if (cont) cont.innerHTML = '';
    }
    viewerState = { renderer: null, scene: null, camera: null, animId: null };
  }

  function start3DViewerModal(house) {
    const container = $('viewer'); if (!container) return; stop3DViewer();
    if (typeof THREE === 'undefined') { container.innerHTML = '<p class="muted">Three.js yuklanmadi</p>'; return; }
    const width = container.clientWidth || 600; const height = 320;
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000); camera.position.set(0, 1.5, 3);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setSize(width, height); container.appendChild(renderer.domElement);
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0); scene.add(light);
    const grid = new THREE.GridHelper(10, 10, 0x888888, 0x222222); scene.add(grid);
    viewerState.renderer = renderer; viewerState.scene = scene; viewerState.camera = camera;
    if (house && house.model && window.THREE && window.THREE.GLTFLoader) {
      const loader = new THREE.GLTFLoader();
      loader.load(house.model, gltf => { const model = gltf.scene || (gltf.scenes && gltf.scenes[0]); if (model) { model.position.set(0, 0, 0); scene.add(model); } }, undefined, err => { scene.add(createPlaceholderMesh()); });
    } else { scene.add(createPlaceholderMesh()); }
    function animate() { viewerState.animId = requestAnimationFrame(animate); renderer.render(scene, camera); }
    animate();
  }

  function createPlaceholderMesh() {
    if (typeof THREE === 'undefined') return document.createElement('div');
    const g = new THREE.BoxGeometry(1, 0.6, 1); const m = new THREE.MeshStandardMaterial({ color: 0x6c91c2 }); const box = new THREE.Mesh(g, m); box.position.y = 0.3; const grp = new THREE.Group(); grp.add(box); return grp;
  }

  // Simple assistant (rule-based)
  function assistantProcess() {
    const input = $('assistant-query'); const out = $('assistant-output'); if (!input || !out) return; const q = (input.value || '').trim().toLowerCase();
    if (!q) { out.textContent = 'Savol kiriting...'; return; }
    const m = q.match(/\b(1|2|3|4)\b/);
    if (m) { const rooms = Number(m[1]); const found = houses.filter(h => h.rooms === rooms); out.innerHTML = `Topilgan: ${found.length} ta uy. <button onclick="applyAssistantFilter(${rooms})">Ko'rsat</button>`; return; }
    const n = q.match(/(\d{3,6})/);
    if (n) { const price = Number(n[1]); out.innerHTML = `Max narx: ${price}. <button onclick="applyAssistantPrice(${price})">Qo'llash</button>`; return; }
    if (q.includes('salom') || q.includes('hello')) { out.textContent = 'Salom! Misollar: "2 xonali" yoki "narx 50000"'; return; }
    out.textContent = 'Kechirasiz, tushunmadim. Misol uchun: "2 xonali" yoki "narx 50000"';
  }

  function applyAssistantFilter(rooms) { if ($('rooms-filter')) $('rooms-filter').value = rooms; applyAllFilters(); }
  function applyAssistantPrice(p) { if ($('max-price')) $('max-price').value = p; applyAllFilters(); }

  // Wiring
  window.addEventListener('DOMContentLoaded', () => {
    loadState();
    if ($('search')) $('search').addEventListener('input', applyAllFilters);
    if ($('rooms-filter')) $('rooms-filter').addEventListener('change', applyAllFilters);
    if ($('max-price')) $('max-price').addEventListener('input', applyAllFilters);
    if ($('sort')) $('sort').addEventListener('change', applyAllFilters);
    if ($('clear-filters')) $('clear-filters').addEventListener('click', clearFilters);
    if ($('export-orders')) $('export-orders').addEventListener('click', exportOrdersCSV);
    if ($('clear-orders')) $('clear-orders').addEventListener('click', clearOrders);
    if ($('assistant-send')) $('assistant-send').addEventListener('click', assistantProcess);
    if ($('close-viewer')) $('close-viewer').addEventListener('click', closeViewerModal);
    if ($('viewer-modal')) $('viewer-modal').addEventListener('click', e => { if (e.target === $('viewer-modal')) closeViewerModal(); });
    showHouses(houses); showFavorites(); showOrders();
  });

  // expose handlers used by inline onclicks in the HTML
  window.openViewerModal = openViewerModal;
  window.closeViewerModal = closeViewerModal;
  window.showHouse = showHouse;
  window.submitOrderById = submitOrderById;
  window.deleteOrder = deleteOrder;
  window.exportOrdersCSV = exportOrdersCSV;
  window.toggleFavorite = toggleFavorite;
  window.applyAssistantFilter = applyAssistantFilter;
  window.applyAssistantPrice = applyAssistantPrice;

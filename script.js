const STORAGE_KEYS = {
    orders: 'uy_platforma_orders_v2',
    favorites: 'uy_platforma_favorites_v2',
    compare: 'uy_platforma_compare_v2'
};

const houses = [
    {
        id: 1,
        title: 'Registon Sky Loft',
        location: 'Registon maydoni · Samarqand markazi',
        district: 'Registon',
        price: 85000,
        rooms: 3,
        area: 120,
        floor: '7/12',
        roi: 12.4,
        match: 92,
        liquidity: 'Yuqori',
        image: 'images/house1.svg',
        model: 'models/house.glb',
        tags: ['Panorama', 'Smart home', 'Parking'],
        description: "Turistik markazga yaqin, keng balkonli va premium ta'mirlangan xonadon. Airbnb va uzoq muddatli ijara uchun kuchli variant."
    },
    {
        id: 2,
        title: 'Silk Road Smart Studio',
        location: 'Universitet bulvari · Transportga yaqin',
        district: 'Universitet',
        price: 42000,
        rooms: 1,
        area: 45,
        floor: '4/9',
        roi: 15.1,
        match: 88,
        liquidity: "O'rta+",
        image: 'images/house2.svg',
        tags: ['Startap narx', 'Ijara uchun', 'Lift'],
        description: 'Yosh mutaxassislar va talabalar uchun ixcham studiya. Past kirish narxi va yuqori ijara talabi bilan ajralib turadi.'
    },
    {
        id: 3,
        title: 'Eco Garden Residence',
        location: "Bog'ishamol · Yashil hudud",
        district: "Bog'ishamol",
        price: 125000,
        rooms: 4,
        area: 240,
        floor: '2 qavat',
        roi: 9.8,
        match: 84,
        liquidity: 'Premium',
        image: 'images/house3.svg',
        tags: ['Hovli', 'Oilaviy', 'Quyosh paneli'],
        description: 'Katta hovli, alohida ish xonasi va energiya tejamkor yechimlarga ega villa. Oilaviy yashash uchun tayyor.'
    },
    {
        id: 4,
        title: 'Afrosiyob Business Flat',
        location: 'Afrosiyob vokzali · Biznes zona',
        district: 'Afrosiyob',
        price: 68000,
        rooms: 2,
        area: 78,
        floor: '10/16',
        roi: 13.7,
        match: 90,
        liquidity: 'Yuqori',
        image: 'images/house2.svg',
        tags: ['Vokzal', 'Coworking', 'Qo‘riqlash'],
        description: 'Tezkor transport, biznes markazlar va xizmat ko‘rsatish obyektlariga yaqin xonadon. Korporativ ijara uchun mos.'
    }
];

let state = {
    filtered: houses.slice(),
    favorites: [],
    orders: [],
    compare: [],
    view: 'grid'
};

let viewerState = { renderer: null, scene: null, camera: null, frame: null, model: null, drag: false, lastX: 0 };

const $ = (id) => document.getElementById(id);
const formatUsd = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const findHouse = (id) => houses.find((house) => house.id === Number(id));
const safeParse = (key, fallback) => {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
};

function loadState() {
    state.orders = safeParse(STORAGE_KEYS.orders, []);
    state.favorites = safeParse(STORAGE_KEYS.favorites, []);
    state.compare = safeParse(STORAGE_KEYS.compare, []);
}

function persistState() {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(state.orders));
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
    localStorage.setItem(STORAGE_KEYS.compare, JSON.stringify(state.compare));
}

function toast(message, type = 'success') {
    const element = $('toast');
    if (!element) return;
    element.textContent = message;
    element.className = `toast show ${type}`;
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => element.className = 'toast', 2600);
}

function renderMetrics() {
    const metric = $('metric-count');
    if (metric) metric.textContent = houses.length;
}

function renderHouses(list = state.filtered) {
    const container = $('house-list');
    const count = $('result-count');
    if (!container) return;
    if (count) count.textContent = list.length;
    container.classList.toggle('list-view', state.view === 'list');

    if (!list.length) {
        container.innerHTML = '<div class="panel-block empty">Mos obyekt topilmadi. Filtrlarni yumshatib ko‘ring.</div>';
        return;
    }

    container.innerHTML = list.map((house) => `
        <article class="house-card">
            <img src="${house.image}" alt="${house.title}">
            <div class="card-body">
                <div class="card-top">
                    <div>
                        <h3>${house.title}</h3>
                        <p class="location">${house.location}</p>
                    </div>
                    <div class="price">${formatUsd(house.price)}</div>
                </div>
                <p class="description">${house.description}</p>
                <div class="badges">
                    <span class="badge score">${house.match}% mos</span>
                    <span class="badge">${house.rooms} xona</span>
                    <span class="badge">${house.area} m²</span>
                    <span class="badge">ROI ${house.roi}%</span>
                    ${house.tags.map((tag) => `<span class="badge">${tag}</span>`).join('')}
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" data-open-viewer="${house.id}">3D ko'rish</button>
                    <button class="btn btn-ghost" data-detail="${house.id}">Batafsil</button>
                    <button class="btn btn-muted" data-favorite="${house.id}">${state.favorites.includes(house.id) ? '💚 Saqlandi' : '♡ Saqlash'}</button>
                    <button class="btn btn-muted" data-compare="${house.id}">Taqqoslash</button>
                </div>
            </div>
        </article>
    `).join('');
}

function filterHouses() {
    const query = ($('search')?.value || '').trim().toLowerCase();
    const rooms = Number($('rooms-filter')?.value || 0);
    const maxPrice = Number($('max-price')?.value || 0);
    const sort = $('sort')?.value || 'match';

    state.filtered = houses.filter((house) => {
        const haystack = `${house.title} ${house.location} ${house.district} ${house.description} ${house.tags.join(' ')}`.toLowerCase();
        const byQuery = !query || haystack.includes(query);
        const byRooms = !rooms || (rooms === 4 ? house.rooms >= 4 : house.rooms === rooms);
        const byPrice = !maxPrice || house.price <= maxPrice;
        return byQuery && byRooms && byPrice;
    });

    const sorters = {
        match: (a, b) => b.match - a.match,
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        'area-desc': (a, b) => b.area - a.area,
        'roi-desc': (a, b) => b.roi - a.roi
    };
    state.filtered.sort(sorters[sort] || sorters.match);
    renderHouses();
}

function clearFilters() {
    ['search', 'max-price'].forEach((id) => { if ($(id)) $(id).value = ''; });
    if ($('rooms-filter')) $('rooms-filter').value = '0';
    if ($('sort')) $('sort').value = 'match';
    filterHouses();
}

function renderDetail(id) {
    const house = findHouse(id);
    const panel = $('info');
    if (!house || !panel) return;
    panel.classList.remove('hidden');
    panel.innerHTML = `
        <div class="detail-layout">
            <img src="${house.image}" alt="${house.title}">
            <div>
                <span class="eyebrow">Batafsil ma'lumot</span>
                <h2>${house.title}</h2>
                <p class="location">${house.location}</p>
                <p class="description">${house.description}</p>
                <div class="spec-grid">
                    <div><span>Narx</span><strong>${formatUsd(house.price)}</strong></div>
                    <div><span>Maydon</span><strong>${house.area} m²</strong></div>
                    <div><span>Qavat</span><strong>${house.floor}</strong></div>
                    <div><span>Likvidlik</span><strong>${house.liquidity}</strong></div>
                    <div><span>ROI</span><strong>${house.roi}%</strong></div>
                    <div><span>AI moslik</span><strong>${house.match}%</strong></div>
                </div>
                <form class="order-form" data-order-form="${house.id}">
                    <input name="name" required placeholder="Ismingiz">
                    <input name="phone" required placeholder="Telefon raqam">
                    <textarea name="note" rows="3" placeholder="Qulay vaqt yoki savol"></textarea>
                    <button class="btn btn-primary" type="submit">Bron so'rovi yuborish</button>
                </form>
            </div>
        </div>
    `;
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function submitOrder(form) {
    const id = Number(form.dataset.orderForm);
    const house = findHouse(id);
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const note = String(data.get('note') || '').trim();

    if (!house || !name || !phone) {
        toast('Ism va telefon raqamni kiriting.', 'error');
        return;
    }

    state.orders.unshift({ id: Date.now(), houseId: house.id, house: house.title, name, phone, note, createdAt: new Date().toISOString() });
    persistState();
    renderOrders();
    form.reset();
    toast('Buyurtma CRM ro‘yxatiga qo‘shildi.');
}

function renderOrders() {
    const container = $('orders-list');
    if (!container) return;
    container.classList.toggle('empty', !state.orders.length);
    if (!state.orders.length) {
        container.textContent = "Buyurtma yo'q.";
        return;
    }
    container.innerHTML = state.orders.map((order) => `
        <div class="order-item">
            <div>
                <strong>${order.name}</strong> · <span class="muted">${order.phone}</span>
                <div>${order.house}</div>
                <small class="muted">${new Date(order.createdAt).toLocaleString('uz-UZ')}${order.note ? ` · ${order.note}` : ''}</small>
            </div>
            <button class="btn btn-muted" data-delete-order="${order.id}">O'chirish</button>
        </div>
    `).join('');
}

function renderFavorites() {
    const container = $('favorites-list');
    if (!container) return;
    const favorites = state.favorites.map(findHouse).filter(Boolean);
    container.classList.toggle('empty', !favorites.length);
    if (!favorites.length) {
        container.textContent = "Sevimlilar bo'sh.";
        return;
    }
    container.innerHTML = favorites.map((house) => `
        <div class="mini-item">
            <strong>${house.title}</strong>
            <span class="muted">${formatUsd(house.price)} · ${house.rooms} xona · ROI ${house.roi}%</span>
        </div>
    `).join('');
}

function renderCompare() {
    const container = $('compare-list');
    if (!container) return;
    const selected = state.compare.map(findHouse).filter(Boolean);
    container.classList.toggle('empty', !selected.length);
    if (!selected.length) {
        container.textContent = 'Hali obyekt tanlanmagan.';
        return;
    }
    container.innerHTML = selected.map((house) => `
        <div class="mini-item">
            <strong>${house.title}</strong>
            <span class="muted">${formatUsd(house.price)} · ${house.area} m² · ${house.match}% mos</span>
        </div>
    `).join('');
}

function toggleFavorite(id) {
    const houseId = Number(id);
    state.favorites = state.favorites.includes(houseId)
        ? state.favorites.filter((item) => item !== houseId)
        : [...state.favorites, houseId];
    persistState();
    renderHouses();
    renderFavorites();
}

function toggleCompare(id) {
    const houseId = Number(id);
    if (state.compare.includes(houseId)) {
        state.compare = state.compare.filter((item) => item !== houseId);
    } else if (state.compare.length >= 3) {
        toast('Taqqoslash uchun ko‘pi bilan 3 ta obyekt tanlanadi.', 'error');
        return;
    } else {
        state.compare.push(houseId);
    }
    persistState();
    renderCompare();
}

function askAssistant() {
    const input = $('assistant-query');
    const output = $('assistant-output');
    if (!input || !output) return;
    const query = input.value.trim().toLowerCase();
    if (!query) {
        output.textContent = 'Savol yozing: masalan, “2 xonali 60000 gacha”.';
        return;
    }

    const budget = query.match(/(\d{4,6})/);
    const rooms = query.match(/\b(1|2|3|4)\b/);
    if (budget && $('max-price')) $('max-price').value = budget[1];
    if (rooms && $('rooms-filter')) $('rooms-filter').value = rooms[1];
    if ((query.includes('invest') || query.includes('ijara')) && $('sort')) $('sort').value = 'roi-desc';
    if ((query.includes('katta') || query.includes('maydon')) && $('sort')) $('sort').value = 'area-desc';

    filterHouses();
    const best = state.filtered[0];
    output.innerHTML = best
        ? `<strong>${best.title}</strong> tavsiya qilinadi: ${formatUsd(best.price)}, ${best.area} m², ROI ${best.roi}%, AI moslik ${best.match}%.`
        : 'Mos variant topilmadi. Budjet yoki xona sonini o‘zgartiring.';
}

function exportOrdersCSV() {
    if (!state.orders.length) {
        toast('Eksport uchun buyurtma yo‘q.', 'error');
        return;
    }
    const rows = [
        ['Ism', 'Telefon', 'Uy', 'Izoh', 'Yaratilgan'],
        ...state.orders.map((order) => [order.name, order.phone, order.house, order.note, order.createdAt])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell || '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uy-platforma-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('CSV eksport tayyor.');
}

function openViewer(id) {
    const house = findHouse(id) || houses[0];
    const modal = $('viewer-modal');
    const title = $('viewer-title');
    const subtitle = $('viewer-subtitle');
    if (!modal) return;
    if (title) title.textContent = house.title;
    if (subtitle) subtitle.textContent = `${house.location} · ${house.area} m² · ${formatUsd(house.price)}`;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    startViewer(house);
}

function closeViewer() {
    const modal = $('viewer-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }
    stopViewer();
}

function stopViewer() {
    if (viewerState.frame) cancelAnimationFrame(viewerState.frame);
    if (viewerState.renderer) viewerState.renderer.dispose();
    const container = $('viewer');
    if (container) container.innerHTML = '';
    viewerState = { renderer: null, scene: null, camera: null, frame: null, model: null, drag: false, lastX: 0 };
}

function startViewer(house) {
    const container = $('viewer');
    stopViewer();
    if (!container) return;
    if (!window.THREE) {
        container.innerHTML = '<div class="panel-block empty">Three.js internet orqali yuklanmadi, ammo platforma 3D viewer uchun tayyor.</div>';
        return;
    }

    const width = container.clientWidth || 900;
    const height = 460;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3.8, 2.6, 5.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.append(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a2b45, 1.4));
    const directional = new THREE.DirectionalLight(0xffffff, 1.1);
    directional.position.set(5, 8, 4);
    scene.add(directional);
    scene.add(new THREE.GridHelper(10, 20, 0x36b7ff, 0x163253));

    const placeholder = createHouseMesh(house);
    scene.add(placeholder);
    viewerState = { renderer, scene, camera, frame: null, model: placeholder, drag: false, lastX: 0 };

    if (house.model && window.THREE.GLTFLoader) {
        const loader = new THREE.GLTFLoader();
        loader.load(house.model, (gltf) => {
            const loaded = gltf.scene || gltf.scenes?.[0];
            if (!loaded) return;
            scene.remove(placeholder);
            loaded.scale.setScalar(1.2);
            loaded.position.set(0, 0, 0);
            scene.add(loaded);
            viewerState.model = loaded;
        }, undefined, () => toast('GLB model topilmadi, demo maket ko‘rsatildi.', 'error'));
    }

    container.addEventListener('pointerdown', (event) => { viewerState.drag = true; viewerState.lastX = event.clientX; });
    container.addEventListener('pointerup', () => { viewerState.drag = false; });
    container.addEventListener('pointerleave', () => { viewerState.drag = false; });
    container.addEventListener('pointermove', (event) => {
        if (!viewerState.drag || !viewerState.model) return;
        const delta = event.clientX - viewerState.lastX;
        viewerState.model.rotation.y += delta * 0.01;
        viewerState.lastX = event.clientX;
    });

    function animate() {
        viewerState.frame = requestAnimationFrame(animate);
        if (viewerState.model && !viewerState.drag) viewerState.model.rotation.y += 0.006;
        renderer.render(scene, camera);
    }
    animate();
}

function createHouseMesh(house) {
    const group = new THREE.Group();
    const baseMaterial = new THREE.MeshStandardMaterial({ color: house.id === 3 ? 0x4ee1a0 : 0x36b7ff, roughness: 0.45, metalness: 0.08 });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeaf4ff, roughness: 0.6 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x0f2138, roughness: 0.5 });
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x8fe8ff, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.72 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 2.6), baseMaterial);
    base.position.y = 0.11;
    group.add(base);

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.45, 1.8), wallMaterial);
    body.position.y = 0.95;
    group.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.85, 0.85, 4), roofMaterial);
    roof.position.y = 1.98;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    for (let i = -1; i <= 1; i += 1) {
        const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.04), glassMaterial);
        windowMesh.position.set(i * 0.62, 1.05, 0.93);
        group.add(windowMesh);
    }

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.05), roofMaterial);
    door.position.set(0, 0.62, 0.94);
    group.add(door);

    group.position.y = -0.2;
    return group;
}

function bindEvents() {
    ['search', 'rooms-filter', 'max-price', 'sort'].forEach((id) => $(id)?.addEventListener('input', filterHouses));
    $('apply-filters')?.addEventListener('click', filterHouses);
    $('clear-filters')?.addEventListener('click', clearFilters);
    $('assistant-send')?.addEventListener('click', askAssistant);
    $('assistant-query')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') askAssistant(); });
    $('export-orders')?.addEventListener('click', exportOrdersCSV);
    $('clear-orders')?.addEventListener('click', () => { state.orders = []; persistState(); renderOrders(); toast('Buyurtmalar tozalandi.'); });
    $('clear-compare')?.addEventListener('click', () => { state.compare = []; persistState(); renderCompare(); });
    $('close-viewer')?.addEventListener('click', closeViewer);
    $('viewer-modal')?.addEventListener('click', (event) => { if (event.target === $('viewer-modal')) closeViewer(); });

    document.addEventListener('click', (event) => {
        const target = event.target.closest('button, a');
        if (!target) return;
        if (target.dataset.scroll) $(target.dataset.scroll.slice(1))?.scrollIntoView({ behavior: 'smooth' });
        if (target.dataset.openViewer) openViewer(target.dataset.openViewer);
        if (target.dataset.detail) renderDetail(target.dataset.detail);
        if (target.dataset.favorite) toggleFavorite(target.dataset.favorite);
        if (target.dataset.compare) toggleCompare(target.dataset.compare);
        if (target.dataset.deleteOrder) {
            state.orders = state.orders.filter((order) => order.id !== Number(target.dataset.deleteOrder));
            persistState();
            renderOrders();
        }
        if (target.dataset.view) {
            state.view = target.dataset.view;
            document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('is-active', button.dataset.view === state.view));
            renderHouses();
        }
    });

    document.addEventListener('submit', (event) => {
        const form = event.target.closest('[data-order-form]');
        if (!form) return;
        event.preventDefault();
        submitOrder(form);
    });

    window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeViewer(); });
}

function init() {
    loadState();
    bindEvents();
    renderMetrics();
    filterHouses();
    renderOrders();
    renderFavorites();
    renderCompare();
}

window.addEventListener('DOMContentLoaded', init);

/* ==========================================================================
   Shirwal Tiffin — script.js
   Reusable, well-commented, no framework, no backend.
   ========================================================================== */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '917066644476'; // country code + number, no + or spaces

  /* ---------------- Menu data (single source of truth) ---------------- */
  // Lunch and dinner both offer the same four thali options.
  const THALI_OPTIONS = [
    { key: 'veg', name: 'Veg Thali', type: 'Veg', price: 120, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', desc: 'Roti, seasonal sabzi, dal, rice and salad.' },
    { key: 'chicken', name: 'Chicken Thali', type: 'Non-Veg', price: 240, img: 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=800&q=80', desc: 'Home-style chicken curry with roti and rice.' },
    { key: 'mutton', name: 'Mutton Thali', type: 'Non-Veg', price: 360, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', desc: 'Slow-cooked mutton curry with roti and rice.' },
    { key: 'fish', name: 'Fish Thali', type: 'Non-Veg', price: 360, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', desc: 'Coastal-style fish curry with rice and salad.' }
  ];

  const MENU_ITEMS = [];
  ['lunch', 'dinner'].forEach((meal) => {
    THALI_OPTIONS.forEach((opt) => {
      MENU_ITEMS.push({
        id: `${meal}-${opt.key}`,
        name: `${opt.name} (${meal === 'lunch' ? 'Lunch' : 'Dinner'})`,
        type: opt.type,
        price: opt.price,
        img: opt.img,
        desc: opt.desc,
        meal
      });
    });
  });

  const EXTRA_ITEMS = [
    { id: 'extra-roti', name: 'Extra Roti', price: 10, icon: '🫓' },
    { id: 'extra-rice', name: 'Extra Rice', price: 30, icon: '🍚' },
    { id: 'extra-water', name: 'Water Bottle', price: 20, icon: '💧' }
  ];

  // Flat lookup of every orderable item, keyed by id
  const ALL_ITEMS = {};
  [...MENU_ITEMS, ...EXTRA_ITEMS].forEach((item) => { ALL_ITEMS[item.id] = item; });

  /* ---------------- Cart state ---------------- */
  // cart = { itemId: quantity }
  let cart = {};

  function getCartCount() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }

  function getCartTotal() {
    return Object.entries(cart).reduce((sum, [id, qty]) => sum + (ALL_ITEMS[id]?.price || 0) * qty, 0);
  }

  function setQuantity(id, qty) {
    if (qty <= 0) delete cart[id];
    else cart[id] = qty;
    renderCartCount();
    renderMenuQuantities();
    renderCartDrawer();
  }

  function addOne(id) {
    setQuantity(id, (cart[id] || 0) + 1);
  }

  function removeOne(id) {
    setQuantity(id, (cart[id] || 0) - 1);
  }

  /* ---------------- Page loader ---------------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) setTimeout(() => loader.classList.add('is-hidden'), 360);
  });

  /* ---------------- Sticky navbar + scroll-to-top ---------------- */
  const navbar = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scrollTop');

  function handleScroll() {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('is-scrolled', scrolled);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('is-visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (scrollTopBtn) scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------------- Mobile hamburger menu ---------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Scroll-reveal animations ---------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : 0;
          setTimeout(() => el.classList.add('is-visible'), delay);
          revealObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  function observeReveals(root = document) {
    root.querySelectorAll('.reveal-up:not(.is-visible)').forEach((el) => revealObserver.observe(el));
  }
  observeReveals();

  /* ---------------- Animated counters ---------------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString('en-IN');
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll('.stat-num').forEach((el) => counterObserver.observe(el));

  /* ---------------- Hero parallax on mouse move ---------------- */
  const parallaxTiffin = document.getElementById('parallaxTiffin');
  if (parallaxTiffin && window.matchMedia('(min-width: 1025px)').matches) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      parallaxTiffin.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ---------------- Menu tabs ---------------- */
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuPanels = document.querySelectorAll('.menu-panel');

  menuTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      menuTabs.forEach((t) => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      menuPanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === target));
    });
  });

  /* ---------------- Render menu + extras cards ---------------- */
  function renderQtyControlHTML(id) {
    const qty = cart[id] || 0;
    if (qty === 0) {
      return `<button class="btn btn-sm btn-primary btn-add" data-add="${id}">Add to Cart</button>`;
    }
    return `
      <div class="qty-stepper" data-stepper="${id}">
        <button class="qty-btn" data-remove="${id}" aria-label="Remove one">−</button>
        <span class="qty-value">${qty}</span>
        <button class="qty-btn" data-add="${id}" aria-label="Add one more">+</button>
      </div>`;
  }

  function renderMenuGrid(meal) {
    const grid = document.querySelector(`[data-cart-grid="${meal}"]`);
    if (!grid) return;

    const items = MENU_ITEMS.filter((item) => item.meal === meal);
    grid.innerHTML = items.map((item, i) => `
      <article class="menu-card reveal-up" data-delay="${i * 80}">
        <div class="menu-card-img">
          <img src="${item.img}" alt="${item.name}" loading="lazy" width="800" height="600">
          <span class="menu-badge ${item.type === 'Veg' ? 'menu-badge-green' : 'menu-badge-orange'}">${item.type === 'Veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
        </div>
        <div class="menu-card-body">
          <h3>${item.name}</h3>
          <p class="menu-desc">${item.desc}</p>
          <div class="menu-footer">
            <span class="menu-price">₹${item.price}</span>
            <div class="menu-card-action" data-qty-slot="${item.id}">${renderQtyControlHTML(item.id)}</div>
          </div>
        </div>
      </article>
    `).join('');

    observeReveals(grid);
  }

  function renderExtrasGrid() {
    const grid = document.querySelector('[data-cart-grid="extras"]');
    if (!grid) return;

    grid.innerHTML = EXTRA_ITEMS.map((item) => `
      <div class="extra-card">
        <div class="extra-info">
          <span class="extra-icon">${item.icon}</span>
          <div>
            <strong>${item.name}</strong>
            <span class="extra-price">₹${item.price}</span>
          </div>
        </div>
        <div class="menu-card-action" data-qty-slot="${item.id}">${renderQtyControlHTML(item.id)}</div>
      </div>
    `).join('');
  }

  function renderMenuQuantities() {
    // Re-render just the quantity control for every item currently on the page
    document.querySelectorAll('[data-qty-slot]').forEach((slot) => {
      const id = slot.dataset.qtySlot;
      slot.innerHTML = renderQtyControlHTML(id);
    });
  }

  renderMenuGrid('lunch');
  renderMenuGrid('dinner');
  renderExtrasGrid();

  // Event delegation for every add/remove button (menu cards + extras + cart drawer)
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    const removeBtn = e.target.closest('[data-remove]');
    if (addBtn) addOne(addBtn.dataset.add);
    if (removeBtn) removeOne(removeBtn.dataset.remove);
  });

  /* ---------------- Cart count badges (nav, mobile bar, floating button) ---------------- */
  function renderCartCount() {
    const count = getCartCount();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.classList.toggle('is-empty', count === 0);
    });
  }

  /* ---------------- Cart drawer ---------------- */
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooterEl = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
  const floatCartBtn = document.getElementById('floatCartBtn');

  function renderCartDrawer() {
    const entries = Object.entries(cart);
    const isEmpty = entries.length === 0;

    cartEmptyEl.style.display = isEmpty ? 'flex' : 'none';
    cartItemsEl.style.display = isEmpty ? 'none' : 'flex';
    cartFooterEl.style.display = isEmpty ? 'none' : 'block';

    if (!isEmpty) {
      cartItemsEl.innerHTML = entries.map(([id, qty]) => {
        const item = ALL_ITEMS[id];
        if (!item) return '';
        return `
          <div class="cart-line">
            <div class="cart-line-info">
              <strong>${item.name}</strong>
              <span>₹${item.price} each</span>
            </div>
            <div class="qty-stepper" data-stepper="${id}">
              <button class="qty-btn" data-remove="${id}" aria-label="Remove one">−</button>
              <span class="qty-value">${qty}</span>
              <button class="qty-btn" data-add="${id}" aria-label="Add one more">+</button>
            </div>
            <span class="cart-line-total">₹${item.price * qty}</span>
          </div>`;
      }).join('');

      cartTotalEl.textContent = `₹${getCartTotal()}`;
    }
  }

  function openCartDrawer() {
    renderCartDrawer();
    cartOverlay.classList.add('is-open');
    cartOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    cartOverlay.classList.remove('is-open');
    cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-cart]').forEach((btn) => btn.addEventListener('click', openCartDrawer));
  if (floatCartBtn) floatCartBtn.addEventListener('click', openCartDrawer);
  if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', (e) => { if (e.target === cartOverlay) closeCartDrawer(); });

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.accordion-item').forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.accordion-item').forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) { item.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------------- Checkout modal ---------------- */
  const orderModal = document.getElementById('orderModal');
  const modalClose = document.getElementById('modalClose');
  const orderForm = document.getElementById('orderForm');
  const checkoutSummaryEl = document.getElementById('checkoutSummary');
  const notesField = document.getElementById('ofNotes');

  function renderCheckoutSummary() {
    const entries = Object.entries(cart);
    if (entries.length === 0) {
      checkoutSummaryEl.innerHTML = `<p class="checkout-empty-note">No items in cart — this will be sent as a plan / custom request based on your notes below.</p>`;
      return;
    }
    const rows = entries.map(([id, qty]) => {
      const item = ALL_ITEMS[id];
      return `<div class="checkout-row"><span>${item.name} × ${qty}</span><span>₹${item.price * qty}</span></div>`;
    }).join('');
    checkoutSummaryEl.innerHTML = `
      <div class="checkout-rows">${rows}</div>
      <div class="checkout-row checkout-total"><span>Total</span><span>₹${getCartTotal()}</span></div>
    `;
  }

  function openOrderModal(planNote) {
    renderCheckoutSummary();
    if (planNote && notesField && !notesField.value) notesField.value = planNote;

    orderModal.classList.add('is-open');
    orderModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeOrderModal() {
    orderModal.classList.remove('is-open');
    orderModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Plan buttons and any other data-open-order trigger go straight to checkout
  document.querySelectorAll('[data-open-order]').forEach((btn) => {
    btn.addEventListener('click', () => openOrderModal(btn.dataset.planNote || ''));
  });

  // "Checkout on WhatsApp" inside the cart drawer moves from cart → checkout form
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      closeCartDrawer();
      openOrderModal('');
    });
  }

  if (modalClose) modalClose.addEventListener('click', closeOrderModal);
  if (orderModal) orderModal.addEventListener('click', (e) => { if (e.target === orderModal) closeOrderModal(); });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (orderModal.classList.contains('is-open')) closeOrderModal();
    if (cartOverlay.classList.contains('is-open')) closeCartDrawer();
  });

  /* ---------------- Build & send WhatsApp order ---------------- */
  function buildWhatsAppMessage(data) {
    const entries = Object.entries(cart);
    const lines = ['🍱 *New Tiffin Order*', ''];

    lines.push(`👤 Name: ${data.name}`);
    lines.push(`📞 Phone: ${data.phone}`);
    lines.push(`📍 Address: ${data.address}`);
    lines.push('');

    if (entries.length > 0) {
      lines.push('🧾 *Order Items:*');
      entries.forEach(([id, qty]) => {
        const item = ALL_ITEMS[id];
        if (item) lines.push(`• ${item.name} × ${qty} — ₹${item.price * qty}`);
      });
      lines.push(`💰 *Total: ₹${getCartTotal()}*`);
      lines.push('');
    }

    lines.push(`🕒 Preferred Delivery Time: ${data.time}`);
    lines.push(`📝 Additional Notes: ${data.notes || 'None'}`);
    lines.push('');
    lines.push('Please confirm my order.');

    return lines.join('\n');
  }

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(orderForm);
      const data = Object.fromEntries(formData.entries());

      const message = buildWhatsAppMessage(data);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(url, '_blank', 'noopener');
      closeOrderModal();
      orderForm.reset();

      // Clear the cart after a successful checkout
      cart = {};
      renderCartCount();
      renderMenuQuantities();
      renderCartDrawer();
    });
  }

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Other Enquiry form (separate from cart checkout) ---------------- */
  const enquiryForm = document.getElementById('enquiryForm');

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(enquiryForm);
      const data = Object.fromEntries(formData.entries());

      const message = [
        '📩 *New Enquiry*',
        '',
        `👤 Name: ${data.name}`,
        `📞 Phone: ${data.phone}`,
        `📝 Message: ${data.message}`,
        '',
        'Looking forward to your reply.'
      ].join('\n');

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener');
      enquiryForm.reset();
    });
  }

  /* ---------------- Initial render ---------------- */
  renderCartCount();
  renderCartDrawer();

})();

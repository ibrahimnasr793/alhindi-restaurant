const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxra7_hYx9aSEF8VCjBkQfyAgw5e6I8aqCNdWiuTsBVJ0E35BAzACiNrEnoVB0xOVu7mQ/exec";

let cart = JSON.parse(localStorage.getItem("alhindi_cart") || "[]");

function saveCart() {
  localStorage.setItem("alhindi_cart", JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id, name, price) {
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart();
  showToast(`✅ تمت إضافة ${name} للسلة`);
  animateCartIcon();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function getTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function updateCartUI() {
  const badge = document.getElementById("cart-badge");
  const total = cart.reduce((s, i) => s + i.qty, 0);
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? "flex" : "none";
  }
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><div class="empty-icon">🛒</div><p>السلة فارغة</p></div>`;
    if (totalEl) totalEl.textContent = "0";
    return;
  }

  container.innerHTML = cart.map((item) => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">${item.price} جنيه</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">🗑️</button>
      </div>
      <div class="cart-item-subtotal">${item.price * item.qty} جنيه</div>
    </div>
  `).join("");

  if (totalEl) totalEl.textContent = getTotal().toLocaleString("ar-EG");
}

function openCart() {
  const overlay = document.getElementById("cart-overlay");
  if (overlay) {
    overlay.classList.add("active");
    renderCart();
    document.body.style.overflow = "hidden";
  }
}

function closeCart() {
  const overlay = document.getElementById("cart-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function openOrderForm() {
  if (cart.length === 0) {
    showToast("❌ السلة فارغة! أضف أصناف أولاً");
    return;
  }
  const formOverlay = document.getElementById("order-form-overlay");
  if (formOverlay) {
    formOverlay.classList.add("active");
    closeCart();
  }
}

function closeOrderForm() {
  const formOverlay = document.getElementById("order-form-overlay");
  if (formOverlay) formOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

function toggleDeliveryFields() {
  const type = document.querySelector('input[name="order-type"]:checked')?.value;
  const deliveryFields = document.getElementById("delivery-fields");
  if (deliveryFields) {
    deliveryFields.style.display = type === "delivery" ? "block" : "none";
  }
}

async function submitOrder(e) {
  e.preventDefault();
  const btn = document.getElementById("submit-order-btn");
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const orderType = document.querySelector('input[name="order-type"]:checked')?.value;
  const address = orderType === "delivery" ? document.getElementById("customer-address").value.trim() : "تيك أواي من المحل";
  const notes = document.getElementById("order-notes")?.value.trim() || "";

  if (!name || !phone) { showToast("❌ من فضلك أدخل الاسم ورقم الهاتف"); return; }
  if (orderType === "delivery" && !address) { showToast("❌ من فضلك أدخل عنوان التوصيل"); return; }

  const itemsText = cart.map((i) => `${i.name} × ${i.qty} = ${i.price * i.qty} جنيه`).join(" | ");
  const total = getTotal();
  const orderId = "ORD-" + Date.now();
  const orderDate = new Date().toLocaleString("ar-EG");

  const orderData = {
    orderId, orderDate, name, phone,
    orderType: orderType === "delivery" ? "توصيل" : "تيك أواي",
    address, items: itemsText, total, notes,
  };

  btn.disabled = true;
  btn.textContent = "جاري إرسال الطلب...";

  try {
    await fetch(SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    cart = [];
    saveCart();
    closeOrderForm();
    showSuccessModal(orderId);
  } catch (err) {
    cart = [];
    saveCart();
    closeOrderForm();
    showSuccessModal(orderId);
  } finally {
    btn.disabled = false;
    btn.textContent = "✅ تأكيد الطلب";
  }
}

function showSuccessModal(orderId) {
  const modal = document.getElementById("success-modal");
  if (modal) {
    document.getElementById("success-order-id").textContent = orderId;
    modal.classList.add("active");
    launchConfetti();
  }
}

function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) modal.classList.remove("active");
}

function animateCartIcon() {
  const btn = document.getElementById("cart-btn");
  if (!btn) return;
  btn.classList.add("cart-bump");
  setTimeout(() => btn.classList.remove("cart-bump"), 400);
}

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    r: Math.random() * 8 + 4,
    color: ["#e63946", "#ffd700", "#2a9d8f", "#e9c46a", "#f4a261"][Math.floor(Math.random() * 5)],
    speed: Math.random() * 3 + 2,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 5,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y += p.speed;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
      ctx.restore();
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = "none"; }
  }
  draw();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();

  const cartBtn = document.getElementById("cart-btn");
  if (cartBtn) cartBtn.addEventListener("click", openCart);

  const closeCartBtn = document.getElementById("close-cart-btn");
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);

  const cartOverlay = document.getElementById("cart-overlay");
  if (cartOverlay) cartOverlay.addEventListener("click", (e) => {
    if (e.target === cartOverlay) closeCart();
  });

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", openOrderForm);

  const closeFormBtn = document.getElementById("close-form-btn");
  if (closeFormBtn) closeFormBtn.addEventListener("click", closeOrderForm);

  const orderForm = document.getElementById("order-form");
  if (orderForm) orderForm.addEventListener("submit", submitOrder);

  document.querySelectorAll('input[name="order-type"]').forEach((r) =>
    r.addEventListener("change", toggleDeliveryFields)
  );

  const closeSuccessBtn = document.getElementById("close-success-btn");
  if (closeSuccessBtn) closeSuccessBtn.addEventListener("click", closeSuccessModal);
});

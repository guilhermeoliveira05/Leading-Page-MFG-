// ═══ CARRINHO DE COMPRAS — MFG Arte e Fé ═══

const Cart = {
  items: JSON.parse(localStorage.getItem('mfg-cart')) || [],

  save() {
    localStorage.setItem('mfg-cart', JSON.stringify(this.items));
    this.updateBadge();
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.save();
    this.showToast(`${product.name} adicionado ao carrinho!`);
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  updateQty(id, qty) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      this.save();
    }
  },

  totalItems() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  totalPrice() {
    return this.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  },

  updateBadge() {
    const badge = document.querySelector('.cart-badge-count');
    if (badge) {
      const total = this.totalItems();
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }
  },

  showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  },

  sendToWhatsApp(phone) {
    if (this.items.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    let msg = '🛒 *Pedido — MFG Arte e Fé*\n\n';

    this.items.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}*\n`;
      msg += `   Qtd: ${item.qty} × R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
      msg += `   Subtotal: R$ ${(item.qty * item.price).toFixed(2).replace('.', ',')}\n\n`;
    });

    msg += `──────────────\n`;
    msg += `*Total: R$ ${this.totalPrice().toFixed(2).replace('.', ',')}*\n`;
    msg += `*Itens: ${this.totalItems()}*\n\n`;
    msg += `Olá! Gostaria de finalizar este pedido. 😊`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  },

  clear() {
    this.items = [];
    this.save();
  }
};

// ═══ FUNÇÕES GLOBAIS ═══

function addToCart(id, name, price) {
  Cart.add({ id, name, price });
  renderCart();
}

function renderCart() {
  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  if (!body || !footer) return;

  if (Cart.items.length === 0) {
    body.innerHTML = '<p class="cart-empty">Seu carrinho está vazio 🛒</p>';
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = Cart.items.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>R$ ${item.price.toFixed(2).replace('.', ',')} cada</span>
      </div>
      <div class="cart-item-controls">
        <button onclick="changeQty('${item.id}', -1)">−</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button onclick="changeQty('${item.id}', 1)">+</button>
        <button class="cart-item-remove" onclick="removeItem('${item.id}')">✕</button>
      </div>
    </div>
  `).join('');

  footer.innerHTML = `
    <div class="cart-total">
      <span>Total (${Cart.totalItems()} itens)</span>
      <strong>R$ ${Cart.totalPrice().toFixed(2).replace('.', ',')}</strong>
    </div>
    <button class="cart-btn-whatsapp" onclick="Cart.sendToWhatsApp('5511999999999')">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.856L0 24l6.335-1.51C8.05 23.455 9.983 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.518-5.17-1.418l-.37-.22-3.763.897.948-3.67-.242-.38A9.946 9.946 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      Enviar Pedido via WhatsApp
    </button>
    <button class="cart-btn-clear" onclick="Cart.clear(); renderCart();">
      Limpar carrinho
    </button>
  `;
}

function changeQty(id, delta) {
  const item = Cart.items.find(i => i.id === id);
  if (item) {
    Cart.updateQty(id, item.qty + delta);
    renderCart();
  }
}

function removeItem(id) {
  Cart.remove(id);
  renderCart();
}

function openCartModal() {
  renderCart();
  document.getElementById('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartModal() {
  document.getElementById('cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// Inicializa badge ao carregar
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());

// Seleciona todas as telas e cria função para alternar entre elas com animação suave.
const screens = document.querySelectorAll('[data-screen]');
const tabButtons = document.querySelectorAll('[data-tab]');
const toastElement = document.getElementById('toast');
const phoneFrame = document.querySelector('.phone-frame');
const startRoleButtons = document.querySelectorAll('[data-start-role]');

let toastTimer;

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastElement.classList.remove('show');
  }, 1500);
}

function resolveTabScreen(screenId) {
  if (screenId === 'cart-screen') return 'consumer-screen';
  return screenId;
}

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === screenId);
  });

  phoneFrame.classList.toggle('prestart', screenId === 'start-screen');

  const activeTabId = resolveTabScreen(screenId);
  tabButtons.forEach((tabButton) => {
    tabButton.classList.toggle('active', tabButton.dataset.tab === activeTabId);
  });
}

startRoleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedRole = button.dataset.startRole;

    if (selectedRole === 'producer') {
      showScreen('producer-screen');
      showToast('Perfil produtor selecionado');
      return;
    }

    showScreen('consumer-screen');
    showToast('Perfil consumidor selecionado');
  });
});

// Navegação entre telas por botões com atributo data-go.
document.querySelectorAll('[data-go]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.go;
    showScreen(target);
  });
});

// Carrinho simples do consumidor.
const cartCountElement = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');
const cartScreenCountElement = document.getElementById('cart-screen-count');
const cartScreenTotalElement = document.getElementById('cart-screen-total');
const cartItemsListElement = document.getElementById('cart-items-list');
const clearCartButton = document.getElementById('clear-cart-btn');
const checkoutButton = document.getElementById('checkout-btn');
const cartBadgeElement = document.getElementById('tab-cart-badge');

const homeSearchInput = document.getElementById('home-search');
const consumerSearchInput = document.getElementById('consumer-search');
const producerCards = Array.from(document.querySelectorAll('[data-producer]'));
const productCards = Array.from(document.querySelectorAll('[data-product]'));
const homeEmptyState = document.getElementById('home-empty');
const consumerEmptyState = document.getElementById('consumer-empty');

let cartCount = 0;
let cartTotal = 0;
let cartItems = [];

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function updateCartUI() {
  cartCountElement.textContent = String(cartCount);
  cartTotalElement.textContent = formatCurrency(cartTotal);
  cartScreenCountElement.textContent = String(cartCount);
  cartScreenTotalElement.textContent = formatCurrency(cartTotal);

  cartBadgeElement.textContent = String(cartCount);
  cartBadgeElement.classList.toggle('hidden', cartCount === 0);

  if (cartItems.length === 0) {
    cartItemsListElement.innerHTML = `
      <article class="card">
        <p class="muted">Seu carrinho está vazio. Adicione itens na tela de produtos.</p>
      </article>
    `;
    return;
  }

  cartItemsListElement.innerHTML = '';
  cartItems.forEach((item, index) => {
    const cartItemCard = document.createElement('article');
    cartItemCard.className = 'card cart-item';
    cartItemCard.innerHTML = `
      <div>
        <p class="cart-item-name">${item.name}</p>
        <small>Item ${index + 1}</small>
      </div>
      <div class="product-right">
        <strong>${formatCurrency(item.price)}</strong>
        <button class="btn mini" type="button" data-remove-index="${index}">Remover</button>
      </div>
    `;
    cartItemsListElement.append(cartItemCard);
  });
}

document.querySelectorAll('[data-add-cart]').forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    cartItems.push({ name, price });
    cartCount += 1;
    cartTotal += price;
    updateCartUI();
    showToast(`${name} adicionado ao carrinho`);

    // Feedback visual rápido ao adicionar item.
    button.textContent = 'Adicionado ✓';
    setTimeout(() => {
      button.textContent = 'Adicionar';
    }, 800);
  });
});

cartItemsListElement.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const index = target.dataset.removeIndex;
  if (index === undefined) return;

  const removeIndex = Number(index);
  const removedItem = cartItems[removeIndex];
  if (!removedItem) return;

  cartItems.splice(removeIndex, 1);
  cartCount -= 1;
  cartTotal -= removedItem.price;
  updateCartUI();
  showToast(`${removedItem.name} removido`);
});

clearCartButton.addEventListener('click', () => {
  if (cartItems.length === 0) {
    showToast('Carrinho já está vazio');
    return;
  }

  cartItems = [];
  cartCount = 0;
  cartTotal = 0;
  updateCartUI();
  showToast('Carrinho limpo com sucesso');
});

checkoutButton.addEventListener('click', () => {
  if (cartItems.length === 0) {
    showToast('Adicione itens antes de finalizar');
    return;
  }

  showToast('Pedido enviado ao produtor (simulação)');
});

function applyFilter(inputValue, listItems, sourceKey, emptyElement) {
  const term = inputValue.trim().toLowerCase();
  let visibleCount = 0;

  listItems.forEach((item) => {
    const sourceText = item.dataset[sourceKey] || '';
    const visible = sourceText.includes(term);
    item.classList.toggle('hidden', !visible);
    if (visible) visibleCount += 1;
  });

  emptyElement.classList.toggle('hidden', visibleCount > 0);
}

homeSearchInput.addEventListener('input', () => {
  applyFilter(homeSearchInput.value, producerCards, 'producer', homeEmptyState);
});

consumerSearchInput.addEventListener('input', () => {
  applyFilter(consumerSearchInput.value, productCards, 'product', consumerEmptyState);
});

updateCartUI();

// Cadastro dinâmico de produtos no painel do produtor.
const producerForm = document.getElementById('producer-form');
const producerList = document.getElementById('producer-list');

producerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const productName = document.getElementById('prod-name').value.trim();
  const productPrice = Number(document.getElementById('prod-price').value);
  const productQty = Number(document.getElementById('prod-qty').value);

  if (!productName || productPrice <= 0 || productQty <= 0) return;

  const item = document.createElement('article');
  item.className = 'card product-card';
  item.innerHTML = `
    <div>
      <h3>${productName}</h3>
      <p>Quantidade: ${productQty}</p>
    </div>
    <div class="product-right">
      <strong>${formatCurrency(productPrice)}</strong>
      <span class="muted">Produto cadastrado</span>
    </div>
  `;

  // Remove o card inicial de instrução quando o primeiro produto for cadastrado.
  const introCard = producerList.querySelector('.muted')?.closest('.card');
  if (introCard) introCard.remove();

  producerList.prepend(item);
  producerForm.reset();
});

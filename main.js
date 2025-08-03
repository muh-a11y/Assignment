const dessertGrid = document.getElementById('dessertGrid'); 
const cartBox = document.getElementById('order');

let cart = [];
let allDesserts = [];

fetch('dessert.json')
  .then(response => response.json())
  .then(data => {
    allDesserts = data;
    renderDesserts(data);
  })
  .catch(err => {
    dessertGrid.innerHTML = '<p>Failed to load desserts.</p>';
    console.error(err);
  });

function renderDesserts(desserts) {
  dessertGrid.innerHTML = '';

  desserts.forEach(dessert => {
    const card = document.createElement('div');
    card.className = 'dessert-card';

    card.innerHTML = `
      <img class="dessert-img" src="${dessert.image.desktop}" alt="${dessert.name}" />
      <div class="dessert-info">
        <p>${dessert.category}</p>
        <h4 class="dessert-name">${dessert.name}</h4>
        <p class="price">$${dessert.price.toFixed(2)}</p>
      </div>
      <div class="btn-container">
        <button class="add-btn"><i class="fa-solid fa-cart-plus"></i>Add to Cart</button>
      </div>
    `;

    const btnContainer = card.querySelector('.btn-container');
    const addBtn = btnContainer.querySelector('.add-btn');

    addBtn.addEventListener('click', () => {
      addToCart(dessert);
      updateButtonUI(dessert.name, btnContainer);
      updateCartUI();
    });

    dessertGrid.appendChild(card);
  });
}

function updateButtonUI(itemName, container) {
  const cartItem = cart.find(i => i.name === itemName);
  if (!cartItem) {
    container.innerHTML = `<button class="add-btn"> 
     Add to Cart</button>`;
    container.querySelector('.add-btn').addEventListener('click', () => {
      const fullItem = allDesserts.find(i => i.name === itemName);
      if (fullItem) {
        addToCart(fullItem);
        updateButtonUI(itemName, container);
        updateCartUI();
      }
    });
  } else {
    container.innerHTML = `
      <button class="qty-btn minus">-</button>
      <span class="qty-number">${cartItem.qty}</span>
      <button class="qty-btn plus">+</button>
    `;

    container.querySelector('.minus').addEventListener('click', () => {
      decreaseQty(itemName);
      updateButtonUI(itemName, container);
      updateCartUI();
    });
    container.querySelector('.plus').addEventListener('click', () => {
      increaseQty(itemName);
      updateButtonUI(itemName, container);
      updateCartUI();
    });
  }
}

function addToCart(item) {
  const existing = cart.find(i => i.name === item.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
}

function increaseQty(itemName) {
  const item = cart.find(i => i.name === itemName);
  if (item) {
    item.qty += 1;
  }
}

function decreaseQty(itemName) {
  const item = cart.find(i => i.name === itemName);
  if (item) {
    item.qty -= 1;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.name !== itemName);
    }
  }
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  updateCartUI();
  resetButtonUI(name);
}

function resetButtonUI(itemName) {
  const cards = [...dessertGrid.children];
  for (const card of cards) {
    const dessertName = card.querySelector('.dessert-name').textContent;
    if (dessertName === itemName) {
      const container = card.querySelector('.btn-container');
      container.innerHTML = `<button class="add-btn">Add to Cart</button>`;
      container.querySelector('.add-btn').addEventListener('click', () => {
        const fullItem = allDesserts.find(i => i.name === itemName);
        if (fullItem) {
          addToCart(fullItem);
          updateButtonUI(itemName, container);
          updateCartUI();
        }
      });
      break;
    }
  }
}

function resetAllButtons() {
  const cards = [...dessertGrid.children];
  cards.forEach(card => {
    const name = card.querySelector('.dessert-name').textContent;
    const btnContainer = card.querySelector('.btn-container');
    btnContainer.innerHTML = `<button class="add-btn">Add to Cart</button>`;
    btnContainer.querySelector('.add-btn').addEventListener('click', () => {
      const fullItem = allDesserts.find(i => i.name === name);
      if (fullItem) {
        addToCart(fullItem);
        updateButtonUI(name, btnContainer);
        updateCartUI();
      }
    });
  });
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  cartBox.innerHTML = `<h4>Your Cart (${totalQty})</h4>`;

  if (cart.length === 0) {
    cartBox.innerHTML += '<p>No items added yet.</p>';
    return;
  }

  let totalPrice = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    totalPrice += itemTotal;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';

    cartItem.innerHTML = `
      <span>${item.name} x ${item.qty} = $${itemTotal.toFixed(2)}</span>
      <button class="delete-btn" title="Remove item"><i class="fa-solid fa-trash"></i></button>
    `;

    cartItem.querySelector('.delete-btn').addEventListener('click', () => {
      removeFromCart(item.name);
      updateCartUI();
    });

    cartBox.appendChild(cartItem);
  });

  const totalDiv = document.createElement('div');
  totalDiv.style.marginTop = '15px';
  totalDiv.style.fontWeight = 'bold';
  totalDiv.textContent = `Total: $${totalPrice.toFixed(2)}`;
  cartBox.appendChild(totalDiv);

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'confirm-btn';
  confirmBtn.textContent = 'Confirm Order';
  confirmBtn.addEventListener('click', () => {
    showConfirmationModal();
  });

  const resetBtn = document.createElement('button');
  resetBtn.className = 'reset-btn';
  resetBtn.textContent = 'Reset Cart';
  resetBtn.addEventListener('click', () => {
    if (confirm('Clear your cart?')) {
      cart = [];
      updateCartUI();
      resetAllButtons();
    }
  });

  cartBox.appendChild(confirmBtn);
  cartBox.appendChild(resetBtn);
}

function showConfirmationModal() {
  const modal = document.getElementById('orderModal');
  const summary = document.getElementById('orderSummary');

  let totalPrice = 0;
  summary.innerHTML = '';

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    totalPrice += itemTotal;

    summary.innerHTML += `
      <div class="item">
        <span>${item.name} <small>x${item.qty} @ $${item.price.toFixed(2)}</small></span>
        <span>$${itemTotal.toFixed(2)}</span>
      </div>
    `;
  });

  summary.innerHTML += `
    <div class="item" style="font-weight: bold; margin-top: 10px;">
      <span>Order Total</span>
      <span>$${totalPrice.toFixed(2)}</span>
    </div>
  `;

  modal.classList.remove('hidden');

  modal.querySelector('.start-new-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
    cart = [];
    updateCartUI();
    resetAllButtons();
  });
}

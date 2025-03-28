// 购物车数据
let cart = [];

// 更新购物车显示
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
    
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartItems && cartTotal) {
        // 更新购物车列表
        cartItems.innerHTML = cart.map(item => `
            <div class="flex items-center justify-between mb-4" id="cart-item-${item.id}">
                <div class="flex items-center">
                    <input type="checkbox" 
                           class="item-checkbox w-4 h-4 text-black border-gray-300 rounded focus:ring-black" 
                           data-id="${item.id}"
                           onchange="updateSelectAll()">
                    <img src="${item.image}" alt="${item.name[currentLang]}" class="w-16 h-16 object-cover rounded ml-2">
                    <div class="ml-4">
                        <h4 class="font-semibold">${item.name[currentLang]}</h4>
                        <p class="text-gray-600">¥${item.price.toLocaleString()}</p>
                        <div class="flex items-center mt-1">
                            <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="text-gray-500 hover:text-gray-700">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="text-gray-500 hover:text-gray-700">+</button>
                        </div>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // 初始化总价为0
        cartTotal.textContent = '¥0';
    }
}

// 更新选中商品的总价
function updateSelectedTotal() {
    const selectedItems = document.querySelectorAll('.item-checkbox:checked');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTotal = document.getElementById('cartTotal');
    
    if (selectedItems.length === 0) {
        cartTotal.textContent = '¥0';
        return;
    }
    
    const total = Array.from(selectedItems).reduce((sum, checkbox) => {
        const itemId = parseInt(checkbox.dataset.id);
        const item = cart.find(item => item.id === itemId);
        return sum + (item ? item.price * item.quantity : 0);
    }, 0);
    
    cartTotal.textContent = `¥${total.toLocaleString()}`;
}

// 全选/取消全选
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    updateSelectedTotal();
}

// 更新全选状态
function updateSelectAll() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const selectAll = document.getElementById('selectAll');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    selectAll.checked = allChecked;
    updateSelectedTotal();
}

// 删除选中的商品
function deleteSelected() {
    const selectedItems = document.querySelectorAll('.item-checkbox:checked');
    if (selectedItems.length === 0) {
        showNotification('请选择要删除的商品');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const selectedIds = Array.from(selectedItems).map(checkbox => parseInt(checkbox.dataset.id));
    cart = cart.filter(item => !selectedIds.includes(item.id));
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('已删除选中的商品');
}

// 添加商品到购物车
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // 更新购物车显示
    updateCartDisplay();
    
    // 显示通知
    showNotification('商品已添加到购物车');
}

// 更新商品数量
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
    } else {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            updateSelectedTotal();
        }
    }
}

// 从购物车中移除商品
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateSelectedTotal();
    showNotification('商品已从购物车移除');
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 页面加载时初始化购物车显示
document.addEventListener('DOMContentLoaded', () => {
    // 初始化购物车显示
    updateCartDisplay();
    
    // 初始化购物车弹出框事件
    const cartButton = document.getElementById('cartButton');
    const cartPopup = document.getElementById('cartPopup');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCart = document.getElementById('closeCart');
    
    if (cartButton && cartPopup && cartOverlay && closeCart) {
        // 打开购物车
        cartButton.addEventListener('click', () => {
            cartPopup.classList.remove('translate-x-full');
            cartOverlay.classList.remove('hidden');
            updateCartDisplay();
        });

        // 关闭购物车
        closeCart.addEventListener('click', () => {
            cartPopup.classList.add('translate-x-full');
            cartOverlay.classList.add('hidden');
        });

        cartOverlay.addEventListener('click', () => {
            cartPopup.classList.add('translate-x-full');
            cartOverlay.classList.add('hidden');
        });
    }
}); 
// VARIABLES
const productsContainer = document.querySelector('.products');
const productsDOM = document.querySelector('.products-center');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartItemsDisplay = document.querySelector('.items-in-cart');
const cartItems = document.querySelector('.cart-items');

const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const cartCheckout = document.querySelector('.cart-checkout');
const menu = document.querySelector('.nav-container');
const hamburger = document.querySelector('.nav-icon');

// CART
let productsArr = [];
let cart = [];
let itemsInCart = 0;

// GETTING THE PRODUCT
class Products {
	async getProducts() {
		try {
			const result = await fetch('products.json');
			const data = await result.json();
			let products = data.items;
			products = products.map(item => {
				const { title, price } = item.fields;
				const { id } = item.sys;
				const image = item.fields.image.fields.file.url;
				return { title, price, id, image };
			});
			return products;
		} catch(err) {
			console.log(`OOps! Something went wrong. ${err.message}`);
		}
		
	}
}

// DISPLAY PRODUCTS
class UI {
	handleCartClick(e) {
		const clicked = e.target;
		if (clicked.closest('span')?.classList.contains('close-cart')) {
			this.toggleCart();
		} else if (clicked.closest('button')?.classList.contains('clear-cart')) {
			this.clearCart();
		} else if (clicked.closest('span')?.classList.contains('remove-item')) {
			this._removeCartItem(clicked.closest('.cart-item').dataset.id);
		} else if (clicked.classList.contains('fa-chevron-up')) {
			this._updateCartQuantity(clicked, 'next');
		} else if (clicked.classList.contains('fa-chevron-down')) {
			this._updateCartQuantity(clicked, 'previous');
		} else if (clicked.closest('.cart-checkout')) {
			this._cartCheckout();
		}
		
	}
	
	displayProducts(products) {
		let result = '';
		products.forEach((product, i) => {
			const html = `
				<article class="products">
					<div class="img-container">
						<img src="${product.image}" alt="product image" class="product-img"/>
						<button class="bag-btn" data-id="${i + 1}">
							<i class="fas fa-shopping-cart"></i>
							add to bag
						</button>
					</div>
					<h3>${product.title}</h3>
					<h4>$${product.price}</h4>
				</article>
			`;
			productsArr.push(product);
			productsDOM.insertAdjacentHTML('beforeend', html);
		});
	}
	
	addToCart(e) {
		const product = e.target.closest('button');
		if (!product) return;
		const productElement = productsArr.find(prod => prod.id === product.dataset.id);
		cart.push(productElement);
		cart[cart.length - 1].quantity = 1;
		this.toggleCart();
		itemsInCart++;
		cartItemsDisplay.textContent = itemsInCart;
		this.updateCart();
		this._updateCartTotal();
	}
	
	updateCart() {
		cartItems.innerHTML = '';
		let cartId = 0;
		cart.forEach( product => {
			const html = `
				<div class="cart-item" data-id="${cartId}">
					<img src="${product.image}" alt="">
					<div>
						<h4>${product.title}</h4>
						<h5>$${product.price}</h5>
						<span class="remove-item">remove</span>
					</div>
					<div>
						<i class="fas fa-chevron-up"></i>
						<p class="item-amount" data-quantity="${product.quantity}">${product.quantity}</p>
						<i class="fas fa-chevron-down"></i>
					</div>
				</div>
			`;
			cartId++;
			cartItems.insertAdjacentHTML('afterbegin', html);
		});
	}
	
	toggleCart() {
		cartDOM.classList.toggle('showCart');
		cartOverlay.classList.toggle('transparentBcg');
	}
	
	clearCart() {
		itemsInCart = 0;
		cartItemsDisplay.textContent = itemsInCart;
		cart = [];
		this.updateCart();
		this._updateCartTotal();
	}
	
	_updateCartTotal() {
		let total = 0;
		cart.forEach(prod => total += prod.price * prod.quantity);
		cartTotal.textContent = total.toFixed(2);
	}
	
	_removeCartItem(id) {
		cart.splice(id, 1);
		this.updateCart();
		this._updateCartTotal();
	}
	
	_updateCartQuantity(target, dir) {
		if (!target) return;
		if (dir === 'next') {
			target.nextElementSibling.textContent = +target.nextElementSibling.textContent + 1;
			const prodIndex = cart.indexOf(cart.find((item, i) =>  i === +target.closest('.cart-item').dataset.id));
			cart[prodIndex].quantity += 1;
		} else {
			if (+target.previousElementSibling.textContent > 1) {
				target.previousElementSibling.textContent = +target.previousElementSibling.textContent - 1;
				const prodIndex = cart.indexOf(cart.find((item, i) =>  i === +target.closest('.cart-item').dataset.id));
				cart[prodIndex].quantity -= 1;
			} else console.log('uh oh');
		}
		this._updateCartTotal();
	}
	
	_cartCheckout() {
		alert('thank you for your purchase!');
		cart = [];
		this.updateCart();
		itemsInCart = 0;
		cartItemsDisplay.textContent = itemsInCart;
		this._updateCartTotal();
		this._updateCartQuantity();
		this.toggleCart();
	}
	
}
// CONTROLLER
document.addEventListener('DOMContentLoaded', () => {
	const ui = new UI();
	const products = new Products();
	
	// GET PRODUCTS
	products.getProducts().then(products => {
		ui.displayProducts(products);
	});
	
	// EVENT LISTENERS
	productsContainer.addEventListener('click', ui.addToCart.bind(ui));
	cartDOM.addEventListener('click', ui.handleCartClick.bind(ui));
	cartBtn.addEventListener('click', ui.toggleCart);
	hamburger.addEventListener('click', () => menu.classList.toggle('hidden'));
});
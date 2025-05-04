const ip = "localhost";

// ---------------------
//     CART
// ---------------------

const getCartInputValues = () => ({
    user_id: document.getElementById("cart-client-id").value,
    product_name: document.getElementById("cart-name").value,
    quantity: parseInt(document.getElementById("cart-quantidade").value)
});

const updateCart = (json) => {
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = '';
    if (!Array.isArray(json) || json.length === 0) {
    const li = document.createElement('li');
    li.className = 'registered-item';
    li.innerHTML = `
        <div class="registered-info">
        <center><div class="registered-name">Nenhum produto no carrinho.</div></center>
        </div>
    `;
    cartList.appendChild(li);
    return;
    }
    json.forEach(product => {
        const { product_name, price, quantity } = product;
        if (product_name && price && quantity) {
            const li = document.createElement('li');
            li.className = 'registered-item';
            li.innerHTML = `
                <div class="registered-info">
                    <center>
                        <div class="registered-name">${product_name}</div>
                    </center>
                    <div class="registered-quantidade">Quantidade: ${quantity}</div>
                    <div class="registered-price">Preço: R$ ${parseFloat(price).toFixed(2)}</div>
                </div>
            `;
            cartList.appendChild(li);
        }
    });
};
updateCart({});

document.getElementById("cart-viewBtn").addEventListener("click", async () => {
    const { user_id } = getCartInputValues();
    const response = await fetch(`http://${ip}:3000/cart/${user_id}`);
    const data = await response.json();
    console.log(`Visualizando carrinho do cliente: ${user_id}\n resultado: `, data);
    updateCart(data.items)
});

document.getElementById("cart-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = getCartInputValues();
    await fetch(`http://${ip}:3000/cart_add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    console.log(`Adicionando ${data.product_name} ao carrinho do cliente ${data.user_id} com quantidade ${data.quantity}`);
});

document.getElementById("clear-cart-btn").addEventListener("click", async () => {
    const { user_id } = getCartInputValues();
    await fetch(`http://${ip}:3000/cart_clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id })
    });
    console.log(`Limpando carrinho do cliente ${user_id}`);
});

document.getElementById("cart-remove-product").addEventListener("click", async () => {
    const { user_id, product_name } = getCartInputValues();
    await fetch(`http://${ip}:3000/cart_remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, product_name })
    });
    console.log(`Removendo produto ${product_name} do carrinho do cliente ${user_id}`);
});

// ---------------------
//     PRODUCT
// ---------------------

const getProductInputValues = () => ({
    name: document.getElementById("name").value,
    price: parseFloat(document.getElementById("price").value),
    amount: parseInt(document.getElementById("quantidade").value)
});

const updateProductList = (json) => {
    const list = document.getElementById('product-list');
    list.innerHTML = '';
    if (!Array.isArray(json) || json.length === 0) {
        const li = document.createElement('li');
        li.className = 'registered-item';
        li.innerHTML = `
            <div class="registered-info">
                <center><div class="registered-name">Nenhum produto cadastrado.</div></center>
            </div>
        `;
        list.appendChild(li);
        return;
    }
    json.forEach(product => {
        const { name, price, amount } = product;
        if (name && price && amount !== undefined) {
            const li = document.createElement('li');
            li.className = 'registered-item';
            li.innerHTML = `
                <div class="registered-info">
                    <center>
                        <div class="registered-name">${name}</div>
                    </center>
                    <div class="registered-quantidade">Quantidade: ${amount}</div>
                    <div class="registered-price">Preço: R$ ${parseFloat(price).toFixed(2)}</div>
                </div>
            `;
            list.appendChild(li);
        }
    });
};
updateProductList({});

document.getElementById("find-product").addEventListener("click", async () => {
    const {name} = getProductInputValues();
    const response = await fetch(`http://${ip}:3000/products/${name}`);
    const data = await response.json();
    console.log(`Visualizando todos os produtos: ${name}, resultado:`, data);
    updateProductList(data)
});

document.getElementById("product-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = getProductInputValues();
    await fetch(`http://${ip}:3000/product_add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    console.log(`Adicionando ${data.name} com \$${data.price} e quantidade ${data.amount} a lista de produtos.`);
});

document.getElementById("edit-product").addEventListener("click", async () => {
    const data = getProductInputValues();
    await fetch(`http://${ip}:3000/product_update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    console.log(`Editando ${data.name} - Novos dados: \$${data.price} e quantidade ${data.amount} a lista de produtos.`);
});

document.getElementById("remove-product").addEventListener("click", async () => {
    const { name } = getProductInputValues();
    await fetch(`http://${ip}:3000/product_remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    console.log(`Removendo produto ${name} da lista de produtos.`);
});

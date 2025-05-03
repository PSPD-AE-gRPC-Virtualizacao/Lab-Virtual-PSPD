const getInputValues = () => ({
    user_id: document.getElementById("userId").value,
    product_name: document.getElementById("productName").value,
    quantity: parseInt(document.getElementById("quantity").value)
});

const output = document.getElementById("cartOutput");

document.getElementById("addBtn").addEventListener("click", async () => {
    const data = getInputValues();
    await fetch("http://localhost:3000/cart_add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
});

document.getElementById("removeBtn").addEventListener("click", async () => {
    const { user_id, product_name } = getInputValues();
    await fetch("http://localhost:3000/cart_remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, product_name })
    });
});

document.getElementById("viewBtn").addEventListener("click", async () => {
    const { user_id } = getInputValues();
    const response = await fetch(`http://localhost:3000/cart/${user_id}`);
    const data = await response.json();
    output.textContent = JSON.stringify(data.items, null, 2);
});

document.getElementById("clearBtn").addEventListener("click", async () => {
    const { user_id } = getInputValues();
    await fetch("http://localhost:3000/cart_clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id })
    });
    output.textContent = "Carrinho limpo.";
});

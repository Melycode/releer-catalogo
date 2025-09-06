// Carrito
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// Renderizado de libros en index
function renderBooks() {
  const list = document.getElementById("book-list");
  if (!list) return;

  const search = document.getElementById("searchTitle").value.toLowerCase();
  const cat = document.getElementById("filterCategory").value;
  const auth = document.getElementById("filterAuthor").value;

  const filtered = books.filter(b => 
    (!search || b.title.toLowerCase().includes(search)) &&
    (!cat || b.category === cat) &&
    (!auth || b.author === auth)
  );

  list.innerHTML = filtered.map(b => {
    // Verificar si el libro ya está en el carrito
    const inCart = cart.some(c => c.id === b.id);
    return `
      <div class="col-md-3 mb-3">
        <div class="card h-100 shadow-sm d-flex flex-column">
          <img src="${b.image}" 
               class="card-img-top" 
               alt="${b.title}" 
               style="height: 250px; object-fit: contain;">
          <div class="card-body d-flex flex-column p-2">
            <h6 class="card-title mb-1">${b.title}</h6>
            <p class="card-text text-muted small mb-1">${b.author}</p>
            <p class="fw-bold text-success mb-2">S/ ${b.price.toFixed(2)}</p>
            <button class="btn ${inCart ? "btn-agregado" : "btn-success"} btn-sm mt-auto" 
                    onclick="addToCart(${b.id}, this)">
              ${inCart ? "✅ Agregado" : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}


// Rellenar select de autores
function populateAuthors() {
  const sel = document.getElementById("filterAuthor");
  if (!sel) return;

  const authors = [...new Set(books.map(b => b.author))].sort((a, b) => 
      a.localeCompare(b)
    );


  authors.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a; 
    opt.textContent = a;
    sel.appendChild(opt);
  });
}

 const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");
  const catParam = urlParams.get("cat");
  const authParam = urlParams.get("auth");

  if (searchParam) document.getElementById("searchTitle").value = searchParam;
  if (catParam) document.getElementById("filterCategory").value = catParam;
  if (authParam) document.getElementById("filterAuthor").value = authParam;

  renderBooks();



// --- Carrito ---
function addToCart(id, btn) {
  const book = books.find(b => b.id === id);
  const item = cart.find(c => c.id === id);
  if (item) { 
    item.qty++; 
  } else { 
    cart.push({...book, qty: 1}); 
  }
  saveCart();

  // Cambiar texto y color del botón actual
  if (btn) {
    btn.innerHTML = "✅ Agregado";
    btn.classList.remove("btn-success");
    btn.classList.add("btn-agregado");
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  const counter = document.getElementById("cart-count");
  if (counter) counter.innerText = cart.reduce((s,i)=>s+i.qty,0);
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  if (cart.length === 0) { 
    container.innerHTML = "<p class='text-muted'>Carrito vacío.</p>"; 
    document.getElementById("cart-total").innerText = "0.00";
    return; 
  }

  container.innerHTML = cart.map(i => `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div>
        <span>${i.title} x${i.qty}</span>
        <span class="text-success">S/ ${(i.price * i.qty).toFixed(2)}</span>
      </div>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${i.id})">
        ❌
      </button>
    </div>
  `).join("");

  document.getElementById("cart-total").innerText = cart
    .reduce((s,i)=>s+i.price*i.qty,0)
    .toFixed(2);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}


function openCart() {
  new bootstrap.Modal(document.getElementById('cartModal')).show();
}

function clearCart() {
  cart = [];
  saveCart();
}

function sendOrderWhatsApp() {
  if (cart.length === 0) { alert("Tu carrito está vacío."); return; }
  let mensaje = "📚 *Pedido Releer*%0A%0A";
  cart.forEach(i => {
    mensaje += `- ${i.title} x${i.qty} = S/ ${(i.price*i.qty).toFixed(2)}%0A`;
  });
  mensaje += `%0ATotal: *S/ ${cart.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2)}*%0A%0A`;
  mensaje += "👤 Nombre:%0A📍 Dirección:%0A📞 Teléfono:";

  const telefono = "51947857756"; 
  const url = `https://wa.me/${telefono}?text=${mensaje}`;
  window.open(url, "_blank");
}



// Pedir libro individual por WhatsApp (desde book.html)
function pedirWhatsApp(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  const telefono = "51947857756"; // Tu número en formato internacional
  const mensaje = `📚 *Pedido Releer*%0A
*Libro:* ${book.title}%0A
*Autor:* ${book.author}%0A
*Precio:* S/ ${book.price.toFixed(2)}%0A
-------------------%0A
👤 Nombre:%0A📍 Dirección:%0A📞 Teléfono:`;

  const url = `https://wa.me/${telefono}?text=${mensaje}`;
  window.open(url, "_blank");
}



// Inicializar en index
if (document.getElementById("book-list")) {
  document.getElementById("searchTitle").addEventListener("input", renderBooks);
  document.getElementById("filterCategory").addEventListener("change", renderBooks);
  document.getElementById("filterAuthor").addEventListener("change", renderBooks);

  populateAuthors();
  renderBooks();
}
saveCart();
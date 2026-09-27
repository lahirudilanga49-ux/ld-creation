const defaultProducts=[
{id:1,name:"Monochrome Geometry",category:"Abstract",price:6490,description:"A bold geometric statement for modern interiors.",image:""},
{id:2,name:"Quiet Mountains",category:"Nature",price:7290,description:"A calm mountain composition with a premium gallery feel.",image:""},
{id:3,name:"Golden Balance",category:"Minimal",price:5990,description:"Minimal lines and warm tones for elegant spaces.",image:""},
{id:4,name:"Organic Forms",category:"Abstract",price:6790,description:"Soft organic shapes designed for contemporary rooms.",image:""}
];
if(!localStorage.getItem("ld_products"))localStorage.setItem("ld_products",JSON.stringify(defaultProducts));
if(!localStorage.getItem("ld_users"))localStorage.setItem("ld_users",JSON.stringify([]));
if(!localStorage.getItem("ld_orders"))localStorage.setItem("ld_orders",JSON.stringify([]));
let products=JSON.parse(localStorage.getItem("ld_products"));let cart=JSON.parse(localStorage.getItem("ld_cart")||"[]");let activeCat="All";

function money(n){return "LKR "+Number(n).toLocaleString()}
function saveCart(){localStorage.setItem("ld_cart",JSON.stringify(cart));document.getElementById("cartCount").textContent=cart.reduce((a,b)=>a+b.qty,0)}
function renderProducts(){
 const el=document.getElementById("products");const list=activeCat==="All"?products:products.filter(p=>p.category===activeCat);
 el.innerHTML=list.map(p=>`<article class="product"><div class="product-img">${p.image?`<img src="${p.image}" alt="${p.name}">`:`<div class="placeholder-art">LD</div>`}</div><div class="product-body"><div class="product-cat">${p.category}</div><h3>${p.name}</h3><div class="price">${money(p.price)}</div><button class="add" onclick="addToCart(${p.id})">Add to Cart</button></div></article>`).join("");
}
function addToCart(id){let x=cart.find(i=>i.id===id);x?x.qty++:cart.push({id,qty:1});saveCart();openCart()}
function openCart(){document.getElementById("modal").classList.remove("hidden");const el=document.getElementById("modalContent");if(!cart.length){el.innerHTML=`<button class="close" onclick="closeModal()">×</button><h2>Your Cart</h2><div class="empty">Your cart is empty.</div>`;return}
let rows=cart.map(i=>{let p=products.find(x=>x.id===i.id);return `<div class="cart-row"><div class="mini-img">${p.image?`<img class="mini-img" src="${p.image}">`:`<div class="placeholder-art" style="width:70px;height:70px;font-size:24px">LD</div>`}</div><div><strong>${p.name}</strong><div>${money(p.price)}</div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button>${i.qty}<button onclick="changeQty(${p.id},1)">+</button></div></div><button class="small-btn danger" onclick="removeCart(${p.id})">Remove</button></div>`}).join("");
let total=cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0);
el.innerHTML=`<button class="close" onclick="closeModal()">×</button><h2>Your Cart</h2>${rows}<div class="total"><span>Total</span><span>${money(total)}</span></div><button class="form button" style="width:100%;background:#111;color:#fff;border:0;padding:13px;cursor:pointer" onclick="checkout()">Proceed to Checkout</button>`;
}
function changeQty(id,n){let x=cart.find(i=>i.id===id);x.qty+=n;if(x.qty<1)cart=cart.filter(i=>i.id!==id);saveCart();openCart()}
function removeCart(id){cart=cart.filter(i=>i.id!==id);saveCart();openCart()}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function login(){
 document.getElementById("modal").classList.remove("hidden");document.getElementById("modalContent").innerHTML=`<button class="close" onclick="closeModal()">×</button><h2>Customer Login</h2><form class="form" onsubmit="event.preventDefault();doLogin()"><label>Email</label><input id="email" type="email" required><label>Password</label><input id="password" type="password" required><button>Login</button></form><p style="font-size:13px;color:#777">New customer? <a href="#" onclick="register();return false">Create an account</a></p>`;
}
function register(){
 document.getElementById("modalContent").innerHTML=`<button class="close" onclick="closeModal()">×</button><h2>Create Account</h2><form class="form" onsubmit="event.preventDefault();doRegister()"><label>Full name</label><input id="rname" required><label>Email</label><input id="remail" type="email" required><label>Mobile</label><input id="rmobile" required><label>Password</label><input id="rpass" type="password" required><button>Create Account</button></form>`;
}
function doRegister(){let u={id:Date.now(),name:rname.value,email:remail.value,mobile:rmobile.value,password:rpass.value};let us=JSON.parse(localStorage.getItem("ld_users"));if(us.some(x=>x.email===u.email))return alert("Email already registered.");us.push(u);localStorage.setItem("ld_users",JSON.stringify(us));localStorage.setItem("ld_current_user",JSON.stringify(u));closeModal();alert("Account created successfully.");}
function doLogin(){let us=JSON.parse(localStorage.getItem("ld_users"));let u=us.find(x=>x.email===email.value&&x.password===password.value);if(!u)return alert("Invalid email or password.");localStorage.setItem("ld_current_user",JSON.stringify(u));closeModal();alert("Welcome back, "+u.name+"!")}
function checkout(){
 const u=JSON.parse(localStorage.getItem("ld_current_user")||"null");
 if(!u){login();return}
 document.getElementById("modalContent").innerHTML=`<button class="close" onclick="closeModal()">×</button><h2>Checkout</h2><form class="form" onsubmit="event.preventDefault();placeOrder()"><label>Full name</label><input id="cname" value="${u.name}" required><label>Mobile number</label><input id="cmobile" value="${u.mobile||""}" required><label>Delivery address</label><textarea id="caddress" rows="4" required></textarea><label>Payment method</label><select id="cpayment"><option>Cash on Delivery</option><option>Bank Transfer</option></select><button>Place Order</button></form>`;
}
function placeOrder(){
 let total=cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0);
 let items=cart.map(i=>{let p=products.find(p=>p.id===i.id);return {productId:p.id,name:p.name,price:p.price,qty:i.qty}});
 let u=JSON.parse(localStorage.getItem("ld_current_user"));let orders=JSON.parse(localStorage.getItem("ld_orders"));
 orders.push({id:"LD-"+Date.now().toString().slice(-7),userId:u.id,customer:cname.value,mobile:cmobile.value,address:caddress.value,payment:cpayment.value,items,total,status:"Pending",createdAt:new Date().toLocaleString()});
 localStorage.setItem("ld_orders",JSON.stringify(orders));cart=[];saveCart();closeModal();alert("Order placed successfully. Order details are available in the LD Creation admin dashboard.");
}
document.getElementById("cartBtn").onclick=openCart;document.getElementById("loginBtn").onclick=login;
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");activeCat=b.dataset.cat;renderProducts()});
document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
renderProducts();saveCart();

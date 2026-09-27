const ADMIN_USER="admin";const ADMIN_PASS="LDcreation@2026";
let products=JSON.parse(localStorage.getItem("ld_products")||"[]");
function app(){document.getElementById("adminApp").innerHTML=`<div class="login-box"><img src="assets/logo.jpg" style="width:100px;background:#000"><h1>Admin Login</h1><form class="form" onsubmit="event.preventDefault();loginAdmin()"><label>Username</label><input id="au" value="admin" required><label>Password</label><input id="ap" type="password" required><button>Sign In</button></form><p style="font-size:12px;color:#888">Demo admin: admin / LDcreation@2026</p></div>`}
function loginAdmin(){if(au.value!==ADMIN_USER||ap.value!==ADMIN_PASS)return alert("Invalid admin login.");sessionStorage.setItem("ld_admin","1");dashboard()}
function dashboard(){
 document.getElementById("adminApp").innerHTML=`<div class="admin-wrap"><aside class="sidebar"><h2>LD Creation</h2><button class="side-btn active" onclick="show('dashboard',this)">Dashboard</button><button class="side-btn" onclick="show('products',this)">Products</button><button class="side-btn" onclick="show('orders',this)">Orders</button><button class="side-btn" onclick="show('customers',this)">Customers</button><button class="side-btn" onclick="logout()">Logout</button></aside><main class="admin-main" id="adminMain"></main></div>`;show("dashboard")
}
function show(type,btn){
 if(btn){document.querySelectorAll(".side-btn").forEach(x=>x.classList.remove("active"));btn.classList.add("active")}
 let main=document.getElementById("adminMain");let orders=JSON.parse(localStorage.getItem("ld_orders")||"[]"),users=JSON.parse(localStorage.getItem("ld_users")||"[]");
 if(type==="dashboard"){main.innerHTML=`<div class="admin-title"><h1>Dashboard</h1></div><div class="stats"><div class="stat"><small>Products</small><strong>${products.length}</strong></div><div class="stat"><small>Orders</small><strong>${orders.length}</strong></div><div class="stat"><small>Customers</small><strong>${users.length}</strong></div><div class="stat"><small>Revenue</small><strong>${money(orders.reduce((a,o)=>a+o.total,0))}</strong></div></div><div class="panel"><h3>Recent Orders</h3>${orderTable(orders.slice().reverse().slice(0,8))}</div>`}
 if(type==="products"){main.innerHTML=`<div class="admin-title"><h1>Products</h1><button class="primary-btn" onclick="addProduct()">+ Add Product</button></div><div class="product-admin">${products.map(p=>`<div class="panel"><div class="product-img">${p.image?`<img class="thumb" src="${p.image}">`:`<div class="placeholder-art">LD</div>`}</div><h3>${p.name}</h3><small>${p.category} • ${money(p.price)}</small><div class="admin-actions" style="margin-top:12px"><button class="small-btn" onclick="editProduct(${p.id})">Edit</button><button class="small-btn danger" onclick="deleteProduct(${p.id})">Delete</button></div></div>`).join("")}</div>`}
 if(type==="orders"){main.innerHTML=`<div class="admin-title"><h1>Orders</h1></div><div class="panel">${orderTable(orders.slice().reverse(),true)}</div>`}
 if(type==="customers"){main.innerHTML=`<div class="admin-title"><h1>Customers</h1></div><div class="panel"><div class="table-wrap"><table class="data-table"><tr><th>Name</th><th>Email</th><th>Mobile</th></tr>${users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.mobile||"-"}</td></tr>`).join("")}</table></div></div>`}
}
function money(n){return "LKR "+Number(n).toLocaleString()}
function orderTable(os,full=false){if(!os.length)return `<p style="color:#888">No orders yet.</p>`;return `<div class="table-wrap"><table class="data-table"><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th>${full?"<th>Details</th>":""}</tr>${os.map(o=>`<tr><td>${o.id}<br><small>${o.createdAt}</small></td><td>${o.customer}<br>${o.mobile}</td><td>${o.items.map(i=>i.name+" × "+i.qty).join(", ")}</td><td>${money(o.total)}</td><td><select onchange="updateStatus('${o.id}',this.value)"><option ${o.status==="Pending"?"selected":""}>Pending</option><option ${o.status==="Confirmed"?"selected":""}>Confirmed</option><option ${o.status==="Processing"?"selected":""}>Processing</option><option ${o.status==="Delivered"?"selected":""}>Delivered</option><option ${o.status==="Cancelled"?"selected":""}>Cancelled</option></select></td>${full?`<td><button class="small-btn" onclick="viewOrder('${o.id}')">View</button></td>`:""}</tr>`).join("")}</table></div>`}
function updateStatus(id,status){let os=JSON.parse(localStorage.getItem("ld_orders"));let o=os.find(x=>x.id===id);if(o)o.status=status;localStorage.setItem("ld_orders",JSON.stringify(os))}
function viewOrder(id){let o=JSON.parse(localStorage.getItem("ld_orders")).find(x=>x.id===id);alert(`Order: ${o.id}\nCustomer: ${o.customer}\nMobile: ${o.mobile}\nAddress: ${o.address}\nPayment: ${o.payment}\n\nProducts:\n${o.items.map(i=>i.name+" x "+i.qty+" = "+money(i.price*i.qty)).join("\n")}\n\nTotal: ${money(o.total)}`)}
function addProduct(){editProduct(null)}
let pendingImageData = null;

function editProduct(id){
 let p=id?products.find(x=>x.id===id):{id:Date.now(),name:"",category:"Abstract",price:0,description:"",image:""};
 pendingImageData = p.image || null;
 document.getElementById("adminMain").innerHTML=`
 <div class="admin-title"><h1>${id?"Edit":"Add"} Product</h1></div>
 <div class="panel">
   <form class="form" onsubmit="event.preventDefault();saveProduct(${id||0})">
     <label>Product name</label>
     <input id="pn" value="${escapeHtml(p.name)}" required>
     <label>Category</label>
     <select id="pc"><option ${p.category==="Abstract"?"selected":""}>Abstract</option><option ${p.category==="Nature"?"selected":""}>Nature</option><option ${p.category==="Minimal"?"selected":""}>Minimal</option></select>
     <label>Price (LKR)</label>
     <input id="pp" type="number" min="0" value="${p.price}" required>
     <label>Description</label>
     <textarea id="pd" rows="4">${escapeHtml(p.description)}</textarea>
     <label>Product image</label>
     <input id="pifile" type="file" accept="image/png,image/jpeg,image/webp" onchange="handleProductImage(this)">
     <small>Choose an image directly from your computer. JPG, PNG or WebP.</small>
     <div id="imagePreview" class="upload-preview">${p.image?`<img src="${p.image}" alt="Current product image">`:`<div class="upload-placeholder">No image selected</div>`}</div>
     <button>Save Product</button>
   </form>
 </div>`;
}
function escapeHtml(value){return String(value||"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function handleProductImage(input){
 const file=input.files && input.files[0]; if(!file) return;
 if(!file.type.startsWith("image/")) return alert("Please select an image file.");
 if(file.size>8*1024*1024) return alert("Please choose an image smaller than 8MB.");
 const reader=new FileReader();
 reader.onload=()=>{const img=new Image(); img.onload=()=>{
   const max=1400, scale=Math.min(1,max/Math.max(img.width,img.height));
   const canvas=document.createElement("canvas"); canvas.width=Math.max(1,Math.round(img.width*scale)); canvas.height=Math.max(1,Math.round(img.height*scale));
   canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
   pendingImageData=canvas.toDataURL("image/jpeg",0.82);
   document.getElementById("imagePreview").innerHTML=`<img src="${pendingImageData}" alt="Selected product image">`;
 }; img.src=reader.result;}; reader.readAsDataURL(file);
}
function saveProduct(id){
 let p={id:id||Date.now(),name:pn.value.trim(),category:pc.value,price:Number(pp.value),description:pd.value.trim(),image:pendingImageData||""};
 if(!p.name) return alert("Please enter a product name."); if(!p.price) return alert("Please enter a product price.");
 if(id) products=products.map(x=>x.id===id?p:x); else products.push(p);
 localStorage.setItem("ld_products",JSON.stringify(products)); pendingImageData=null; show("products");
}
function deleteProduct(id){if(!confirm("Delete this product?"))return;products=products.filter(x=>x.id!==id);localStorage.setItem("ld_products",JSON.stringify(products));show("products")}
function logout(){sessionStorage.removeItem("ld_admin");app()}
if(sessionStorage.getItem("ld_admin")==="1")dashboard();else app();

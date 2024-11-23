let currentPage = 1;
let itemsPerPage = 1000;
let products = [];
let sortAscending = true;

window.onload = loadData;

document.getElementById("applyFilters").addEventListener("click", applyFilters);
document.getElementById("sortDays").addEventListener("click", toggleSort);
document.getElementById("nextPage").addEventListener("click", () => changePage(1));
document.getElementById("prevPage").addEventListener("click", () => changePage(-1));

async function loadData() {
    try {
        const response = await fetch('https://apiclubstreaming.onrender.com/api/v1/product');
        const data = await response.json();
        products = data.products.flatMap(product => product.ItemProducts.map(item => ({
            ...item,
            productName: product.name,
            conditionOfUse: product.conditionOfUse,
            startDate: product.createdAt,
            endDate: product.updatedAt
        })));
        mostrarDatosEnTabla(products);
    } catch (error) {
        console.error('Error:', error);
    }
}

function toggleSort() {
    sortAscending = !sortAscending;
    mostrarDatosEnTabla(products);
}

function mostrarDatosEnTabla(itemsFiltered) {
    const apiTableBody = document.getElementById("apiTableBody");
    apiTableBody.innerHTML = "";

    itemsFiltered.sort((a, b) => sortAscending ? getDaysRemaining(a.endDate) - getDaysRemaining(b.endDate) : getDaysRemaining(b.endDate) - getDaysRemaining(a.endDate));

    const paginatedItems = paginateItems(itemsFiltered);

    paginatedItems.forEach(item => {
        apiTableBody.appendChild(createTableRow(item));
    });
}

function paginateItems(items) {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
}

function createTableRow(item) {
    const row = document.createElement('tr');
    const daysRemaining = getDaysRemaining(item.endDate);

    row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.username}</td>
        <td>${item.password}</td>
        <td>${item.numberProfile}</td>
        <td>${item.pin}</td>
        <td>${item.startDate}</td>
        <td>${item.endDate}</td>
        <td>${daysRemaining}</td>
        <td><button class="btn btn-success btn-sm" onclick="openWhatsAppModal(${item.id})">Compartir</button></td>
    `;
    return row;
}

function getDaysRemaining(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
}

function changePage(direction) {
    if ((direction === -1 && currentPage > 1) || (direction === 1 && currentPage * itemsPerPage < products.length)) {
        currentPage += direction;
        mostrarDatosEnTabla(products);
    }
}

function applyFilters() {
    const productName = document.getElementById("filterProduct").value.toLowerCase();
    const email = document.getElementById("filterEmail").value.toLowerCase();
    const startDate = document.getElementById("filterStartDate").value;

    const filtered = products.filter(item => {
        return item.productName.toLowerCase().includes(productName) &&
               item.username.toLowerCase().includes(email) &&
               (!startDate || item.startDate === startDate);
    });

    currentPage = 1;
    mostrarDatosEnTabla(filtered);
}

function openWhatsAppModal(itemId) {
    const modal = new bootstrap.Modal(document.getElementById('whatsappModal'));
    const item = products.find(p => p.id === itemId);
    if (!item) {
        alert('Item no encontrado');
        return;
    }

    document.getElementById('sendWhatsApp').onclick = () => sendWhatsApp(itemId);
    document.getElementById('copyWhatsAppMessage').onclick = () => copyToClipboard(generateWhatsAppMessage(item));

    modal.show();
}

function generateWhatsAppMessage(item) {
    return `
        Hola *${document.getElementById('whatsappName').value}* 👋🏻
        🍿Tu subscripción a *${item.productName}* 🍿
        ✉ *Usuario:* ${item.username}
        🔐 *Contraseña:* ${item.password}
        👥 *Perfil:* ${item.numberProfile}
        👥 *PIN:* ${item.pin}
        🗓 *Inicio:* ${item.startDate}
        🗓 *Fin:* ${item.endDate}
        ⚠️ *Condiciones de uso:* ${item.conditionOfUse || ''}
        👤 *Proveedor:* stream_360
        📞 *Teléfono del proveedor:* 924 804 802
        *¡¡Muchas gracias por su compra!!*
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => alert("Mensaje copiado al portapapeles"))
        .catch(err => alert("Error al copiar el mensaje: " + err));
}

function sendWhatsApp(itemId) {
    const phone = document.getElementById('whatsappPhone').value;
    const message = generateWhatsAppMessage(products.find(p => p.id === itemId));
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}


window.API_URL = 'http://127.0.0.1:5001';

window.vehiculosAPI = [];


// Global API URL
window.API_URL = 'http://127.0.0.1:5001';
const API_URL = window.API_URL;

// Global array for vehicles loaded from API
window.vehiculosAPI = [];

// Reserve a product (vehicle)
window.reservarProducto = async function(anuncio) {
  try {
    const mmUser = JSON.parse(localStorage.getItem('mm_user') || 'null');
    const token = localStorage.getItem('mm_token');
    if (!mmUser || !token) {
      alert('Debes iniciar sesión para reservar un vehículo.');
      window.location.href = 'login.html';
      return;
    }
    if (!anuncio._id && !anuncio.id) {
      alert('Error: No se pudo identificar el vehículo');
      return;
    }
    const vehicleId = anuncio._id || anuncio.id;
    const orderData = {
      items: [{
        vehicle: vehicleId,
        title: anuncio.title,
        price: anuncio.price,
        tipo: anuncio.tipo || '',
        foto: (anuncio.fotos && anuncio.fotos.length > 0) ? anuncio.fotos[0] : ''
      }],
      subtotal: anuncio.price,
      iva: Math.round(anuncio.price * 0.19),
      total: Math.round(anuncio.price * 1.19),
      paymentMethod: 'transferencia',
      notes: `Reserva de ${anuncio.title}`
    };
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    const data = await response.json();
    if (response.ok) {
      alert(`¡Reserva exitosa!\n\nProducto: ${anuncio.title}\nPrecio: $${anuncio.price.toLocaleString()}`);
      window.location.href = 'mis-reservas.html';
    } else {
      alert(`Error al reservar: ${data.message || 'Intenta de nuevo'}`);
    }
  } catch (err) {
    alert('Error de conexión. Intenta nuevamente.');
  }
};

// Show vehicle details in a modal
window.verDetalleProducto = function(anuncio) {
  let modal = document.getElementById('detalleModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'detalleModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.45)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    document.body.appendChild(modal);
  }
  let fotosHtml = '';
  if (anuncio.fotos && anuncio.fotos.length) {
    fotosHtml = anuncio.fotos.map(f => {
      const fotoUrl = f.startsWith('http') ? f : `${API_URL}${f}`;
      return `<img src="${fotoUrl}" style="width:120px;height:90px;object-fit:cover;margin:4px;border-radius:6px;border:1px solid #eee" />`;
    }).join('');
  }
  modal.innerHTML = `
    <div style="background:#fff;padding:28px 22px;border-radius:12px;max-width:420px;width:100%;box-shadow:0 6px 24px rgba(0,0,0,0.13);position:relative;max-height:90vh;overflow-y:auto;">
      <button id="cerrarDetalle" style="position:absolute;top:10px;right:10px;font-size:1.3rem;background:none;border:none;cursor:pointer">&times;</button>
      <h2 style="margin-bottom:8px">${anuncio.title}</h2>
      <div style="color:firebrick;font-weight:700;margin-bottom:8px">${anuncio.price ? '$'+anuncio.price.toLocaleString() : ''}</div>
      <div style="margin-bottom:8px"><strong>Tipo:</strong> ${anuncio.tipo || ''}</div>
      <div style="margin-bottom:8px"><strong>Marca/Modelo:</strong> ${anuncio.modelo || ''}</div>
      <div style="margin-bottom:8px"><strong>Año:</strong> ${anuncio.anio || ''}</div>
      <div style="margin-bottom:8px"><strong>Kilometraje:</strong> ${anuncio.kilometraje || ''} km</div>
      <div style="margin-bottom:8px"><strong>Transmisión:</strong> ${anuncio.transmision || ''}</div>
      <div style="margin-bottom:8px"><strong>Combustible:</strong> ${anuncio.combustible || ''}</div>
      <div style="margin-bottom:8px"><strong>Descripción:</strong> ${anuncio.descripcion || ''}</div>
      <div style="margin-bottom:8px"><strong>Fotos:</strong><br>${fotosHtml}</div>
      <div style="margin-bottom:8px"><strong>Contacto:</strong> ${anuncio.sellerName || anuncio.nombre || ''} <br>Tel: ${anuncio.sellerPhone || anuncio.telefono || ''} <br>Email: ${anuncio.sellerEmail || anuncio.email || ''}</div>
      <div style="margin-bottom:8px;font-size:0.9em;color:#888"><strong>Publicado:</strong> ${anuncio.createdAt ? new Date(anuncio.createdAt).toLocaleString() : (anuncio.fecha ? new Date(anuncio.fecha).toLocaleString() : '')}</div>
    </div>
  `;
  document.getElementById('cerrarDetalle').onclick = () => {
    modal.remove();
  };
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };
};

// Extract vehicle data from a card element
window.getAnuncioFromCard = function(btn) {
  const card = btn.closest('.product-card, .producto-card, .cajas');
  if (!card) return {};
  let title = '';
  if (card.querySelector('h3')) {
    title = card.querySelector('h3').textContent.trim();
  } else if (card.querySelector('h4')) {
    title = card.querySelector('h4').textContent.trim();
  } else if (card.querySelector('.precio h2')) {
    title = card.querySelector('.precio h2').textContent.trim();
  }
  if (!title) return {};
  return window.vehiculosAPI.find(a => a.title === title) || {};
};

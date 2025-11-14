

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar login
    const mmUser = JSON.parse(localStorage.getItem('mm_user') || 'null');
    const token = localStorage.getItem('mm_token');
    
    if(!mmUser || !token){
        alert('Debes iniciar sesión para ver tu panel.');
        window.location.href = 'login.html?redirect=mis-reservas.html';
        return;
    }

    // Cargar publicaciones del usuario desde la API
    try {
        const response = await fetch(`${API_URL}/api/vehicles/my/vehicles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderPublicaciones(data.vehicles || []);
        } else {
            console.error('Error cargando publicaciones');
            document.getElementById('publicaciones-list').innerHTML = '<p>Error al cargar publicaciones.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('publicaciones-list').innerHTML = '<p>Error de conexión.</p>';
    }

    // Cargar ventas (órdenes de mis vehículos publicados)
    try {
        const response = await fetch(`${API_URL}/api/orders/my-sales`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderVentas(data.orders || []);
        } else {
            console.error('Error cargando ventas');
            document.getElementById('ventas-list').innerHTML = '<p>Error al cargar ventas.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('ventas-list').innerHTML = '<p>Error de conexión.</p>';
    }

    // Cargar reservas del usuario desde la API
    try {
        const response = await fetch(`${API_URL}/api/orders/my`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderReservas(data.orders || []);
        } else {
            console.error('Error cargando reservas');
            document.getElementById('reservas-list').innerHTML = '<p>Error al cargar reservas.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('reservas-list').innerHTML = '<p>Error de conexión.</p>';
    }
});

function renderPublicaciones(publicaciones) {
    const pubCont = document.getElementById('publicaciones-list');
    pubCont.innerHTML = '';
    
    // Filtrar publicaciones activas (no completadas ni canceladas)
    const activas = publicaciones.filter(a => a.status !== 'completado' && a.status !== 'cancelado');
    if(activas.length === 0){
        pubCont.innerHTML = '<p>No tienes publicaciones activas.</p>';
        return;
    }
    activas.forEach((anuncio) => {
        const div = document.createElement('div');
        div.className = 'anuncio-card';
        div.style = 'background:#fff;border-radius:8px;box-shadow:0 2px 8px #eee;padding:12px;margin-bottom:12px;display:flex;align-items:center;gap:12px;';
        
        let imgUrl = '';
        if(anuncio.fotos && anuncio.fotos.length){
            imgUrl = anuncio.fotos[0].startsWith('http') 
                ? anuncio.fotos[0] 
                : `${API_URL}${anuncio.fotos[0]}`;
        }
        let imgHtml = imgUrl ? `<img src="${imgUrl}" style="width:80px;height:60px;object-fit:cover;border-radius:6px;border:1px solid #eee" />` : '';
        
        div.innerHTML = `
            ${imgHtml}
            <div style="flex:1">
              <strong>${anuncio.title}</strong><br>
              <span style="color:firebrick;font-weight:600">${anuncio.price ? '$'+anuncio.price.toLocaleString() : ''}</span><br>
              <span style="font-size:0.9em;color:#888">${anuncio.createdAt ? new Date(anuncio.createdAt).toLocaleString() : ''}</span><br>
              <span style="font-size:0.9em;color:#666">Estado: ${anuncio.status || 'disponible'}</span>
            </div>
            <button class="btnEliminar" style="background:#b22222;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer" data-id="${anuncio._id}">Eliminar</button>
        `;
        
        // Eliminar anuncio
        div.querySelector('.btnEliminar').onclick = async function(){
            if(confirm('¿Seguro que quieres eliminar esta publicación?')){
                const token = localStorage.getItem('mm_token');
                try {
                    const response = await fetch(`${API_URL}/api/vehicles/${anuncio._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        alert('Publicación eliminada correctamente');
                        location.reload();
                    } else {
                        alert('Error al eliminar la publicación');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión');
                }
            }
        };
        
        pubCont.appendChild(div);
    });
}

function renderReservas(reservas) {
    const resCont = document.getElementById('reservas-list');
    resCont.innerHTML = '';
    
    // Filtrar reservas activas (no completadas ni canceladas)
    const activas = reservas.filter(r => r.status !== 'completado' && r.status !== 'cancelado');
    if(activas.length === 0){
        resCont.innerHTML = '<p>No tienes reservas activas.</p>';
        return;
    }
    activas.forEach((reserva) => {
        // Obtener datos del vehículo desde items[0] o vehicle populate
        const item = reserva.items && reserva.items.length > 0 ? reserva.items[0] : {};
        const vehiculo = item.vehicle || {};
        
        const div = document.createElement('div');
        div.className = 'reserva-card';
        div.style = 'background:#fff;border-radius:8px;box-shadow:0 2px 8px #eee;padding:16px;margin-bottom:12px;';
        
        // Intentar obtener la imagen de varias fuentes
        let imgUrl = '';
        if(item.foto){
            imgUrl = item.foto.startsWith('http') ? item.foto : `${API_URL}${item.foto}`;
        } else if(vehiculo.fotos && vehiculo.fotos.length){
            imgUrl = vehiculo.fotos[0].startsWith('http') 
                ? vehiculo.fotos[0] 
                : `${API_URL}${vehiculo.fotos[0]}`;
        }
        
        let imgHtml = imgUrl 
            ? `<img src="${imgUrl}" style="width:150px;height:110px;object-fit:cover;border-radius:8px;border:1px solid #ddd" />` 
            : `<div style="width:150px;height:110px;background:#f0f0f0;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#999;border:1px solid #ddd">Sin foto</div>`;
        
        // Obtener información de varias fuentes
        const title = item.title || vehiculo.title || 'Sin título';
        const price = item.price || vehiculo.price || 0;
        const tipo = item.tipo || vehiculo.tipo || '';
        const modelo = vehiculo.modelo || '';
        const anio = vehiculo.anio || '';
        
        // Determinar color del badge según estado
        let statusColor = '#ffa500'; // naranja para pendiente
        let statusText = reserva.status || 'pendiente';
        if(statusText === 'completado') statusColor = '#28a745';
        if(statusText === 'cancelado') statusColor = '#dc3545';
        if(statusText === 'procesando') statusColor = '#007bff';
        
        div.innerHTML = `
            <div style="display:flex;gap:16px;align-items:start;">
                ${imgHtml}
                <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                        <h3 style="margin:0;font-size:1.1rem;color:#1a4c7c;">${title}</h3>
                        <span style="background:${statusColor};color:#fff;padding:4px 12px;border-radius:20px;font-size:0.85rem;font-weight:600;text-transform:uppercase;">${statusText}</span>
                    </div>
                    <div style="color:firebrick;font-weight:700;font-size:1.2rem;margin-bottom:8px;">$${price.toLocaleString()}</div>
                    ${tipo ? `<div style="margin-bottom:4px;"><strong>Tipo:</strong> ${tipo}</div>` : ''}
                    ${modelo ? `<div style="margin-bottom:4px;"><strong>Modelo:</strong> ${modelo}</div>` : ''}
                    ${anio ? `<div style="margin-bottom:4px;"><strong>Año:</strong> ${anio}</div>` : ''}
                    <div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee;">
                        <div style="font-size:0.9em;color:#666;"><strong>Reservado:</strong> ${reserva.createdAt ? new Date(reserva.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                        <div style="font-size:0.9em;color:#666;margin-top:4px;"><strong>Total:</strong> $${(reserva.total || 0).toLocaleString()} <span style="color:#888;">(IVA incluido)</span></div>
                    </div>
                    <div style="margin-top:12px;display:flex;gap:8px;align-items:center;">
                        <button class="btnEliminarReserva" data-id="${reserva._id}" style="background:#dc3545;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:0.9rem;font-weight:600;">🗑️ Cancelar Reserva</button>
                        <span style="font-size:0.85rem;color:#888;font-style:italic;">Nota: Solo el vendedor puede cambiar el estado de tu reserva</span>
                    </div>
                </div>
            </div>
        `;
        
        // Event listener para eliminar reserva
        div.querySelector('.btnEliminarReserva').onclick = async function() {
            if(confirm('¿Estás seguro que deseas cancelar esta reserva?')) {
                const token = localStorage.getItem('mm_token');
                const orderId = this.dataset.id;
                
                try {
                    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        alert('Reserva cancelada correctamente');
                        location.reload();
                    } else {
                        const data = await response.json();
                        alert(`Error: ${data.message || 'No se pudo cancelar la reserva'}`);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión al cancelar la reserva');
                }
            }
        };
        
        resCont.appendChild(div);
    });
}

// Función para renderizar ventas (órdenes recibidas de mis publicaciones)
function renderVentas(ventas) {
    const ventasCont = document.getElementById('ventas-list');
    ventasCont.innerHTML = '';
    
    // Filtrar ventas activas (no completadas ni canceladas)
    const activas = ventas.filter(v => v.status !== 'completado' && v.status !== 'cancelado');
    if(activas.length === 0){
        ventasCont.innerHTML = '<p>No tienes ventas activas.</p>';
        return;
    }
    activas.forEach((venta) => {
        // Obtener datos del vehículo y comprador
        const item = venta.items && venta.items.length > 0 ? venta.items[0] : {};
        const vehiculo = item.vehicle || {};
        const comprador = venta.buyer || {};
        
        const div = document.createElement('div');
        div.className = 'venta-card';
        div.style = 'background:#fff;border-radius:8px;box-shadow:0 2px 8px #eee;padding:16px;margin-bottom:12px;border-left:4px solid #28a745;';
        
        // Intentar obtener la imagen
        let imgUrl = '';
        if(item.foto){
            imgUrl = item.foto.startsWith('http') ? item.foto : `${API_URL}${item.foto}`;
        } else if(vehiculo.fotos && vehiculo.fotos.length){
            imgUrl = vehiculo.fotos[0].startsWith('http') 
                ? vehiculo.fotos[0] 
                : `${API_URL}${vehiculo.fotos[0]}`;
        }
        
        let imgHtml = imgUrl 
            ? `<img src="${imgUrl}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;border:1px solid #ddd" />` 
            : `<div style="width:120px;height:90px;background:#f0f0f0;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#999;border:1px solid #ddd">Sin foto</div>`;
        
        // Obtener información
        const title = item.title || vehiculo.title || 'Sin título';
        const price = item.price || vehiculo.price || 0;
        const tipo = item.tipo || vehiculo.tipo || '';
        const statusText = venta.status || 'pendiente';
        
        // Determinar color del badge según estado
        let statusColor = '#ffa500';
        if(statusText === 'completado') statusColor = '#28a745';
        if(statusText === 'cancelado') statusColor = '#dc3545';
        if(statusText === 'procesando') statusColor = '#007bff';
        
        div.innerHTML = `
            <div style="display:flex;gap:16px;align-items:start;">
                ${imgHtml}
                <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                        <div>
                            <h3 style="margin:0 0 4px 0;font-size:1.1rem;color:#1a4c7c;">${title}</h3>
                            <div style="font-size:0.85rem;color:#666;">
                                <strong>Comprador:</strong> ${comprador.name || 'N/A'}<br>
                                <strong>Email:</strong> ${comprador.email || 'N/A'}<br>
                                <strong>Teléfono:</strong> ${comprador.phone || 'N/A'}
                            </div>
                        </div>
                        <span style="background:${statusColor};color:#fff;padding:4px 12px;border-radius:20px;font-size:0.85rem;font-weight:600;text-transform:uppercase;white-space:nowrap;">${statusText}</span>
                    </div>
                    <div style="color:firebrick;font-weight:700;font-size:1.1rem;margin-bottom:8px;">$${price.toLocaleString()}</div>
                    ${tipo ? `<div style="margin-bottom:4px;font-size:0.9rem;"><strong>Tipo:</strong> ${tipo}</div>` : ''}
                    <div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee;">
                        <div style="font-size:0.9em;color:#666;"><strong>Fecha de orden:</strong> ${venta.createdAt ? new Date(venta.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                        <div style="font-size:0.9em;color:#666;margin-top:4px;"><strong>Total:</strong> $${(venta.total || 0).toLocaleString()} <span style="color:#888;">(IVA incluido)</span></div>
                    </div>
                    <div style="margin-top:12px;display:flex;gap:8px;align-items:center;">
                        <label style="font-size:0.9rem;color:#666;font-weight:600;">Gestionar venta:</label>
                        <select class="cambiarEstadoVenta" data-id="${venta._id}" style="padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:0.9rem;cursor:pointer;flex:1;max-width:200px;">
                            <option value="pendiente" ${statusText === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                            <option value="procesando" ${statusText === 'procesando' ? 'selected' : ''}>🔄 Procesando</option>
                            <option value="completado" ${statusText === 'completado' ? 'selected' : ''}>✅ Completado</option>
                            <option value="cancelado" ${statusText === 'cancelado' ? 'selected' : ''}>❌ Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        // Event listener para cambiar estado de venta
        div.querySelector('.cambiarEstadoVenta').onchange = async function() {
            const token = localStorage.getItem('mm_token');
            const orderId = this.dataset.id;
            const newStatus = this.value;
            
            if(confirm(`¿Cambiar el estado de esta venta a "${newStatus}"?`)) {
                try {
                    const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ status: newStatus })
                    });
                    
                    if (response.ok) {
                        alert('Estado actualizado correctamente');
                        location.reload();
                    } else {
                        const data = await response.json();
                        alert(`Error: ${data.message || 'No se pudo actualizar el estado'}`);
                        this.value = statusText;
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión al actualizar el estado');
                    this.value = statusText;
                }
            } else {
                this.value = statusText;
            }
        };
        
        ventasCont.appendChild(div);
    });
}




document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM
    const aplicarBtn = document.getElementById('aplicar-filtros');
    const limpiarBtn = document.getElementById('limpiar-filtros');
    const resultadosGrid = document.getElementById('resultados-grid');
    
    // Event listeners
    if (aplicarBtn) {
        aplicarBtn.addEventListener('click', aplicarFiltrosIndex);
    }
    
    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', limpiarFiltrosIndex);
    }
    
    // Cargar todos los vehículos al inicio
    setTimeout(() => {
        if (window.vehiculosAPI && window.vehiculosAPI.length > 0) {
            mostrarResultados(window.vehiculosAPI);
        } else {
            cargarYMostrarVehiculos();
        }
    }, 500);
});

// Cargar vehículos desde la API
async function cargarYMostrarVehiculos() {
    try {
        const response = await fetch(`${API_URL}/api/vehicles`);
        const data = await response.json();
        
        if (data.success && data.vehicles) {
            window.vehiculosAPI = data.vehicles;
            mostrarResultados(data.vehicles);
        }
    } catch (error) {
        console.error('Error cargando vehículos para filtros:', error);
        const resultadosGrid = document.getElementById('resultados-grid');
        if (resultadosGrid) {
            resultadosGrid.innerHTML = '<p style="text-align:center;color:#666;">Error al cargar vehículos</p>';
        }
    }
}

// Función para aplicar filtros
function aplicarFiltrosIndex() {
    // Obtener valores de los filtros
    const tiposCheckboxes = document.querySelectorAll('input[name="tipo"]:checked');
    const tiposSeleccionados = Array.from(tiposCheckboxes).map(cb => cb.value.toLowerCase());
    
    const marca = document.getElementById('marca')?.value.toLowerCase() || '';
    const precioMin = parseFloat(document.getElementById('precio-min')?.value) || 0;
    const precioMax = parseFloat(document.getElementById('precio-max')?.value) || Infinity;
    const ano = document.getElementById('ano')?.value || '';
    
    // Filtrar vehículos
    let vehiculosFiltrados = window.vehiculosAPI || [];
    
    // Filtrar por tipo
    if (tiposSeleccionados.length > 0) {
        vehiculosFiltrados = vehiculosFiltrados.filter(v => {
            const tipoVehiculo = (v.tipo || '').toLowerCase();
            return tiposSeleccionados.some(tipo => tipoVehiculo.includes(tipo));
        });
    }
    
    // Filtrar por marca
    if (marca) {
        vehiculosFiltrados = vehiculosFiltrados.filter(v => {
            const modeloVehiculo = (v.modelo || '').toLowerCase();
            const tituloVehiculo = (v.title || '').toLowerCase();
            return modeloVehiculo.includes(marca) || tituloVehiculo.includes(marca);
        });
    }
    
    // Filtrar por precio
    vehiculosFiltrados = vehiculosFiltrados.filter(v => {
        const precio = v.price || 0;
        return precio >= precioMin && precio <= precioMax;
    });
    
    // Filtrar por año
    if (ano) {
        vehiculosFiltrados = vehiculosFiltrados.filter(v => {
            return (v.anio || '').toString() === ano;
        });
    }
    
    mostrarResultados(vehiculosFiltrados);
}

// Función para limpiar filtros
function limpiarFiltrosIndex() {
    // Limpiar checkboxes
    document.querySelectorAll('input[name="tipo"]').forEach(cb => cb.checked = false);
    
    // Limpiar selects
    const marcaSelect = document.getElementById('marca');
    if (marcaSelect) marcaSelect.value = '';
    
    const anoSelect = document.getElementById('ano');
    if (anoSelect) anoSelect.value = '';
    
    // Limpiar inputs de precio
    const precioMin = document.getElementById('precio-min');
    if (precioMin) precioMin.value = '';
    
    const precioMax = document.getElementById('precio-max');
    if (precioMax) precioMax.value = '';
    
    // Mostrar todos los vehículos
    mostrarResultados(window.vehiculosAPI || []);
}

// Función para mostrar resultados
function mostrarResultados(vehiculos) {
    const resultadosGrid = document.getElementById('resultados-grid');
    if (!resultadosGrid) return;
    
    resultadosGrid.innerHTML = '';
    
    if (vehiculos.length === 0) {
        resultadosGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#666;font-size:1.1rem;">No se encontraron vehículos con los filtros aplicados</p>';
        return;
    }
    
    vehiculos.forEach(vehiculo => {
        const card = document.createElement('article');
        card.className = 'producto-card';
        // Obtener primera foto
        let imgHtml = '';
        if (vehiculo.fotos && vehiculo.fotos.length > 0) {
            const fotoUrl = vehiculo.fotos[0].startsWith('http') 
                ? vehiculo.fotos[0] 
                : `${API_URL}${vehiculo.fotos[0]}`;
            imgHtml = `<img src="${fotoUrl}" alt="${vehiculo.title}" style="width:100%;height:200px;object-fit:cover;border-radius:8px 8px 0 0;" />`;
        } else {
            imgHtml = `<div style="width:100%;height:200px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;border-radius:8px 8px 0 0;color:#999;">Sin foto</div>`;
        }
        card.innerHTML = `
            ${imgHtml}
            <div style="padding:16px;">
                <h3 style="margin:0 0 8px 0;font-size:1.1rem;color:#1a4c7c;">${vehiculo.title}</h3>
                <div style="color:firebrick;font-weight:700;font-size:1.2rem;margin-bottom:8px;">$${(vehiculo.price || 0).toLocaleString()}</div>
                <div style="font-size:0.9rem;color:#666;margin-bottom:4px;">
                    <strong>Tipo:</strong> ${vehiculo.tipo || 'N/A'}
                </div>
                <div style="font-size:0.9rem;color:#666;margin-bottom:4px;">
                    <strong>Modelo:</strong> ${vehiculo.modelo || 'N/A'}
                </div>
                <div style="font-size:0.9rem;color:#666;margin-bottom:12px;">
                    <strong>Año:</strong> ${vehiculo.anio || 'N/A'}
                </div>
                <div class="card-actions" style="display:flex;gap:12px;justify-content:center;">
                    <button class="btn secondary card-btn-modern" onclick="window.verDetalleProducto(${JSON.stringify(vehiculo).replace(/\"/g, '&quot;')})">Ver detalles</button>
                    <button class="btn primary card-btn-modern" onclick="window.reservarProducto(${JSON.stringify(vehiculo).replace(/\"/g, '&quot;')})">Reservar</button>
                </div>
            </div>
        `;
        resultadosGrid.appendChild(card);
    });
}

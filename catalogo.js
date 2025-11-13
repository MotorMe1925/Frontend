async function init(){
  // Cargar vehículos desde MongoDB Atlas
  try {
    const response = await fetch(`${API_URL}/api/vehicles`);
    const data = await response.json();
    
    if (data.success && data.vehicles) {
      window.vehiculosAPI = data.vehicles;
      console.log(`✅ Cargados ${data.vehicles.length} vehículos desde MongoDB Atlas`);
      
      // Renderizar vehículos si hay un contenedor
      renderVehiculos(data.vehicles);
    }
  } catch (error) {
    console.error('Error cargando vehículos:', error);
  }

  function comprar(btn){
    const anuncio = window.getAnuncioFromCard(btn);
    window.reservarProducto(anuncio);
  }
  
  function verDetalle(btn){
    const card = btn.closest('.product-card');
    const title = card.querySelector('h3').textContent;
    
    let anuncio = window.vehiculosAPI.find(a => a.title === title);
    if(!anuncio){
      alert('Ver detalle de: ' + title + ' (producto estático)');
      return;
    }
    
    window.verDetalleProducto(anuncio);
  }
  
  // Exponer funciones globalmente para que los botones del DOM puedan usarlas
  window.comprar = comprar;
  window.verDetalle = verDetalle;

  function renderVehiculos(vehiculos){
    const catalog = document.getElementById('catalog');
    if(!catalog) return;
    
    // Eliminar vehículos previos cargados por API
    catalog.querySelectorAll('.product-card.api-vehicle').forEach(e => e.remove());
    
    vehiculos.forEach(vehiculo => {
      const card = document.createElement('article');
      card.className = 'product-card api-vehicle';
      card.dataset.tipo = vehiculo.tipo || '';
      
      // Galería de fotos (solo la primera)
      let imgHtml = '';
      if(vehiculo.fotos && vehiculo.fotos.length){
        const fotoUrl = vehiculo.fotos[0].startsWith('http') 
          ? vehiculo.fotos[0] 
          : `${API_URL}${vehiculo.fotos[0]}`;
        imgHtml = `<img src="${fotoUrl}" alt="${vehiculo.title}" />`;
      } else {
        imgHtml = `<div style="height:150px;background:#eee;text-align:center;display:flex;align-items:center;justify-content:center;">Sin foto</div>`;
      }
      
      card.innerHTML = `
        ${imgHtml}
        <h3>${vehiculo.title}</h3>
        <div class="price">${vehiculo.price ? '$'+vehiculo.price.toLocaleString() : ''}</div>
        <div class="card-actions">
          <button class="btn secondary" onclick="verDetalle(this)">Ver detalles</button>
          <button class="btn primary" onclick="window.reservarProducto(window.getAnuncioFromCard(this))">Reservar</button>
        </div>
      `;
      catalog.appendChild(card);
    });
  }

  function renderAnuncios(){
    const catalog = document.getElementById('catalog');
    if(!catalog) return;
    // Eliminar anuncios previos
    catalog.querySelectorAll('.product-card.anuncio').forEach(e => e.remove());
    const anuncios = JSON.parse(localStorage.getItem('mm_anuncios') || '[]');
    const anunciosOrdenados = [...anuncios].reverse();
    anunciosOrdenados.forEach(anuncio => {
      const card = document.createElement('article');
      card.className = 'product-card anuncio';
      card.dataset.tipo = anuncio.tipo || '';
      // Galería de fotos (solo la primera)
      let imgHtml = '';
      if(anuncio.fotos && anuncio.fotos.length){
        imgHtml = `<img src="${anuncio.fotos[0]}" alt="${anuncio.title}" />`;
      } else {
        imgHtml = `<div style="height:150px;background:#eee;text-align:center;display:flex;align-items:center;justify-content:center;">Sin foto</div>`;
      }
      card.innerHTML = `
        ${imgHtml}
        <h3>${anuncio.title}</h3>
        <div class="price">${anuncio.price ? '$'+anuncio.price : ''}</div>
        <div class="card-actions">
          <button class="btn secondary" onclick="verDetalle(this)">Ver detalles</button>
          <button class="btn primary" onclick="window.reservarProducto(window.getAnuncioFromCard(this))">Reservar</button>
        </div>
      `;
      catalog.appendChild(card);
    });
  }

  renderAnuncios(); // Mantener para anuncios de localStorage si existen

  const buscarBtn = document.getElementById('buscarBtn');
  const filterTipo = document.getElementById('filterTipo');
  const qInput = document.getElementById('q');
  
  function aplicarFiltros() {
    const q = (qInput?.value || '').toLowerCase().trim();
    const tipo = filterTipo?.value || '';
    const cards = Array.from(document.querySelectorAll('.product-card'));
    
    cards.forEach(c => {
      const title = (c.querySelector('h3')?.textContent || '').toLowerCase();
      const matchText = !q || title.includes(q);
      const matchTipo = !tipo || c.dataset.tipo === tipo;
      c.style.display = (matchText && matchTipo) ? '' : 'none';
    });
  }
  
  if(buscarBtn){
    buscarBtn.addEventListener('click', aplicarFiltros);
  }
  
  // Aplicar filtros también al cambiar el select
  if(filterTipo){
    filterTipo.addEventListener('change', aplicarFiltros);
  }
  
  if(qInput){
    qInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') aplicarFiltros();
    });
  }
}

// Ejecutar automáticamente al cargar el archivo
init();

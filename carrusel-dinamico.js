

document.addEventListener('DOMContentLoaded', async function() {
    const carruselContainer = document.getElementById('carrusel-dinamico');
    if(!carruselContainer) return;

    carruselContainer.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">Cargando productos destacados...</p>';

    try {
        const response = await fetch(`${API_URL}/api/vehicles`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error('Error al cargar vehículos');
        }

        let anuncios = data.vehicles || [];
        // Ordenar por fecha de publicación descendente (más reciente primero)
        anuncios = anuncios.sort((a, b) => {
            const fechaA = new Date(a.createdAt || a.fechaPublicacion || a.fecha || 0);
            const fechaB = new Date(b.createdAt || b.fechaPublicacion || b.fecha || 0);
            return fechaB - fechaA;
        });

        if(anuncios.length === 0){
            carruselContainer.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No hay productos destacados aún.</p>';
            return;
        }

        carruselContainer.innerHTML = '';
        const carrusel = document.createElement('div');
        carrusel.className = 'carrusel';

        const productosDestacados = anuncios.slice(0, 5); // Los 5 más recientes

        productosDestacados.forEach((anuncio) => {
            const caja = document.createElement('div');
            caja.className = 'cajas';

            const imgBox = document.createElement('div');
            imgBox.className = 'imgBox';
            
            let imagenUrl = 'Img/vehiculos.jpg';
            if (anuncio.fotos && anuncio.fotos.length > 0) {
                imagenUrl = anuncio.fotos[0].startsWith('http') 
                    ? anuncio.fotos[0] 
                    : `${API_URL}${anuncio.fotos[0]}`;
            }
            
            imgBox.style.backgroundImage = `url('${imagenUrl}')`;
            imgBox.style.backgroundSize = 'cover';
            imgBox.style.backgroundPosition = 'center';

            const contenido = document.createElement('div');
            contenido.className = 'contenido';

            const precio = document.createElement('div');
            precio.className = 'precio';
            precio.innerHTML = `<h2>${anuncio.title || 'Sin título'}</h2>`;

            const info = document.createElement('div');
            info.className = 'info';
            info.innerHTML = `
                <h3>$${anuncio.price || 'N/A'}</h3>
                <p>Tipo: ${anuncio.tipo || 'N/A'}</p>
                <p>${anuncio.kilometraje ? anuncio.kilometraje + ' km' : ''}</p>
            `;

            const cardActions = document.createElement('div');
            cardActions.className = 'card-actions';
            
            const btnDetalle = document.createElement('button');
            btnDetalle.className = 'btn secondary';
            btnDetalle.textContent = 'Ver detalles';
            btnDetalle.onclick = function() {
                if (window.verDetalleProducto) {
                    window.verDetalleProducto(anuncio);
                }
            };

            const btnReservar = document.createElement('button');
            btnReservar.className = 'btn primary';
            btnReservar.textContent = 'Reservar';
            btnReservar.onclick = function() {
                if (window.reservarProducto) {
                    window.reservarProducto(anuncio);
                }
            };

            cardActions.appendChild(btnDetalle);
            cardActions.appendChild(btnReservar);
            
            contenido.appendChild(precio);
            contenido.appendChild(info);
            contenido.appendChild(cardActions);
            
            caja.appendChild(imgBox);
            caja.appendChild(contenido);
            
            carrusel.appendChild(caja);
        });
        
        carruselContainer.appendChild(carrusel);
        
    } catch (error) {
        console.error('Error al cargar el carrusel:', error);
        carruselContainer.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">Error al cargar productos destacados.</p>';
    }
});

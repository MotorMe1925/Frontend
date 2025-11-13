
// Redirigir si no está logueado
if (!localStorage.getItem('mm_token')) {
  alert('Debes iniciar sesión para publicar un vehículo.');
  window.location.href = 'login.html?redirect=publicar.html';
}

export function init(){
  const fotosInput = document.getElementById('fotos');
  const preview = document.getElementById('preview');
  const maxFiles = 8;
  const form = document.getElementById('sellForm');
  const submitBtn = document.querySelector('.submit-btn');

  function clearPreview(){ preview.innerHTML = ''; }

  function createThumb(file){
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url;
    img.alt = file.name;
    return img;
  }

  if(fotosInput){
    fotosInput.addEventListener('change', (e)=>{
      clearPreview();
      const files = Array.from(e.target.files).slice(0, maxFiles);
      if(files.length === 0) return;
      files.forEach(f => preview.appendChild(createThumb(f)));
    });
  }

  if(form){
    form.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      
      // Verificar autenticación
      const token = localStorage.getItem('mm_token');
      if (!token) {
        alert('Debes iniciar sesión para publicar un vehículo.');
        window.location.href = 'login.html?redirect=publicar.html';
        return;
      }

      // required checks
      const title = document.getElementById('titulo').value.trim();
      const price = document.getElementById('precio').value;
      const tipo = document.getElementById('tipo').value;
      const modelo = document.getElementById('modelo').value;
      const anio = document.getElementById('anio').value;
      const kilometraje = document.getElementById('kilometraje').value;
      const transmision = document.getElementById('transmision').value;
      const combustible = document.getElementById('combustible').value;
      const descripcion = document.getElementById('descripcion').value;
      const nombre = document.getElementById('nombre').value;
      const telefono = document.getElementById('telefono').value;
      const email = document.getElementById('email').value;
      const files = (fotosInput && fotosInput.files && fotosInput.files.length) || 0;
      const confirm = document.getElementById('confirm').checked;
      
      if(!title || !price || files < 1 || !confirm){
        alert('Por favor completa: título, precio, sube al menos 1 foto y confirma la veracidad.');
        return;
      }

      // Preparar FormData para envío multipart
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      formData.append('tipo', tipo);
      formData.append('modelo', modelo);
      formData.append('anio', anio);
      formData.append('kilometraje', kilometraje);
      formData.append('transmision', transmision);
      formData.append('combustible', combustible);
      formData.append('descripcion', descripcion);
      formData.append('nombre', nombre);
      formData.append('telefono', telefono);
      formData.append('email', email);

      // Agregar archivos de fotos
      if(fotosInput && fotosInput.files){
        const filesArr = Array.from(fotosInput.files).slice(0, maxFiles);
        filesArr.forEach((file) => {
          formData.append('fotos', file);
        });
      }

      // Enviar al backend
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publicando...';

      try {
        const response = await fetch(`${window.API_URL}/api/vehicles`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          alert('¡Vehículo publicado correctamente! Aparecerá en el catálogo.');
          form.reset();
          clearPreview();
          // Recargar la página para actualizar la lista de vehículos
          window.location.reload();
        } else {
          throw new Error(data.message || 'Error al publicar el vehículo');
        }
      } catch (error) {
        console.error('Error al publicar:', error);
        alert('Error al publicar el vehículo: ' + error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publicar anuncio';
      }
    });
  }
}

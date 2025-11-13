

document.addEventListener('DOMContentLoaded', function() {
  // Formulario de contacto (solo simula envío)
  const form = document.getElementById('contactForm');
  if(form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const btn = this.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      setTimeout(() => {
        document.getElementById('formMsg').textContent = '¡Gracias por contactarnos! Te responderemos pronto.';
        btn.disabled = false;
        btn.textContent = 'Enviar mensaje';
        this.reset();
      }, 1200);
    };
  }
  // FAQ toggle: mostrar/ocultar respuesta al hacer clic en la pregunta
  document.querySelectorAll('.faq-q').forEach(q => {
    q.style.cursor = 'pointer';
    q.addEventListener('click', function() {
      this.classList.toggle('open');
      const respuesta = this.nextElementSibling;
      if (respuesta && respuesta.classList.contains('faq-a')) {
        respuesta.style.display = (respuesta.style.display === 'block') ? 'none' : 'block';
      }
    });
    // Ocultar todas las respuestas al inicio
    const respuesta = q.nextElementSibling;
    if (respuesta && respuesta.classList.contains('faq-a')) {
      respuesta.style.display = 'none';
    }
  });
});

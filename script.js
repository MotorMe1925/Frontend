// API_URL se define en global-functions.js

document.addEventListener('DOMContentLoaded', async function(){
    const form = document.getElementById('loginForm');
    const message = document.getElementById('loginMessage');

    // Registrar listener del login - ahora usando API real
    if(form){
        form.addEventListener('submit', async function(e){
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        
        if(!email || !password){
            message.textContent = 'Por favor completa todos los campos.';
            message.className = 'message error';
            return;
        }

        // Deshabilitar botón mientras se procesa
        const submitBtn = form.querySelector('button[type="submit"]');
        if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando sesión...';
        }

        try {
            // Login contra MongoDB Atlas a través de la API
            const response = await fetch(`${window.API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Guardar token JWT y datos del usuario
                localStorage.setItem('mm_token', data.token);
                localStorage.setItem('mm_user', JSON.stringify({
                    id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone,
                    role: data.user.role
                }));
                
                message.textContent = '✅ Ingreso correcto. Redirigiendo...';
                message.className = 'message success';
                setTimeout(()=>{ window.location.href = 'index.html'; }, 900);
            } else {
                message.textContent = `❌ ${data.message || 'Credenciales incorrectas. Verifica e intenta de nuevo.'}`;
                message.className = 'message error';
            }
        } catch (error) {
            console.error('Error al hacer login:', error);
                message.textContent = '❌ Error de conexión. Intenta nuevamente.';
            message.className = 'message error';
        } finally {
            // Rehabilitar botón
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Ingresar';
            }
        }
    });

    }

    /* ----- Registro (modal) ----- */
    const openRegister = document.getElementById('openRegister');
    const registerModal = document.getElementById('registerModal');
    const closeRegister = document.getElementById('closeRegister');
    const cancelRegister = document.getElementById('cancelRegister');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    function showRegister(){
        if(!registerModal) return;
        registerModal.classList.add('active');
        registerModal.setAttribute('aria-hidden', 'false');
        // focus first input (si existe el formulario)
        if(registerForm){
            const first = registerForm.querySelector('input');
            if(first) first.focus();
        }
    }
    function hideRegister(){
        if(!registerModal) return;
        registerModal.classList.remove('active');
        registerModal.setAttribute('aria-hidden', 'true');
        if(registerMessage) registerMessage.textContent = '';
        if(registerForm) registerForm.reset();
    }

    if(openRegister){
        openRegister.addEventListener('click', function(e){ e.preventDefault(); showRegister(); });
    }
    if(closeRegister){ closeRegister.addEventListener('click', hideRegister); }
    if(cancelRegister){ cancelRegister.addEventListener('click', hideRegister); }
    if(modalBackdrop){ modalBackdrop.addEventListener('click', hideRegister); }


    if(registerForm){
        registerForm.addEventListener('submit', async function(e){
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const pass = document.getElementById('reg-password').value;
            const pass2 = document.getElementById('reg-password2').value;
            const phone = document.getElementById('reg-phone')?.value.trim() || '';

            if(!name || !email || !pass || !pass2){
                registerMessage.textContent = 'Completa todos los campos.';
                registerMessage.className = 'message error';
                return;
            }
            if(pass !== pass2){
                registerMessage.textContent = 'Las contraseñas no coinciden.';
                registerMessage.className = 'message error';
                return;
            }

            // Deshabilitar botón mientras se procesa
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registrando...';
            }

            try {
                // Registrar usuario en MongoDB Atlas a través de la API
                const response = await fetch(`${window.API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: pass,
                        phone: phone
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    registerMessage.textContent = '✅ Registro exitoso. Puedes iniciar sesión.';
                    registerMessage.className = 'message success';

                    // prefill login email
                    const loginEmail = document.getElementById('email');
                    if(loginEmail) loginEmail.value = email;

                    // Limpiar formulario
                    registerForm.reset();

                    setTimeout(()=>{ hideRegister(); }, 1500);
                } else {
                    registerMessage.textContent = `❌ Error: ${data.message || 'No se pudo crear la cuenta'}`;
                    registerMessage.className = 'message error';
                }
            } catch (error) {
                console.error('Error al registrar:', error);
                    registerMessage.textContent = '❌ Error de conexión. Intenta nuevamente.';
                registerMessage.className = 'message error';
            } finally {
                // Rehabilitar botón
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Registrarse';
                }
            }
        });
    }

    /** Actualizar el header según estado de autenticación (cliente-demo) */
    function updateAuthHeader(){
        const mmUser = JSON.parse(localStorage.getItem('mm_user') || 'null');
        const nav = document.querySelector('header nav');
        if(!nav) return;

        // Buscar el enlace de login existente (por href)
        let loginAnchor = nav.querySelector('a[href="login.html"]');

        // Eliminar elementos previos de usuario (no elimines el login aún)
        const existingUser = nav.querySelector('.user-menu-wrap');
        if(existingUser) existingUser.remove();
        const existingLogout = nav.querySelector('#logoutLink');
        if(existingLogout) existingLogout.remove();

        if(mmUser){
            // Si hay usuario logueado, ocultar/eliminar el enlace de login
            if(loginAnchor) loginAnchor.remove();
            // Crear botón de usuario con menú
            const userWrap = document.createElement('div');
            userWrap.className = 'user-menu-wrap';
            userWrap.style.position = 'relative';
            userWrap.style.display = 'inline-block';

            const userBtn = document.createElement('button');
            userBtn.className = 'user-menu-btn';
            userBtn.textContent = 'Hola, ' + (mmUser.name || mmUser.email);
            userBtn.style.background = 'linear-gradient(90deg,#fff 60%,#f8dada 100%)';
            userBtn.style.border = '1px solid #b22222';
            userBtn.style.cursor = 'pointer';
            userBtn.style.fontWeight = 'bold';
            userBtn.style.color = '#b22222';
            userBtn.style.padding = '6px 18px';
            userBtn.style.borderRadius = '24px';
            userBtn.style.boxShadow = '0 2px 8px rgba(178,34,34,0.08)';
            userBtn.style.transition = 'box-shadow 0.2s, background 0.2s';
            userBtn.onmouseenter = function(){
                userBtn.style.background = 'linear-gradient(90deg,#fff 40%,#e74c3c 100%)';
                userBtn.style.boxShadow = '0 4px 16px rgba(178,34,34,0.18)';
            };
            userBtn.onmouseleave = function(){
                userBtn.style.background = 'linear-gradient(90deg,#fff 60%,#f8dada 100%)';
                userBtn.style.boxShadow = '0 2px 8px rgba(178,34,34,0.08)';
            };

            const menu = document.createElement('div');
            menu.className = 'user-menu-dropdown';
            menu.style.display = 'none';
            menu.style.position = 'absolute';
            menu.style.top = '110%';
            menu.style.left = '0';
            menu.style.background = '#fff';
            menu.style.boxShadow = '0 2px 12px #e74c3c44';
            menu.style.borderRadius = '12px';
            menu.style.padding = '12px 24px';
            menu.style.zIndex = '1000';
            menu.style.minWidth = '140px';
            menu.style.textAlign = 'center';

            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutLink';
            logoutBtn.textContent = 'Cerrar sesión';
            logoutBtn.style.background = 'firebrick';
            logoutBtn.style.color = '#fff';
            logoutBtn.style.border = 'none';
            logoutBtn.style.padding = '8px 18px';
            logoutBtn.style.borderRadius = '8px';
            logoutBtn.style.cursor = 'pointer';
            logoutBtn.style.width = '100%';
            logoutBtn.style.fontWeight = 'bold';
            logoutBtn.style.boxShadow = '0 2px 8px #e74c3c22';
            logoutBtn.onmouseenter = function(){
                logoutBtn.style.background = '#e74c3c';
            };
            logoutBtn.onmouseleave = function(){
                logoutBtn.style.background = 'firebrick';
            };

            menu.appendChild(logoutBtn);
            userWrap.appendChild(userBtn);
            userWrap.appendChild(menu);
            nav.appendChild(userWrap);

            // Mostrar menú al pasar el mouse
            userBtn.addEventListener('mouseenter', ()=>{
                menu.style.display = 'block';
            });
            userWrap.addEventListener('mouseleave', ()=>{
                menu.style.display = 'none';
            });
            // También mostrar al hacer click (opcional para móviles)
            userBtn.addEventListener('click', ()=>{
                menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
            });
            // Logout
            logoutBtn.addEventListener('click', function(e){
                e.preventDefault();
                localStorage.removeItem('mm_token');
                localStorage.removeItem('mm_user');
                updateAuthHeader();
                window.location.href = 'index.html';
            });
        } else {
            // No hay usuario: asegurarse de que exista el enlace a login
            // Re-consultar por si fue eliminado antes
            loginAnchor = nav.querySelector('a[href="login.html"]');
            if(!loginAnchor){
                const a = document.createElement('a');
                a.href = 'login.html';
                a.innerHTML = '<span id="login">Ingresar</span>';
                nav.appendChild(a);
            }
        }
    }

    // Llamada inicial para adaptar el header en páginas donde exista
    updateAuthHeader();

    // Hacer que cualquier elemento con la clase .logo actúe como botón hacia la página principal
    document.querySelectorAll('.logo').forEach(el => {
        try{
            el.addEventListener('click', function(e){
                // si el elemento está dentro de un formulario, evitar submit
                if(el.tagName.toLowerCase() === 'button') e.preventDefault();
                window.location.href = 'index.html';
            });
        } catch(err){ console.warn('No se pudo adjuntar listener a .logo', err); }
    });

    // Carga condicional de JS por página
    const page = document.body.dataset.page;
    try {
        if(page === 'publicar') {
            const mod = await import('./publicar.js');
            if(mod && typeof mod.init === 'function') mod.init();
        } else if(page === 'catalogo') {
            const mod = await import('./catalogo.js');
            if(mod && typeof mod.init === 'function') mod.init();
        }
    } catch(err){
        console.warn('No se pudo cargar el JS de la página:', err);
    }
});

function limpiarFiltros() {
        searchInput.value = '';
        tipoVehiculos.forEach(cb => cb.checked = false);
        marcaSelect.value = '';
        precioMin.value = '';
        precioMax.value = '';
        anoSelect.value = '';
        
        vehiculos.forEach(vehiculo => {
            vehiculo.style.display = 'block';
        });
    }

    // Event Listeners
    searchButton.addEventListener('click', aplicarFiltros);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            aplicarFiltros();
        }
    });
    
    aplicarFiltrosBtn.addEventListener('click', aplicarFiltros);
    limpiarFiltrosBtn.addEventListener('click', limpiarFiltros);
    
    // Aplicar filtros cuando cambian los selectores
    [marcaSelect, anoSelect].forEach(select => {
        select.addEventListener('change', aplicarFiltros);
    });

    // Aplicar filtros cuando cambian los checkboxes
    tipoVehiculos.forEach(checkbox => {
        checkbox.addEventListener('change', aplicarFiltros);
    });

    // Aplicar filtros cuando cambian los inputs de precio
    [precioMin, precioMax].forEach(input => {
        input.addEventListener('input', aplicarFiltros);
    });

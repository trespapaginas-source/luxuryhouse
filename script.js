document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./content/data.json');
        const data = await response.json();
        
        if(document.getElementById('hero-etiqueta')) document.getElementById('hero-etiqueta').innerHTML = data.hero.etiqueta;
        if(document.getElementById('hero-titulo')) {
            document.getElementById('hero-titulo').innerHTML = `${data.hero.titulo_parte1} <br/> <span class="text-amber-400 italic font-light">${data.hero.titulo_parte2}</span>`;
        }
        if(document.getElementById('hero-descripcion')) document.getElementById('hero-descripcion').innerHTML = data.hero.descripcion;
        if(document.getElementById('hero-bg')) document.getElementById('hero-bg').src = data.hero.imagen_fondo;
        if(document.getElementById('hero-btn-1')) {
            document.getElementById('hero-btn-1').innerHTML = `<i data-lucide="eye" width="18"></i> ${data.hero.boton_primario_texto}`;
        }
        if(document.getElementById('hero-btn-2')) {
            document.getElementById('hero-btn-2').innerText = data.hero.boton_secundario_texto;
        }
    } catch (error) {
        console.error('Error cargando el contenido del CMS:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicialización Diferida de Iconos
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 2. Footer Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // 3. Tour Overlay Logic
    const tourOverlay = document.getElementById('tour-overlay');
    if (tourOverlay) {
        tourOverlay.addEventListener('click', function () {
            this.classList.add('fade-out');
        }, { passive: true });
    }

    // 4. Scroll Logic (Optimized with RequestAnimationFrame)
    const navbar = document.getElementById('navbar');
    const navLogo = document.getElementById('nav-logo');
    const navLinksContainer = document.getElementById('nav-links');
    const menuBtn = document.getElementById('menu-btn');

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateNav(window.scrollY);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    function updateNav(scrollPos) {
        if (scrollPos > 50) {
            navbar.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-lg', 'py-3');
            navbar.classList.remove('bg-transparent', 'py-6');
            navLogo.classList.replace('text-white', 'text-stone-800');
            navLinksContainer.classList.replace('text-white/90', 'text-stone-600');
            menuBtn.classList.replace('text-white', 'text-stone-800');
        } else {
            navbar.classList.remove('bg-white/95', 'backdrop-blur-md', 'shadow-lg', 'py-3');
            navbar.classList.add('bg-transparent', 'py-6');
            navLogo.classList.replace('text-stone-800', 'text-white');
            navLinksContainer.classList.replace('text-stone-600', 'text-white/90');
            menuBtn.classList.replace('text-stone-800', 'text-white');
        }
    }

    // 5. Mobile Menu Logic
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
    });
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
        });
    });

    // 6. Booking System Logic (Init)
    initBookingSystem();
});

// Booking Logic Encapsulation
function initBookingSystem() {
    let state = { checkin: '', checkout: '', pax: '', terms: false };

    // Generate Pax Options
    const paxDropdown = document.getElementById('pax-dropdown');
    const fragment = document.createDocumentFragment(); // Performance boost
    for (let i = 1; i <= 20; i++) {
        const div = document.createElement('div');
        div.className = 'px-4 py-3 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 cursor-pointer transition-colors font-body';
        div.innerText = `${i} ${i === 1 ? 'huésped' : 'huéspedes'}`;
        div.onclick = () => selectPax(`${i} ${i === 1 ? 'huésped' : 'huéspedes'}`);
        fragment.appendChild(div);
    }
    paxDropdown.appendChild(fragment);

    const checkinInput = document.getElementById('checkin-input');
    const checkoutInput = document.getElementById('checkout-input');

    // Set Min Date
    const today = new Date().toISOString().split('T')[0];
    checkinInput.min = today;
    checkinInput.setAttribute('min', today);

    // Checkin Logic
    checkinInput.addEventListener('change', (e) => {
        state.checkin = e.target.value;
        const dateParts = state.checkin.split('-');
        const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        updateDisplay('checkin', dateObj);

        // Setup Checkout
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];

        checkoutInput.min = nextDayStr;
        checkoutInput.setAttribute('min', nextDayStr);
        checkoutInput.disabled = false;
        checkoutInput.classList.remove('cursor-not-allowed');
        checkoutInput.classList.add('cursor-pointer');

        if (state.checkout && state.checkout <= state.checkin) {
            state.checkout = '';
            resetDisplay('checkout');
        }
        checkContinueButton();
    });

    // Checkout Logic
    checkoutInput.addEventListener('change', (e) => {
        state.checkout = e.target.value;
        const dateParts = state.checkout.split('-');
        const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        updateDisplay('checkout', dateObj);
        checkContinueButton();
    });

    // Pax Dropdown Logic
    window.togglePaxDropdown = () => {
        const dd = document.getElementById('pax-dropdown');
        const icon = document.getElementById('pax-icon');
        dd.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
    };

    window.selectPax = (val) => {
        state.pax = val;
        const display = document.getElementById('pax-display');
        const container = document.getElementById('pax-display-container');
        const icon = document.getElementById('pax-icon');

        display.innerText = val;
        display.classList.add('text-stone-800', 'font-bold');
        container.classList.add('border-amber-500');
        icon.classList.replace('text-stone-400', 'text-amber-500');

        window.togglePaxDropdown();
        checkContinueButton();
    };

    // Close Dropdown Outside Click
    document.addEventListener('click', (e) => {
        const container = document.getElementById('pax-container');
        if (container && !container.contains(e.target)) {
            document.getElementById('pax-dropdown').classList.add('hidden');
            document.getElementById('pax-icon').classList.remove('rotate-180');
        }
    });

    // Helper Functions
    function updateDisplay(type, dateObj) {
        const options = { month: 'long', day: 'numeric' };
        const displayDate = dateObj.toLocaleDateString('es-ES', options);
        const displayEl = document.getElementById(`${type}-display`);
        const containerEl = document.getElementById(`${type}-display-container`);
        const iconEl = document.getElementById(`${type}-icon`);

        displayEl.innerText = displayDate;
        displayEl.classList.add('text-stone-800', 'font-bold');
        displayEl.classList.remove('text-stone-500');
        containerEl.classList.add('border-amber-500');
        iconEl.classList.replace(type === 'checkin' ? 'text-stone-400' : 'text-stone-300', 'text-amber-500');
    }

    function resetDisplay(type) {
        document.getElementById(`${type}-display`).innerText = "Seleccionar";
        document.getElementById(`${type}-display`).classList.remove('text-stone-800', 'font-bold');
        document.getElementById(`${type}-display-container`).classList.remove('border-amber-500');
        document.getElementById(`${type}-icon`).classList.replace('text-amber-500', 'text-stone-300');
    }

    function checkContinueButton() {
        const btn = document.getElementById('continue-btn-container');
        if (state.checkin && state.checkout && state.pax) {
            btn.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
            btn.classList.add('opacity-100', 'translate-y-0');
        }
    }

    window.goToForm = () => {
        const section = document.getElementById('form-section');
        section.classList.remove('hidden');
        updateSummary();
        setTimeout(() => section.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    window.updateSummary = () => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const inParts = state.checkin.split('-');
        const outParts = state.checkout.split('-');
        const dateIn = new Date(inParts[0], inParts[1] - 1, inParts[2]);
        const dateOut = new Date(outParts[0], outParts[1] - 1, outParts[2]);

        document.getElementById('summary-checkin').innerText = dateIn.toLocaleDateString('es-ES', options);
        document.getElementById('summary-checkout').innerText = dateOut.toLocaleDateString('es-ES', options);

        const diffTime = Math.abs(dateOut - dateIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById('summary-nights').innerText = `${diffDays} ${diffDays === 1 ? 'Noche' : 'Noches'}`;
    };

    window.editSelection = () => document.getElementById('reservas').scrollIntoView({ behavior: 'smooth' });

    window.toggleTerms = () => {
        state.terms = !state.terms;
        const box = document.getElementById('terms-check-box');
        const icon = document.getElementById('terms-check-icon');
        const btn = document.getElementById('submit-btn');

        if (state.terms) {
            box.classList.replace('bg-transparent', 'bg-stone-900');
            box.classList.replace('border-stone-400', 'border-stone-900');
            icon.classList.remove('hidden');
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            btn.classList.add('hover:bg-amber-500', 'shadow-xl');
        } else {
            box.classList.replace('bg-stone-900', 'bg-transparent');
            box.classList.replace('border-stone-900', 'border-stone-400');
            icon.classList.add('hidden');
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            btn.classList.remove('hover:bg-amber-500', 'shadow-xl');
        }
    };

    // Global access for the submit function (since it's called inline)
    window.submitBooking = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = 'Enviando...';
        btn.disabled = true;

        // Capture data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            notes: document.getElementById('notes-input').value
        };

        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxZa_qOH1sg63ymKgn80RUQGjX3-UyXf3YYq1R6tF8KFcOovsa8mzyNszmHVtC0LrnQA/exec';

        // Google Sheets Logic
        try {
            if (APPS_SCRIPT_URL.includes('AKfycbzx')) { // Simple check to run only if configured
                await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: formData.firstName,
                        apellido: formData.lastName,
                        email: formData.email,
                        telefono: formData.phone,
                        llegada: state.checkin,
                        salida: state.checkout,
                        huespedes: state.pax,
                        notas: formData.notes
                    })
                });
            }
        } catch (error) { console.error('Silent Error:', error); }

        // WhatsApp Redirect
        const message = `¡Hola! 👋 Quisiera reservar la Luxury House.
        
📅 *Fechas:* ${state.checkin} al ${state.checkout}
👥 *Huéspedes:* ${state.pax}

👤 *Mis Datos:*
Nombre: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Celular: ${formData.phone}

📝 *Notas:* ${formData.notes || 'Ninguna'}

Quedo atento a disponibilidad. ¡Gracias!`;

        window.open(`https://wa.me/573246874533?text=${encodeURIComponent(message)}`, '_blank');

        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    };
}

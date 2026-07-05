// ============================================================
// Luxury House — CMS Content Engine + UI Logic
// ============================================================

// Runtime CMS configuration (used by the booking system)
let cmsConfig = {
    whatsapp_numero: '573246874533',
    apps_script_url: 'https://script.google.com/macros/s/AKfycbzxZa_qOH1sg63ymKgn80RUQGjX3-UyXf3YYq1R6tF8KFcOovsa8mzyNszmHVtC0LrnQA/exec',
    capacidad_maxima: 20
};

// ============================================================
// Main Entry Point
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {

    // 1. Fetch and inject CMS content
    try {
        const response = await fetch('./content.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const cms = await response.json();
        injectCMSContent(cms);
    } catch (error) {
        console.error('Error cargando contenido CMS:', error);
    }

    // 2. Initialize Lucide Icons (AFTER CMS injection for dynamically generated data-lucide attributes)
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 3. Footer dynamic year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 4. Tour 360° overlay click-to-dismiss
    const tourOverlay = document.getElementById('tour-overlay');
    if (tourOverlay) {
        tourOverlay.addEventListener('click', function () {
            this.classList.add('fade-out');
        }, { passive: true });
    }

    // 5. Scroll-responsive navbar
    initScrollNav();

    // 6. Mobile menu toggle
    initMobileMenu();

    // 7. Booking system
    initBookingSystem();
});

// ============================================================
// CMS Content Injection (Master Dispatcher)
// ============================================================
function injectCMSContent(cms) {
    if (cms.seo) injectSEO(cms.seo);
    if (cms.navegacion) injectNavigation(cms.navegacion);
    if (cms.hero) injectHero(cms.hero);
    if (cms.barra_confianza) injectTrustBar(cms.barra_confianza);
    if (cms.tour_virtual) injectTourVirtual(cms.tour_virtual);
    if (cms.experiencia) injectExperiencia(cms.experiencia);
    if (cms.comodidades) injectComodidades(cms.comodidades);
    if (cms.testimonios) injectTestimonios(cms.testimonios);
    if (cms.faq) injectFAQ(cms.faq);
    if (cms.reservas) injectReservas(cms.reservas);
    if (cms.footer) injectFooter(cms.footer);
}

// --- SEO Meta Tags ---
function injectSEO(seo) {
    document.title = seo.titulo_pagina;

    const setMeta = (selector, value) => {
        const el = document.querySelector(selector);
        if (el) el.setAttribute('content', value);
    };

    setMeta('meta[name="description"]', seo.meta_descripcion);
    setMeta('meta[property="og:title"]', seo.og_titulo);
    setMeta('meta[property="og:description"]', seo.og_descripcion);
    setMeta('meta[property="og:image"]', seo.og_imagen);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = seo.url_canonica;
}

// --- Navigation ---
function injectNavigation(nav) {
    const logo = document.getElementById('nav-logo');
    if (logo) logo.textContent = nav.logo;

    // Desktop links
    const desktopLinks = document.querySelectorAll('#nav-links > a');
    nav.enlaces.forEach((enlace, i) => {
        if (desktopLinks[i]) {
            desktopLinks[i].textContent = enlace.texto;
            desktopLinks[i].href = enlace.ancla;
        }
    });
    const deskReserve = desktopLinks[nav.enlaces.length];
    if (deskReserve) {
        deskReserve.textContent = nav.boton_reservar.texto;
        deskReserve.href = nav.boton_reservar.ancla;
    }

    // Mobile links
    const mobileLinks = document.querySelectorAll('#mobile-menu > a');
    nav.enlaces.forEach((enlace, i) => {
        if (mobileLinks[i]) {
            mobileLinks[i].textContent = enlace.texto;
            mobileLinks[i].href = enlace.ancla;
        }
    });
    const mobReserve = mobileLinks[nav.enlaces.length];
    if (mobReserve) {
        mobReserve.textContent = nav.boton_reservar.texto;
        mobReserve.href = nav.boton_reservar.ancla;
    }
}

// --- Hero Section ---
function injectHero(hero) {
    const el = (id) => document.getElementById(id);

    if (el('hero-etiqueta')) el('hero-etiqueta').textContent = hero.etiqueta;
    if (el('hero-titulo')) {
        el('hero-titulo').innerHTML = `${hero.titulo_parte1} <br/> <span class="text-amber-400 italic font-light">${hero.titulo_parte2}</span>`;
    }
    if (el('hero-descripcion')) el('hero-descripcion').textContent = hero.descripcion;
    if (el('hero-bg')) el('hero-bg').src = hero.imagen_fondo;

    const btn1 = el('hero-btn-1');
    if (btn1) {
        btn1.innerHTML = `<i data-lucide="eye" width="18"></i> ${hero.boton_primario.texto}`;
        btn1.href = hero.boton_primario.ancla;
    }

    const btn2 = el('hero-btn-2');
    if (btn2) {
        btn2.textContent = hero.boton_secundario.texto;
        btn2.href = hero.boton_secundario.ancla;
    }
}

// --- Trust Bar ---
function injectTrustBar(barra) {
    const section = document.getElementById('trust_bar');
    if (!section) return;
    const grid = section.querySelector('.grid');
    if (!grid) return;

    grid.innerHTML = barra.items.map((item, i) => {
        const fillClass = item.icono === 'star' ? 'fill-amber-500' : '';
        const delay = i > 0 ? ` style="animation-delay: ${i}s;"` : '';
        return `
            <div class="flex flex-col items-center justify-center text-center px-2 animate-pulse-slow"${delay}>
                <i data-lucide="${item.icono}" class="text-amber-500 mb-2 w-8 h-8 ${fillClass} drop-shadow-sm"></i>
                <span class="font-serif text-stone-800 font-bold text-2xl md:text-3xl leading-none mb-1">${item.valor}</span>
                <span class="text-[10px] md:text-xs uppercase tracking-widest text-stone-500 font-bold">${item.etiqueta}</span>
            </div>`;
    }).join('');
}

// --- Tour Virtual ---
function injectTourVirtual(tour) {
    const section = document.getElementById('tour-virtual');
    if (!section) return;

    // Text elements (queried within section context)
    const subtitle = section.querySelector('span.text-amber-600');
    if (subtitle) subtitle.textContent = tour.subtitulo;

    const title = section.querySelector('h2');
    if (title) title.innerHTML = `${tour.titulo_parte1} <br />${tour.titulo_parte2}`;

    const desc = section.querySelector('p.text-stone-600');
    if (desc) desc.textContent = tour.descripcion;

    const interactiveLabel = section.querySelector('span.font-serif.italic');
    if (interactiveLabel) interactiveLabel.textContent = tour.etiqueta_interactiva;

    // Overlay 360° badge
    const overlay = document.getElementById('tour-overlay');
    if (overlay) {
        const textCenter = overlay.querySelector('.text-center');
        if (textCenter) {
            const spans = textCenter.querySelectorAll('span');
            if (spans[0]) spans[0].textContent = tour.tour_360.texto_overlay;
            if (spans[1]) spans[1].textContent = tour.tour_360.texto_cta_overlay;
        }
    }

    // Iframe source (protected via ID)
    const iframe = document.getElementById('tour-iframe');
    if (iframe) iframe.src = tour.tour_360.url_iframe;
}

// --- Experiencia ---
function injectExperiencia(exp) {
    const section = document.getElementById('experiencia');
    if (!section) return;

    const h3 = section.querySelector('h3');
    if (h3) h3.textContent = exp.subtitulo;

    const h2 = section.querySelector('h2');
    if (h2) h2.innerHTML = `${exp.titulo_parte1} <br />${exp.titulo_parte2}`;

    const paragraphs = section.querySelectorAll('p.font-body');
    if (paragraphs[0]) paragraphs[0].textContent = exp.parrafo_1;
    if (paragraphs[1]) paragraphs[1].textContent = exp.parrafo_2;

    // Images (src + alt)
    const images = section.querySelectorAll('img');
    exp.imagenes.forEach((img, i) => {
        if (images[i]) {
            images[i].src = img.src;
            images[i].alt = img.alt;
        }
    });

    // Instagram link (protected via ID — separates visible text from href)
    const igLink = document.getElementById('exp-instagram');
    if (igLink) {
        igLink.href = exp.instagram.url;
        igLink.innerHTML = `${exp.instagram.texto} <i data-lucide="arrow-right" class="ml-2" width="20"></i>`;
    }
}

// --- Comodidades (dynamically generated from array) ---
function injectComodidades(comodidades) {
    const section = document.getElementById('comodidades');
    if (!section) return;

    const titulo = section.querySelector('h2');
    if (titulo) titulo.textContent = comodidades.titulo;

    const desc = section.querySelector('.text-center p');
    if (desc) desc.textContent = comodidades.descripcion;

    const grid = document.getElementById('comodidades-grid');
    if (!grid) return;

    grid.innerHTML = comodidades.items.map(item => `
        <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-b-4 border-transparent hover:border-amber-400 group">
            <div class="text-stone-400 group-hover:text-amber-500 transition-colors mb-6">
                <i data-lucide="${item.icono}" width="32" height="32"></i>
            </div>
            <h4 class="font-serif text-xl font-bold text-stone-800 mb-3">${item.titulo}</h4>
            <p class="text-stone-500 text-sm leading-relaxed">${item.descripcion}</p>
        </div>`).join('');
}

// --- Testimonios (dynamically generated from array) ---
function injectTestimonios(testimonios) {
    const section = document.getElementById('testimonios');
    if (!section) return;

    const titulo = section.querySelector('h2');
    if (titulo) titulo.innerHTML = testimonios.titulo;

    const subtitulo = section.querySelector('.text-center p');
    if (subtitulo) subtitulo.textContent = testimonios.subtitulo;

    const grid = document.getElementById('testimonios-grid');
    if (!grid) return;

    grid.innerHTML = testimonios.items.map(item => {
        const stars = Array(item.estrellas).fill(
            '<i data-lucide="star" class="w-4 h-4 text-amber-400 fill-current"></i>'
        ).join('');

        return `
            <div class="bg-stone-50 p-8 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                <div class="flex gap-1 mb-4">${stars}</div>
                <p class="font-body text-stone-600 text-lg leading-relaxed mb-6 italic">${item.texto}</p>
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-stone-200 rounded-full overflow-hidden border-2 border-amber-400">
                        <img src="${item.avatar}" loading="lazy" width="150" height="150" alt="Foto de ${item.nombre}" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <p class="font-bold text-stone-900 text-sm">${item.nombre}</p>
                        <p class="text-stone-500 text-xs">${item.rol}</p>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// --- FAQ (dynamically generated from array) ---
function injectFAQ(faq) {
    const section = document.getElementById('faq');
    if (!section) return;

    const titulo = section.querySelector('h2');
    if (titulo) titulo.textContent = faq.titulo;

    const contenedor = document.getElementById('faq-contenedor');
    if (!contenedor) return;

    contenedor.innerHTML = faq.items.map(item => `
        <details class="group bg-white rounded-lg border border-stone-200 p-4 cursor-pointer transition-all duration-300 hover:shadow-md open:border-amber-400">
            <summary class="font-bold text-stone-800 list-none flex justify-between items-center">
                ${item.pregunta}
                <i data-lucide="chevron-down" class="w-5 h-5 text-amber-500 group-open:rotate-180 transition-transform"></i>
            </summary>
            <p class="mt-3 text-stone-600 leading-relaxed text-sm">${item.respuesta}</p>
        </details>`).join('');
}

// --- Reservas ---
function injectReservas(reservas) {
    const section = document.getElementById('reservas');
    if (!section) return;

    const titulo = section.querySelector('h2');
    if (titulo) titulo.textContent = reservas.titulo;

    const alerta = section.querySelector('.animate-pulse');
    if (alerta) alerta.textContent = reservas.alerta_demanda;

    // Benefits title
    const benefTitulo = section.querySelector('h3.font-serif');
    if (benefTitulo) benefTitulo.textContent = reservas.beneficios.titulo;

    // Benefits list (dynamically generated)
    const benefLista = document.getElementById('reservas-beneficios');
    if (benefLista) {
        benefLista.innerHTML = reservas.beneficios.items.map(item => `
            <li class="flex items-start gap-4">
                <i data-lucide="${item.icono}" class="text-amber-500 w-5 h-5 shrink-0 mt-0.5"></i>
                <div>
                    <strong class="block text-sm text-stone-900 font-bold">${item.titulo}</strong>
                    <span class="text-xs text-stone-500 font-light">${item.descripcion}</span>
                </div>
            </li>`).join('');
    }

    // WhatsApp asesor (protected via ID — separates visible text from href)
    const waAsesor = document.getElementById('wa-asesor');
    if (waAsesor) {
        waAsesor.href = reservas.whatsapp_asesor.url;
        const waSubtexto = waAsesor.querySelector('p');
        if (waSubtexto) waSubtexto.textContent = reservas.whatsapp_asesor.subtexto;
        const waTexto = waAsesor.querySelector('span');
        if (waTexto) waTexto.innerHTML = `<i data-lucide="message-circle" width="18"></i> ${reservas.whatsapp_asesor.texto}`;
    }

    // Store config for booking system runtime
    cmsConfig.whatsapp_numero = reservas.whatsapp_reserva.numero;
    cmsConfig.apps_script_url = reservas.google_apps_script_url;
    cmsConfig.capacidad_maxima = reservas.capacidad_maxima_huespedes;
}

// --- Footer ---
function injectFooter(footerData) {
    const footer = document.getElementById('footer');
    if (!footer) return;

    const nombre = footer.querySelector('h4');
    if (nombre) nombre.textContent = footerData.nombre;

    const ubicacion = nombre ? nombre.nextElementSibling : null;
    if (ubicacion) ubicacion.textContent = footerData.ubicacion;

    // Navigation links (regenerated from array)
    const linksContainer = footer.querySelector('.space-x-6');
    if (linksContainer) {
        linksContainer.innerHTML = footerData.enlaces.map(enlace =>
            `<a href="${enlace.ancla}" class="hover:text-white transition-colors">${enlace.texto}</a>`
        ).join('');
    }

    // Copyright (preserves dynamic year span)
    const yearSpan = document.getElementById('year');
    if (yearSpan && yearSpan.parentElement) {
        yearSpan.parentElement.innerHTML = `&copy; <span id="year">${new Date().getFullYear()}</span> ${footerData.copyright}`;
    }
}

// ============================================================
// Scroll-responsive Navbar (RAF throttled)
// ============================================================
function initScrollNav() {
    const navbar = document.getElementById('navbar');
    const navLogo = document.getElementById('nav-logo');
    const navLinksContainer = document.getElementById('nav-links');
    const menuBtn = document.getElementById('menu-btn');

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
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
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ============================================================
// Mobile Menu
// ============================================================
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
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
}

// ============================================================
// Booking System
// ============================================================
function initBookingSystem() {
    let state = { checkin: '', checkout: '', pax: '', terms: false };

    // Generate Pax Options (uses CMS config for max capacity)
    const paxDropdown = document.getElementById('pax-dropdown');
    const fragment = document.createDocumentFragment();
    const maxPax = cmsConfig.capacidad_maxima || 20;
    for (let i = 1; i <= maxPax; i++) {
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

    // Close Dropdown on Outside Click
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

    // Submit Booking (uses CMS config for WhatsApp number and Apps Script URL)
    window.submitBooking = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = 'Enviando...';
        btn.disabled = true;

        // Capture form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            notes: document.getElementById('notes-input').value
        };

        const APPS_SCRIPT_URL = cmsConfig.apps_script_url;

        // Google Sheets integration
        try {
            if (APPS_SCRIPT_URL && APPS_SCRIPT_URL.includes('AKfycbzx')) {
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

        // WhatsApp redirect (using CMS-configured number)
        const message = `¡Hola! 👋 Quisiera reservar la Luxury House.
        
📅 *Fechas:* ${state.checkin} al ${state.checkout}
👥 *Huéspedes:* ${state.pax}

👤 *Mis Datos:*
Nombre: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Celular: ${formData.phone}

📝 *Notas:* ${formData.notes || 'Ninguna'}

Quedo atento a disponibilidad. ¡Gracias!`;

        window.open(`https://wa.me/${cmsConfig.whatsapp_numero}?text=${encodeURIComponent(message)}`, '_blank');

        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    };
}

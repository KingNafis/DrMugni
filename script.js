// ===== Data (no backend) =====
const DATA = {
  services: [
    { title: "General Consultation", desc: "Comprehensive health check-ups and personalized advice.", icon: "🏥" },
    { title: "Cardiology", desc: "Heart health assessment, ECG, and long-term care plans.", icon: "❤️" },
    { title: "Dermatology", desc: "Skin, hair, and nail conditions diagnosis & treatment.", icon: "🧴" },
    { title: "Pediatrics", desc: "Child health, vaccinations, and nutrition guidance.", icon: "🧒" },
    { title: "Orthopedics", desc: "Bone, joint, and muscle care with rehab guidance.", icon: "🦴" },
    { title: "Telemedicine", desc: "Video consultations and e-prescriptions from home.", icon: "📹" }
  ],
  testimonials: [
    { name: "Ayesha Rahman", text: "Doctor listened carefully and explained everything clearly. Five stars!", rating: 5 },
    { name: "Imran Hossain", text: "Clinic was spotless and staff were very friendly. Highly recommend.", rating: 5 },
    { name: "Sadia Khan", text: "Helped me recover faster than I expected. Great experience.", rating: 4 },
    { name: "Rafi Uddin", text: "Online appointment and quick service—super convenient.", rating: 5 }
  ],
  faqs: [
    { q: "Do you accept walk-in patients?", a: "Yes, but appointments are prioritized. We recommend booking online to reduce wait time." },
    { q: "What should I bring to my first visit?", a: "Bring a valid ID, insurance card (if any), and current medication list." },
    { q: "Do you offer telemedicine?", a: "Yes, video consultations are available for most non-emergency concerns." },
    { q: "Can I reschedule an appointment?", a: "Absolutely. Please reschedule at least 24 hours in advance." }
  ]
};

// ===== Helpers =====
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

function showToast(msg, type='success'){
  const toast = $('#toast');
  $('#toastMsg').textContent = msg;
  toast.className = 'toast show ' + type;
  $('#toastClose').onclick = () => toast.classList.remove('show');
  setTimeout(()=> toast.classList.remove('show'), 3000);
}

function smoothActiveLinks(){
  const sections = ['services','about','credentials','testimonials','faq','contact'];
  const links = sections.map(id => ({ id, el: document.querySelector(`nav a[href="#${id}"]`) })).filter(x=>x.el);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const link = links.find(l => l.id === e.target.id);
      if (!link) return;
      if (e.isIntersecting) {
        links.forEach(l => l.el.classList.remove('active'));
        link.el.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ===== Populate UI from DATA =====
function renderServices(){
  const grid = $('#servicesGrid');
  grid.innerHTML = DATA.services.map(s => `
    <article class="card glass reveal">
      <div class="icon">${s.icon}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </article>
  `).join('');
}

function renderTestimonials(){
  const track = $('#testimonialTrack');
  track.innerHTML = DATA.testimonials.map(t => `
    <figure class="t-card glass">
      <blockquote>“${t.text}”</blockquote>
      <figcaption>
        <div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
        <span class="name">— ${t.name}</span>
      </figcaption>
    </figure>
  `).join('');
}

function renderFAQ(){
  const list = $('#faqList');
  list.innerHTML = DATA.faqs.map((f,i) => `
    <details class="reveal">
      <summary>${f.q}</summary>
      <p>${f.a}</p>
    </details>
  `).join('');
}

// ===== Counters =====
function startCounters(){
  $$('.num').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const isFloat = String(el.dataset.count).includes('.');
    let current = 0;
    const step = target / 80;
    const id = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(id); }
      el.textContent = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
    }, 16);
  });
}

// ===== Reveal on Scroll =====
function setupReveal(){
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => observer.observe(el));
}

// ===== Carousel Auto-scroll + Controls =====
function setupCarousel(){
  const track = $('#testimonialTrack');
  const next = $('#nextTestimonial');
  const prev = $('#prevTestimonial');

  function goNext(){
    track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
      setTimeout(()=> track.scrollTo({ left: 0, behavior: 'smooth' }), 400);
    }
  }
  function goPrev(){
    track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
  }
  let timer = setInterval(goNext, 3500);
  next.onclick = () => { goNext(); reset(); };
  prev.onclick = () => { goPrev(); reset(); };
  function reset(){ clearInterval(timer); timer = setInterval(goNext, 3500); }
}

// ===== Modal + Form Validation + Fake availability =====
function setupAppointment(){
  const modal = $('#appointmentModal');
  const openBtns = ['#openModalBtn', '#heroBookBtn'].map(q => $(q));
  const closeBtn = $('#closeModal');
  const form = $('#appointmentForm');
  const serviceSelect = form.querySelector('select[name="service"]');
  const timeSelect = form.querySelector('select[name="time"]');
  const dateInput = form.querySelector('input[name="date"]');

  // Populate services
  serviceSelect.innerHTML = '<option value="">Select service</option>' + DATA.services.map(s => `<option>${s.title}</option>`).join('');

  function open(){ modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); }
  function close(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }
  openBtns.forEach(b => b.addEventListener('click', open));
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e)=> { if (e.target === modal) close(); });

  // Generate time slots based on date (client-side only)
  function genSlots(dateStr){
    const base = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00'];
    // Randomly disable a couple slots for realism
    const rand = dateStr ? dateStr.split('-').reduce((a,b)=>a+parseInt(b),0) : 0;
    return base.filter((s,i)=> (i + rand) % 5 !== 0);
  }
  dateInput.addEventListener('change', () => {
    const slots = genSlots(dateInput.value);
    timeSelect.innerHTML = '<option value="">Select time</option>' + slots.map(s => `<option>${s}</option>`).join('');
  });

  // Validation + simulated submit
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get('name')?.trim();
    const phone = fd.get('phone')?.trim();
    const service = fd.get('service');
    const date = fd.get('date');
    const time = fd.get('time');

    if (!name || !phone || !service || !date || !time){
      showToast('Please fill all required fields.', 'error');
      return;
    }
    // Simulate success
    showToast('Appointment request received. We will contact you shortly.', 'success');
    form.reset();
    timeSelect.innerHTML = '<option value="">Select time</option>';
    close();
  });
}

// ===== Dark Mode Toggle + Persistence =====
function setupTheme(){
  const toggle = $('#darkToggle');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const saved = localStorage.getItem('theme');
  document.documentElement.classList.toggle('light', saved ? saved === 'light' : prefersLight);
  toggle.textContent = document.documentElement.classList.contains('light') ? 'Dark' : 'Light';
  toggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    toggle.textContent = isLight ? 'Dark' : 'Light';
  });
}

// ===== Header effects + Back to Top + Mobile Menu =====
function setupChrome(){
  const header = $('#header');
  const back = $('#backToTop');
  const menuBtn = $('#menuBtn');
  const nav = $('#nav');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    back.classList.toggle('show', window.scrollY > 400);
  });
  back.addEventListener('click', ()=> window.scrollTo({ top: 0, behavior: 'smooth' }));
  menuBtn.addEventListener('click', () => nav.classList.toggle('show'));
  $('#year').textContent = new Date().getFullYear();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  renderServices();
  renderTestimonials();
  renderFAQ();
  setupReveal();
  startCounters();
  setupCarousel();
  setupAppointment();
  setupTheme();
  setupChrome();
  smoothActiveLinks();
});

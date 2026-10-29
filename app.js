const menuButton = document.querySelector('.menu-button');
const mobileNavigation = document.querySelector('#mobile-navigation');
const navLinks = [...document.querySelectorAll('.nav-link')];

function closeMenu() {
  mobileNavigation.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', () => {
  const open = mobileNavigation.hidden;
  mobileNavigation.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
mobileNavigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNavigation.hidden) { closeMenu(); menuButton.focus(); } });
document.addEventListener('click', event => { if (!mobileNavigation.hidden && !mobileNavigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu(); });
window.matchMedia('(min-width: 601px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const slider = document.querySelector('#smile-slider');
slider?.addEventListener('input', () => {
  slider.closest('.comparison').style.setProperty('--reveal', slider.value + '%');
  slider.setAttribute('aria-valuetext', `${slider.value}% after image revealed`);
});

const bookingToggle = document.querySelector('#booking-toggle');
const bookingPanel = document.querySelector('#booking-panel');
const bookingForm = document.querySelector('#booking-form');
const treatment = document.querySelector('#treatment');
document.querySelectorAll('.footer-treatments a').forEach(link => link.addEventListener('click', () => {
  if (!link.hash || !location.pathname.endsWith('services.html')) return;
  const details = document.querySelector(link.hash);
  if (details) details.open = true;
}));
function openBooking(focus = false) {
  if (!bookingPanel || !bookingForm) return;
  bookingPanel.hidden = false;
  bookingToggle?.setAttribute('aria-expanded', 'true');
  if (focus) bookingForm.elements.name.focus({ preventScroll: true });
}
bookingToggle?.addEventListener('click', () => openBooking(true));
document.querySelectorAll('[data-treatment]').forEach(link => link.addEventListener('click', () => {
  if (!treatment) return;
  treatment.value = link.dataset.treatment;
  openBooking();
}));
function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
const dateInput = document.querySelector('#preferred-date');
if (dateInput) dateInput.min = localDate();
dateInput?.addEventListener('input', () => dateInput.setCustomValidity(''));
let requestDraft = '';
bookingForm?.addEventListener('submit', event => {
  event.preventDefault();
  dateInput.min = localDate();
  const data = new FormData(bookingForm);
  if (String(data.get('date')) < localDate()) { dateInput.setCustomValidity('Please choose today or a future date.'); dateInput.reportValidity(); return; }
  if (!String(data.get('name')).trim()) { bookingForm.elements.name.setCustomValidity('Please enter your name.'); bookingForm.elements.name.reportValidity(); return; }
  if (!bookingForm.reportValidity()) return;
  const preferred = new Date(String(data.get('date')) + 'T12:00:00').toLocaleDateString(undefined, { day:'numeric', month:'long', year:'numeric' });
  requestDraft = `DENTAL — APPOINTMENT REQUEST DRAFT\n\nName: ${String(data.get('name')).trim()}\nPhone: ${data.get('phone') || 'Not provided'}\nEmail: ${data.get('email')}\nDoctor: ${data.get('doctor') || 'Any available dentist'}\nPreferred time: ${data.get('time') || 'Not specified'}\nTreatment: ${data.get('treatment')}\nPreferred date: ${preferred}\nNotes: ${String(data.get('notes')).trim() || 'None'}\n\nThis request has not been sent. Please share it directly with your clinic to arrange and confirm an appointment.\n`;
  document.querySelector('#request-summary').textContent = `${String(data.get('name')).trim()}, your draft is for ${data.get('treatment')} on ${preferred}.`;
  const result = document.querySelector('#request-result');
  result.hidden = false;
  result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'nearest' });
});
bookingForm?.elements.name.addEventListener('input', () => bookingForm.elements.name.setCustomValidity(''));
bookingForm?.addEventListener('input', () => { document.querySelector('#request-result').hidden = true; requestDraft = ''; });
document.querySelector('#download-request')?.addEventListener('click', () => {
  if (!requestDraft) return;
  const url = URL.createObjectURL(new Blob([requestDraft], { type:'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'dental-appointment-request.txt';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
if (location.hash === '#booking-form') openBooking();
if (treatment) {
  const requested = new URLSearchParams(location.search).get('treatment');
  if ([...treatment.options].some(option => option.value === requested)) treatment.value = requested;
}
if (location.hash && document.querySelector('.services-page')) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target instanceof HTMLDetailsElement) target.open = true;
}

const privacyDialog = document.querySelector('#privacy-dialog');
document.querySelector('#privacy-open').addEventListener('click', () => privacyDialog.showModal());
document.querySelector('#privacy-close').addEventListener('click', () => privacyDialog.close());
privacyDialog.addEventListener('click', event => { if (event.target === privacyDialog) { const rect = privacyDialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) privacyDialog.close(); } });
document.querySelector('#year').textContent = new Date().getFullYear();

// One visible review, with user-controlled and viewport-aware automatic rotation.
const testimonialSection = document.querySelector('#testimonials');
if (testimonialSection) {
  const reviews = [
    'Everything was explained clearly, and I felt comfortable throughout my visit.',
    'Friendly, thoughtful care from the moment I arrived.',
    'A gentle approach that helped my child feel at ease.'
  ];
  const card = testimonialSection.querySelector('.testimonial-card');
  const quote = testimonialSection.querySelector('#testimonial-quote');
  const portrait = testimonialSection.querySelector('.testimonial-portrait');
  const progress = testimonialSection.querySelector('.testimonial-progress');
  const pause = testimonialSection.querySelector('#testimonial-pause');
  const dots = [...testimonialSection.querySelectorAll('[data-review]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let visible = false;
  let timer;
  let entrance;
  function schedule() {
    clearTimeout(timer);
    progress.classList.remove('running');
    if (paused || hovered || focused || !visible || document.hidden) return;
    void progress.offsetWidth;
    progress.classList.add('running');
    timer = setTimeout(() => show(current + 1), 3000);
  }
  function show(index, manual = false) {
    current = (index + reviews.length) % reviews.length;
    quote.textContent = reviews[current];
    portrait.style.backgroundPosition = `${current * 50}% center`;
    card.setAttribute('aria-label', `Review ${current + 1} of ${reviews.length}`);
    dots.forEach((dot,i) => { if (i === current) dot.setAttribute('aria-current','true'); else dot.removeAttribute('aria-current'); });
    entrance?.cancel();
    if (!reducedMotion.matches) entrance = card.animate([{opacity:.45,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:320,easing:'ease-out'});
    if (manual) testimonialSection.querySelector('.testimonial-announcement').textContent = `Sample review ${current + 1} of ${reviews.length}: ${reviews[current]}`;
    schedule();
  }
  function updatePause() {
    pause.setAttribute('aria-label', paused ? 'Resume testimonial slideshow' : 'Pause testimonial slideshow');
    pause.classList.toggle('is-paused', paused);
    schedule();
  }
  testimonialSection.querySelector('#testimonial-prev').addEventListener('click', () => show(current - 1,true));
  testimonialSection.querySelector('#testimonial-next').addEventListener('click', () => show(current + 1,true));
  dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.review),true)));
  pause.addEventListener('click', () => { paused = !paused; updatePause(); });
  testimonialSection.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  testimonialSection.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  testimonialSection.addEventListener('focusin', () => { focused = true; schedule(); });
  testimonialSection.addEventListener('focusout', event => { focused = testimonialSection.contains(event.relatedTarget); schedule(); });
  testimonialSection.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1),true); }
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { paused = true; entrance?.cancel(); updatePause(); } });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); },{threshold:.25}).observe(testimonialSection);
  window.addEventListener('pagehide', () => clearTimeout(timer));
  updatePause();
}

// Progressive enhancement: headings arrive once; content stays visible without JS.
if (document.body.classList.contains('services-page')) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal.unobserve(entry.target);
      if (preference.matches) return;
      const animation = entry.target.animate([
        {opacity:0,transform:'translateY(16px)'},
        {opacity:1,transform:'translateY(0)'}
      ], {duration:550,delay:Number(entry.target.dataset.motionDelay || 0),easing:'cubic-bezier(.16,1,.3,1)'});
      running.add(animation);
      animation.finished.then(() => running.delete(animation), () => running.delete(animation));
    });
  }, {threshold:.12});
  document.querySelectorAll('.page-intro h1,.page-intro p,.work-heading,.services-hero h1,.services-hero .section-label,.services-hero>div>p:last-child').forEach((element,index) => {
    element.dataset.motionDelay = Math.min(index * 50,100);
    reveal.observe(element);
  });
  preference.addEventListener('change', () => {
    if (preference.matches) running.forEach(animation => animation.cancel());
  });
  window.addEventListener('pagehide', () => { reveal.disconnect(); running.forEach(animation => animation.cancel()); });
}

// Independent before/after comparisons on About, including keyboard range control.
document.querySelectorAll('.about-comparison input').forEach(input => {
  input.addEventListener('input', () => {
    input.closest('.comparison').style.setProperty('--reveal', input.value + '%');
    input.setAttribute('aria-valuetext', `${input.value}% before image revealed`);
  });
});
const doctorSelect = document.querySelector('[name="doctor"]');
if (doctorSelect) {
  const requestedDoctor = new URLSearchParams(location.search).get('doctor');
  if ([...doctorSelect.options].some(option => option.value === requestedDoctor)) doctorSelect.value = requestedDoctor;
}

// On Contact, bring the existing form into view without resetting entered details.
if (bookingForm) document.querySelector('.floating-booking')?.addEventListener('click', event => {
  event.preventDefault();
  bookingForm.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
  bookingForm.elements.name.focus({preventScroll:true});
});

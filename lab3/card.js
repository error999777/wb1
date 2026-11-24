const set = document.querySelector('.set');
const motionAllowed = matchMedia('(prefers-reduced-motion: no-preference)');
let frame = 0;
let touchPointer = null;

function resetPortrait() {
  cancelAnimationFrame(frame);
  set.style.removeProperty('--x');
  set.style.removeProperty('--y');
}

function tiltPortrait(event) {
  const bounds = set.getBoundingClientRect();
  const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
  const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));

  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    set.style.setProperty('--x', x);
    set.style.setProperty('--y', y);
  });
}

set.addEventListener('pointermove', (event) => {
  if (!motionAllowed.matches) return;
  if (event.pointerType === 'touch' && event.pointerId !== touchPointer) return;
  tiltPortrait(event);
});

set.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'touch' || !event.isPrimary || !motionAllowed.matches) return;
  touchPointer = event.pointerId;
  set.setPointerCapture(event.pointerId);
  tiltPortrait(event);
});

function endTouch(event) {
  if (event.pointerId !== touchPointer) return;
  touchPointer = null;
  resetPortrait();
}

set.addEventListener('pointerleave', (event) => {
  if (event.pointerType !== 'touch') resetPortrait();
});
set.addEventListener('pointerup', endTouch);
set.addEventListener('pointercancel', endTouch);
set.addEventListener('lostpointercapture', endTouch);
motionAllowed.addEventListener('change', resetPortrait);

const orbit = document.querySelector('.orbit');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio < 0.5) return;
    orbit.classList.add('spinning');
    observer.disconnect();
  }, { threshold: 0.5 });
  observer.observe(orbit);
}

const invoice = document.querySelector('.invoice');
const quantity = invoice.elements.quantity;
const price = invoice.elements.price;
const total = invoice.querySelector('output');
const fields = [quantity, price].map((input) => ({
  input,
  hint: document.getElementById(`${input.id}-error`),
}));
const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function updateTotal() {
  for (const { input, hint } of fields) {
    hint.hidden = input.validity.valid;
    if (hint.hidden) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    } else {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', hint.id);
    }
  }

  if (!quantity.validity.valid || !price.validity.valid) {
    total.value = 'Нет суммы';
    return;
  }

  const kopecks = Math.round(price.valueAsNumber * 100);
  total.value = rubles.format(quantity.valueAsNumber * kopecks / 100);
}

invoice.addEventListener('input', updateTotal);
invoice.addEventListener('submit', (event) => event.preventDefault());
updateTotal();

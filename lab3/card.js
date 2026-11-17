const set = document.querySelector('.set');
const motionAllowed = matchMedia('(prefers-reduced-motion: no-preference)');
let frame = 0;

function resetPortrait() {
  cancelAnimationFrame(frame);
  set.style.removeProperty('--x');
  set.style.removeProperty('--y');
}

set.addEventListener('pointermove', (event) => {
  if (!motionAllowed.matches || event.pointerType === 'touch') return;
  const bounds = set.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;

  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    set.style.setProperty('--x', x);
    set.style.setProperty('--y', y);
  });
});

set.addEventListener('pointerleave', resetPortrait);
set.addEventListener('pointercancel', resetPortrait);
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
const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function updateTotal() {
  if (!quantity.validity.valid || !price.validity.valid) {
    total.value = 'Проверь поля';
    return;
  }

  const kopecks = Math.round(price.valueAsNumber * 100);
  total.value = rubles.format(quantity.valueAsNumber * kopecks / 100);
}

invoice.addEventListener('input', updateTotal);
invoice.addEventListener('submit', (event) => event.preventDefault());
updateTotal();

const portrait = document.querySelector('.portrait-model');
const stage = portrait.closest('.stage');
const portraitPoster = stage.querySelector('.portrait-poster');
const portraitControls = stage.querySelector('.portrait-controls');
const portraitReset = stage.querySelector('.portrait-reset');
const frontOrbit = portrait.getAttribute('camera-orbit');

function blendPortraitViews() {
  const { theta } = portrait.getCameraOrbit();
  const angle = Math.abs(Math.atan2(Math.sin(theta), Math.cos(theta))) * 180 / Math.PI;
  const turn = Math.max(0, Math.min(1, (angle - 1) / 6));
  stage.style.setProperty('--portrait-turn', turn);
}

function showPortraitModel(ready) {
  stage.classList.toggle('model-ready', ready);
  portraitControls.hidden = !ready;
  portraitPoster.setAttribute('aria-hidden', String(ready));
  if (ready) blendPortraitViews();
}

portrait.addEventListener('load', () => showPortraitModel(true));
portrait.addEventListener('error', () => showPortraitModel(false));
portrait.addEventListener('camera-change', blendPortraitViews);
portraitReset.addEventListener('click', async () => {
  // Dragging changes the live camera, so sync it before assigning the starting orbit again.
  portrait.cameraOrbit = portrait.getCameraOrbit().toString();
  await portrait.updateComplete;
  portrait.cameraOrbit = frontOrbit;
  portrait.jumpCameraToGoal();
});
if (portrait.loaded) showPortraitModel(true);

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

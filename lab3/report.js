const filter = document.querySelector('.filter');
const category = filter.querySelector('select');
const rows = document.querySelectorAll('.report tbody tr');
const total = document.querySelector('.reporttotal strong');
const count = document.querySelector('.report-count');
const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function updateReport() {
  let sum = 0;
  let visible = 0;

  for (const row of rows) {
    const matches = category.value === 'all' || category.value === row.dataset.category;
    row.hidden = !matches;
    if (!matches) continue;
    sum += Number(row.dataset.amount);
    visible += 1;
  }

  count.textContent = `Показано ${visible} из ${rows.length}`;
  total.textContent = rubles.format(sum);
}

const url = new URL(window.location.href);
const requestedCategory = url.searchParams.get('category');
if (Array.from(category.options).some((option) => option.value === requestedCategory)) {
  category.value = requestedCategory;
}

filter.hidden = false;
category.addEventListener('change', () => {
  if (category.value === 'all') {
    url.searchParams.delete('category');
  } else {
    url.searchParams.set('category', category.value);
  }
  history.replaceState(history.state, '', url);
  updateReport();
});
updateReport();

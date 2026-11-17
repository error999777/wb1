const filter = document.querySelector('.filter');
const category = filter.querySelector('select');
const rows = document.querySelectorAll('.report tbody tr');
const total = document.querySelector('.reporttotal strong');
const count = document.querySelector('.reporttotal span');
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

  count.textContent = 'Показано: ' + visible + ' из ' + rows.length;
  total.textContent = rubles.format(sum);
}

filter.hidden = false;
category.addEventListener('change', updateReport);
updateReport();

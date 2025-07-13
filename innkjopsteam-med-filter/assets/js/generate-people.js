let peopleData = [];
let currentFilters = {};

async function loadPeople(filter = {}) {
  const res = await fetch('assets/data/people.updated.json');
  peopleData = await res.json();
  const t = window.translations || {};
  const container = document.getElementById('peopleContainer');
  container.innerHTML = '';

  const filtered = peopleData.filter(p => {
    return (!filter.role || p.role === filter.role) &&
           (!filter.department || p.department === filter.department) &&
           (!filter.category || (p.categories && p.categories.includes(filter.category))) &&
           (!filter.manager || p.manager === filter.manager);
  });

 filtered.forEach(p => {
  const wrapper = document.createElement('div');
  wrapper.className = 'person-card-wrapper';
  if (p.slug) wrapper.id = p.slug;

  const card = document.createElement('div');
  card.className = 'person-card';

  let html = '';

  if (p.image) {
    html += `<div class="person-image-wrapper"><img class="person-image" src="assets/images/people/${p.image}" alt="${p.name}" /></div>`;
  }

  let worksWithLinks = (p.worksWith || []).map(name => {
    const match = peopleData.find(person => person.name === name && person.slug);
    return match ? `<a href="#${match.slug}">${name}</a>` : name;
  }).join(', ');

  html += `
    <div class="person-info">
      <h3>${p.name}</h3>
      <p><strong>${t.labels?.role || 'Rolle'}:</strong> ${t.roles?.[p.role] || p.role}</p>
      <p><strong>${t.labels?.category || 'Varegruppe'}:</strong> ${(p.categories || []).map(cat => t.labels?.categories?.[cat] || cat).join(', ')}</p>
      <p><strong>${t.labels?.department || 'Avdeling'}:</strong> ${t.labels?.departments?.[p.department] || p.department}</p>
      <p><strong>${t.labels?.worksWith || 'Samarbeid'}:</strong> ${worksWithLinks}</p>`;

  if (p.email) html += `<p>📧 <a href="mailto:${p.email}">${p.email}</a></p>`;
  if (p.phone) html += `<p>📞 <a href="tel:${p.phone.replace(/\s+/g, '')}">${p.phone}</a></p>`;
  if (p.location) html += `<p>📍 ${p.location}</p>`;
  if (p.company) html += `<p>🏢 ${p.company}</p>`;
  if (p.topSuppliers?.length) html += `<p><strong>Leverandører:</strong> ${p.topSuppliers.join(', ')}</p>`;

  html += `</div>`;

  card.innerHTML = html;
  wrapper.appendChild(card);
  container.appendChild(wrapper);

    renderCategoryFilters();
    updatePersonCount(filtered);
    }); 
  }

function renderCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  const categories = [...new Set(peopleData.flatMap(p => p.categories || []))].sort();
  container.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat;
    btn.setAttribute('data-category', cat);
    btn.onclick = () => applyFilter('category', cat);
    if (currentFilters.category === cat) btn.classList.add('active');
    container.appendChild(btn);
  });
}

function applyFilter(type, value) {
  if (currentFilters[type] === value) {
    delete currentFilters[type];
  } else {
    currentFilters[type] = value;
  }
  loadPeople(currentFilters);
}

function setLanguage(lang) {
  fetch(`assets/js/translations.${lang}.js`)
    .then(res => res.text())
    .then(js => {
      eval(js);
      window.translations = window[`translations_${lang}`];
      loadPeople(currentFilters);
    });
}

window.addEventListener('DOMContentLoaded', () => {
  setLanguage('no');

  // 👉 Rolle-filter
  document.querySelectorAll('.filter-btn[data-role]').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      applyFilter('role', role);

      // Toggle aktiv stil
      document.querySelectorAll('.filter-btn[data-role]').forEach(b => b.classList.remove('active'));
      if (currentFilters.role === role) btn.classList.add('active');
    });
  });

  // 👉 Manager-filter (Team Christian / Team Ola)
  document.querySelectorAll('.filter-btn[data-manager]').forEach(btn => {
    btn.addEventListener('click', () => {
      const manager = btn.getAttribute('data-manager');
      applyFilter('manager', manager);

      // Toggle aktiv stil
      document.querySelectorAll('.filter-btn[data-manager]').forEach(b => b.classList.remove('active'));
      if (currentFilters.manager === manager) btn.classList.add('active');
    });
  });
});
function updatePersonCount(filteredPeople) {
  const countElement = document.getElementById("person-count");
  countElement.textContent = `Antall personer: ${filteredPeople.length}`;
}
function resetFilters() {
  // Nullstill alle filtervalg
  currentFilters = {
    role: null,
    category: null,
    manager: null
  };

  // Fjern aktiv klasse på alle filter-knapper
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));

  // Last inn alle personer og oppdater antall
  loadPeople(currentFilters);
}
document.getElementById("resetFiltersBtn").addEventListener("click", resetFilters);

document.getElementById('exportPdfBtn').addEventListener('click', () => {
  const container = document.getElementById('peopleContainer');
  const opt = {
    margin:       0.5,
    filename:     'innkjopsteam.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(container).save();
});

document.getElementById('exportCsvBtn').addEventListener('click', () => {
  const cards = document.querySelectorAll('.person-card');
  let csv = 'Navn,Rolle,Kategorier,Epost,Telefon\n';

  cards.forEach(card => {
    const navn = card.querySelector('.person-name')?.innerText || '';
    const rolle = card.querySelector('.person-role')?.innerText || '';
    const kategorier = [...card.querySelectorAll('.person-categories span')]
      .map(el => el.innerText).join(';');
    const epost = card.querySelector('.person-email')?.innerText || '';
    const telefon = card.querySelector('.person-phone')?.innerText || '';

    csv += `"${navn}","${rolle}","${kategorier}","${epost}","${telefon}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'innkjopsteam.csv';
  link.click();
});

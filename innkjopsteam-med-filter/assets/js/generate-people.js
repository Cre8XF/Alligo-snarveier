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
    const card = document.createElement('div');
    card.className = 'person-card';
    if (p.slug) card.id = p.slug;

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
    container.appendChild(card);
  });

  renderCategoryFilters();
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

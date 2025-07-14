// JS: Ryddet versjon uten dobbel kode
let peopleData = [];
let currentFilters = {
  roles: [],
  category: null,
  manager: null
};

async function loadPeople() {
  const res = await fetch('assets/data/people.json');
  peopleData = await res.json();
  const t = window.translations || {};
  const container = document.getElementById('peopleContainer');
  container.innerHTML = '';

  const filtered = peopleData.filter(p => {
    const matchRole = currentFilters.roles.length === 0 || currentFilters.roles.includes(p.role);
    const matchManager = !currentFilters.manager || p.manager === currentFilters.manager;
    const matchCategory = !currentFilters.category || (p.categories && p.categories.includes(currentFilters.category));
    return matchRole && matchManager && matchCategory;
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
        <p><strong>${t.labels?.category || 'Varegruppe'}:</strong></p>
        <div class="person-categories">
          ${(p.categories || []).map(cat => `<span>${t.labels?.categories?.[cat] || cat}</span>`).join('')}
        </div>
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
  });

  updatePersonCount(filtered);
}

function updatePersonCount(filteredPeople) {
  const countElement = document.getElementById("person-count");
  countElement.textContent = `Antall personer: ${filteredPeople.length}`;
}

// Toggle filterpanel
const filterBtn = document.getElementById("toggleFilterPanel");
const filterPanel = document.getElementById("filterPanel");
const closeBtn = document.getElementById("closeFilterPanel");

filterBtn?.addEventListener("click", () => filterPanel.classList.toggle("hidden"));
closeBtn?.addEventListener("click", () => filterPanel.classList.add("hidden"));

document.getElementById("resetFiltersBtnPanel")?.addEventListener("click", () => {
  currentFilters = { roles: [], category: null, manager: null };
  document.querySelectorAll(".filter-panel input[type=checkbox], .filter-panel input[type=radio]").forEach(input => input.checked = false);
  loadPeople();
});

// Rolle-filter (checkbox) – koblet til dynamisk opprettede filtre
function setupRoleListeners() {
  document.querySelectorAll(".role-filter").forEach(cb => {
    cb.addEventListener("change", () => {
      const checked = [...document.querySelectorAll(".role-filter:checked")].map(el => el.value);
      currentFilters.roles = checked;
      loadPeople();
    });
  });
}

// Manager-filter (radio)
document.querySelectorAll(".manager-filter").forEach(rb => {
  rb.addEventListener("change", () => {
    currentFilters.manager = rb.value;
    loadPeople();
  });
});

// Generer kategori-filter
function renderCategoryFilters() {
  const container = document.getElementById("filterCategories");
  if (!container) return;

  const t = window.translations || {};
  const categories = [...new Set(peopleData.flatMap(p => p.categories || []))].sort();
  container.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = t.labels?.categories?.[cat] || cat; // ✅ oversatt navn
    btn.onclick = () => {
      currentFilters.category = cat;
      loadPeople();
    };
    container.appendChild(btn);
  });
}



function renderRoleFilters() {
  const container = document.getElementById("filterRoles");
  if (!container) return;

  const roles = [...new Set(peopleData.map(p => p.role))].sort();
  container.innerHTML = '';

  roles.forEach(role => {
    const label = document.createElement("label");
    label.className = "checkbox-label";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "role-filter";
    input.value = role;

    // 👉 Koble til event listener direkte:
    input.addEventListener("change", () => {
      const checked = [...document.querySelectorAll(".role-filter:checked")].map(el => el.value);
      currentFilters.roles = checked;
      loadPeople();
    });

    label.appendChild(input);
    label.append(` ${window.translations?.roles?.[role] || capitalize(role)}`);
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  });
   setupRoleListeners(); // ⚠️ Viktig! Re-aktiver event listeners
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


window.addEventListener("DOMContentLoaded", async () => {
  await loadPeople();
  renderCategoryFilters();
  renderRoleFilters();
});

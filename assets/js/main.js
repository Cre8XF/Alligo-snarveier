const languageSelect = document.getElementById("languageSelect");
const defaultLang = localStorage.getItem("selectedLanguage") || "no";

const languageMap = {
  no: window.translations_no,
  se: window.translations_se,
  en: window.translations_en,
};

let translations = languageMap[defaultLang] || {};

document.addEventListener("DOMContentLoaded", () => {
  setLanguage(defaultLang);
  if (languageSelect) {
    languageSelect.value = defaultLang;
    languageSelect.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });
  }
});

function setLanguage(lang) {
  if (!languageMap[lang]) return;
  translations = languageMap[lang];
  localStorage.setItem("selectedLanguage", lang);
  updateText();
}

function getNestedValue(obj, keyPath) {
  return keyPath.split(".").reduce((acc, key) => acc?.[key], obj);
}

function updateText() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = getNestedValue(translations, key);
    if (translation) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = translation;
      } else {
        el.innerHTML = translation;
      }
    }
  });
}
function toggleMenu() {
  const nav = document.querySelector('.section-nav');
  nav.classList.toggle('open');
}

function closeMenu() {
  const nav = document.querySelector('.section-nav');
  nav.classList.remove('open');
}

// Lukk meny ved klikk på en menylenke (kun på mobil)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section-nav a').forEach(link => {
      link.addEventListener('click', () => {
          if (window.innerWidth <= 600) {
              closeMenu();
          }
      });
  });
});
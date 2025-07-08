document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("language") || "no";
  const select = document.getElementById("languageSelect");
  if (select) {
    select.value = savedLang;
    select.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });
  }
  waitForTranslations(savedLang);
});

function setLanguage(lang) {
  localStorage.setItem("language", lang);
  waitForTranslations(lang);
}

function waitForTranslations(lang, tries = 0) {
  const dictionary = window[`translations_${lang}`];
  if (dictionary) {
    updateText(dictionary);
  } else if (tries < 10) {
    setTimeout(() => waitForTranslations(lang, tries + 1), 100);
  }
}

function updateText(dictionary) {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = dictionary[key];
    if (translation) {
      el.innerHTML = translation;
    }
  });
}

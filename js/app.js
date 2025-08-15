// Menu hamburger toggle
const btnToggle = document.querySelector('.header__toggle');
const navMenu = document.getElementById('nav-menu');

btnToggle.addEventListener('click', () => {
  const expanded = btnToggle.getAttribute('aria-expanded') === 'true' || false;
  btnToggle.setAttribute('aria-expanded', !expanded);
  if (navMenu.hasAttribute('hidden')) {
    navMenu.removeAttribute('hidden');
  } else {
    navMenu.setAttribute('hidden', '');
  }
});

// Tema claro/escuro toggle com persistência no localStorage
const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement = document.documentElement;

function setTheme(theme) {
  if (theme === 'dark') {
    rootElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀️';
  } else {
    rootElement.removeAttribute('data-theme');
    themeToggleBtn.textContent = '🌙';
  }
  localStorage.setItem('theme', theme);
}

// Carregar preferência salva
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = rootElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
});

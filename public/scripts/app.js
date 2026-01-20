// Inicialização do App
document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  initDarkMode();
});

// Função para carregar header/footer
function loadComponents() {
  const headerContainer = document.getElementById('header-container');
  const footerContainer = document.getElementById('footer-container');

  if(headerContainer) {
    fetch('/components/header.html')
      .then(r => r.text())
      .then(html => headerContainer.innerHTML = html);
  }

  if(footerContainer) {
    fetch('/components/footer.html')
      .then(r => r.text())
      .then(html => footerContainer.innerHTML = html);
  }
}

// Dark Mode
function initDarkMode() {
  const toggleThemeBtn = document.getElementById('toggle-theme');
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  if(toggleThemeBtn){
    toggleThemeBtn.addEventListener('click', () => {
      const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
}

function applyTheme(theme) {
  if(theme === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
  localStorage.setItem('theme', theme);
}
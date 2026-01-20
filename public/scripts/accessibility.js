// Skip link foco
document.addEventListener('DOMContentLoaded', () => {
  const skipLink = document.querySelector('.skip-link');
  if(skipLink) {
    skipLink.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('main').focus();
    });
  }
});

// Função de alto contraste (toggle)
function toggleHighContrast() {
  document.body.classList.toggle('high-contrast');
}
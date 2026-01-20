async function loadComponent(selector, path) {
  const container = document.querySelector(selector);
  if (!container) return;

  const res = await fetch(path);
  const html = await res.text();
  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("#header", "/fica/public/components/header.html");
  loadComponent("#footer", "/fica/public/components/footer.html");
});
// Carregar um componente HTML
export function loadComponent(containerId, url){
  const container = document.getElementById(containerId);
  if(container){
    fetch(url)
      .then(r => r.text())
      .then(html => container.innerHTML = html);
  }
}
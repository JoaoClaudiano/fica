export function showConfirmation(options) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    
    modal.innerHTML = `
      <div class="confirmation-content">
        <h3>${options.title || 'Confirmar ação'}</h3>
        <p>${options.message}</p>
        <div class="confirmation-buttons">
          <button class="btn btn-secondary" id="cancel-btn">
            ${options.cancelText || 'Cancelar'}
          </button>
          <button class="btn btn-primary" id="confirm-btn">
            ${options.confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('cancel-btn').onclick = () => {
      document.body.removeChild(modal);
      resolve(false);
    };
    
    document.getElementById('confirm-btn').onclick = () => {
      document.body.removeChild(modal);
      resolve(true);
    };
  });
}
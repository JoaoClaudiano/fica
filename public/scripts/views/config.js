import { configService } from '../services/configService.js';

class ConfigPage {
  constructor() {
    this.currentTab = 'risk';
    this.pendingChanges = new Map();
    this.initialized = false;
    
    this.init();
  }
  
  async init() {
    try {
      // Verificar permissões
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !['admin', 'institutional'].includes(user.role)) {
        window.location.href = '/';
        return;
      }
      
      // Carregar componentes
      await this.loadComponents();
      
      // Inicializar serviço de configuração
      await configService.initialize();
      
      // Configurar tabs
      this.setupTabs();
      
      // Carregar dados da aba atual
      await this.loadTabData(this.currentTab);
      
      // Configurar eventos
      this.setupEvents();
      
      // Esconder loading
      this.hideLoading();
      
      this.initialized = true;
      console.log('✅ Página de configuração inicializada');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar página de configuração:', error);
      this.showError(error.message || 'Erro ao carregar configurações');
    }
  }
  
  async loadComponents() {
    // Carregar header e footer
    const components = ['header', 'footer'];
    
    for (const component of components) {
      try {
        const response = await fetch(`../components/${component}.html`);
        const html = await response.text();
        document.getElementById(component).innerHTML = html;
      } catch (error) {
        console.warn(`⚠️ Não foi possível carregar ${component}:`, error);
      }
    }
  }
  
  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }
  
  async switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Atualizar seções
    document.querySelectorAll('.config-section').forEach(section => {
      section.classList.toggle('active', section.id === `${tabName}-tab`);
    });
    
    // Carregar dados da nova aba
    await this.loadTabData(tabName);
    
    this.currentTab = tabName;
  }
  
  async loadTabData(tabName) {
    switch(tabName) {
      case 'risk':
        await this.loadRiskConfig();
        break;
      case 'notifications':
        await this.loadNotificationConfig();
        break;
      case 'interface':
        await this.loadUIConfig();
        break;
      case 'system':
        await this.loadSystemConfig();
        break;
    }
  }
  
  async loadRiskConfig() {
    try {
      const riskConfig = await configService.getConfig('risk_config');
      const { thresholds, weights } = riskConfig;
      
      // Carregar limites
      this.loadThresholds(thresholds);
      
      // Carregar pesos
      this.loadWeights(weights);
      
      // Atualizar total dos pesos
      this.updateTotalWeight();
      
    } catch (error) {
      console.error('Erro ao carregar configurações de risco:', error);
      throw error;
    }
  }
  
  loadThresholds(thresholds) {
    // Limites do risco baixo
    document.getElementById('low-threshold').value = thresholds.low.max;
    document.getElementById('low-color').value = thresholds.low.color;
    
    // Limites do risco médio
    document.getElementById('medium-min').value = thresholds.medium.min;
    document.getElementById('medium-max').value = thresholds.medium.max;
    document.getElementById('medium-color').value = thresholds.medium.color;
    
    // Limites do risco alto
    document.getElementById('high-min').value = thresholds.high.min;
    document.getElementById('high-max').value = thresholds.high.max;
    document.getElementById('high-color').value = thresholds.high.color;
    
    // Limites do risco crítico
    document.getElementById('critical-threshold').value = thresholds.critical.min;
    document.getElementById('critical-color').value = thresholds.critical.color;
  }
  
  loadWeights(weights) {
    const container = document.getElementById('weights-container');
    container.innerHTML = '';
    
    let total = 0;
    
    Object.entries(weights).forEach(([key, value]) => {
      total += value;
      
      const weightItem = document.createElement('div');
      weightItem.className = 'weight-item';
      weightItem.innerHTML = `
        <span class="weight-label">${this.formatWeightLabel(key)}</span>
        <input type="range" 
               class="weight-slider" 
               data-key="${key}"
               min="0" 
               max="100" 
               value="${value * 100}"
               step="1">
        <span class="weight-value">${value.toFixed(2)}</span>
      `;
      
      container.appendChild(weightItem);
      
      // Adicionar listener para o slider
      const slider = weightItem.querySelector('.weight-slider');
      const valueSpan = weightItem.querySelector('.weight-value');
      
      slider.addEventListener('input', (e) => {
        const newValue = e.target.value / 100;
        valueSpan.textContent = newValue.toFixed(2);
        this.onWeightChange(key, newValue);
      });
    });
    
    // Atualizar total
    document.getElementById('total-weight').textContent = total.toFixed(2);
  }
  
  formatWeightLabel(key) {
    const labels = {
      academic_performance: 'Desempenho Acadêmico',
      attendance: 'Frequência',
      assignment_submission: 'Entrega de Tarefas',
      participation: 'Participação',
      social_interaction: 'Interação Social',
      financial_stress: 'Estresse Financeiro',
      wellbeing_indicators: 'Indicadores de Bem-estar'
    };
    
    return labels[key] || key.replace('_', ' ');
  }
  
  onWeightChange(key, value) {
    // Registrar mudança
    configService.stageChange('risk_config', `weights.${key}`, value);
    
    // Atualizar total
    this.updateTotalWeight();
    
    // Ativar botão de salvar
    this.enableSaveButton();
  }
  
  updateTotalWeight() {
    const sliders = document.querySelectorAll('.weight-slider');
    let total = 0;
    
    sliders.forEach(slider => {
      total += parseFloat(slider.value) / 100;
    });
    
    const totalElement = document.getElementById('total-weight');
    totalElement.textContent = total.toFixed(2);
    
    // Destacar se diferente de 1
    if (Math.abs(total - 1) > 0.01) {
      totalElement.style.color = '#f44336';
      totalElement.style.fontWeight = 'bold';
    } else {
      totalElement.style.color = '#4CAF50';
      totalElement.style.fontWeight = 'normal';
    }
  }
  
  async loadNotificationConfig() {
    try {
      const notificationConfig = await configService.getConfig('notification_config');
      console.log('Notification config loaded:', notificationConfig);
      
      // TODO: Implementar carregamento de templates
      
    } catch (error) {
      console.error('Erro ao carregar configurações de notificação:', error);
      throw error;
    }
  }
  
  async loadUIConfig() {
    // TODO: Implementar
  }
  
  async loadSystemConfig() {
    // TODO: Implementar
  }
  
  setupEvents() {
    // Botão salvar todas as alterações
    document.getElementById('save-all').addEventListener('click', () => {
      this.saveAllChanges();
    });
    
    // Botão recarregar
    document.getElementById('reload-config').addEventListener('click', () => {
      this.reloadConfig();
    });
    
    // Botão exportar
    document.getElementById('export-config').addEventListener('click', () => {
      this.exportConfig();
    });
    
    // Listeners para mudanças nos thresholds
    const thresholdInputs = document.querySelectorAll('.threshold-input, input[type="color"]');
    thresholdInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.onThresholdChange(e.target);
      });
    });
  }
  
  onThresholdChange(input) {
    const id = input.id;
    let path = '';
    let value = input.value;
    
    // Mapear IDs para paths de configuração
    const idMap = {
      'low-threshold': 'thresholds.low.max',
      'low-color': 'thresholds.low.color',
      'medium-min': 'thresholds.medium.min',
      'medium-max': 'thresholds.medium.max',
      'medium-color': 'thresholds.medium.color',
      'high-min': 'thresholds.high.min',
      'high-max': 'thresholds.high.max',
      'high-color': 'thresholds.high.color',
      'critical-threshold': 'thresholds.critical.min',
      'critical-color': 'thresholds.critical.color'
    };
    
    if (idMap[id]) {
      path = idMap[id];
      
      // Converter valores se necessário
      if (input.type === 'number') {
        value = parseInt(value);
      }
      
      // Registrar mudança
      configService.stageChange('risk_config', path, value);
      
      // Ativar botão de salvar
      this.enableSaveButton();
    }
  }
  
  enableSaveButton() {
    const saveButton = document.getElementById('save-all');
    if (configService.hasPendingChanges()) {
      saveButton.disabled = false;
      saveButton.innerHTML = '💾 Salvar alterações';
    } else {
      saveButton.disabled = true;
      saveButton.innerHTML = '💾 Salvar todas as alterações';
    }
  }
  
  async saveAllChanges() {
    try {
      const pendingChanges = configService.getPendingChanges();
      
      if (Object.keys(pendingChanges).length === 0) {
        this.showToast('Nenhuma alteração para salvar', 'info');
        return;
      }
      
      // Validar mudanças antes de salvar
      const validationErrors = this.validateChanges(pendingChanges);
      if (validationErrors.length > 0) {
        this.showError(validationErrors.join('\n'));
        return;
      }
      
      // Mostrar loading
      this.showLoading('Salvando alterações...');
      
      // Salvar mudanças
      const result = await configService.batchUpdate(pendingChanges);
      
      // Mostrar sucesso
      this.hideLoading();
      this.showToast('Alterações salvas com sucesso!', 'success');
      
      // Recarregar dados
      await this.reloadConfig();
      
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      this.hideLoading();
      this.showError(`Erro ao salvar: ${error.message}`);
    }
  }
  
  validateChanges(changes) {
    const errors = [];
    
    // Validar thresholds
    if (changes.risk_config?.thresholds) {
      const thresholdErrors = configService.validateThresholds(
        changes.risk_config.thresholds
      );
      errors.push(...thresholdErrors);
    }
    
    // Validar weights
    if (changes.risk_config?.weights) {
      const weightErrors = configService.validateWeights(
        changes.risk_config.weights
      );
      errors.push(...weightErrors);
    }
    
    return errors;
  }
  
  async reloadConfig() {
    try {
      this.showLoading('Recarregando configurações...');
      
      // Limpar cache e recarregar
      configService.clearPendingChanges();
      await configService.loadAllConfigs();
      
      // Recarregar aba atual
      await this.loadTabData(this.currentTab);
      
      // Desativar botão de salvar
      this.enableSaveButton();
      
      this.hideLoading();
      this.showToast('Configurações recarregadas', 'info');
      
    } catch (error) {
      console.error('Erro ao recarregar configurações:', error);
      this.hideLoading();
      this.showError('Erro ao recarregar configurações');
    }
  }
  
  exportConfig() {
    const configs = configService.cache;
    const dataStr = JSON.stringify(configs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fica-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.showToast('Configurações exportadas com sucesso', 'success');
  }
  
  // Métodos auxiliares de UI
  showLoading(message = 'Carregando...') {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';
    
    if (message) {
      loading.querySelector('p').textContent = message;
    }
  }
  
  hideLoading() {
    const loading = document.getElementById('loading');
    loading.style.display = 'none';
  }
  
  showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
  }
  
  showToast(message, type = 'info') {
    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Estilos inline
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new ConfigPage();
});

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .hidden {
    display: none !important;
  }
`;
document.head.appendChild(style);
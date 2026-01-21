import { safeFetch } from '../utils/api.js';

class ConfigService {
  constructor() {
    this.cache = {};
    this.pendingChanges = {};
    this.isInitialized = false;
  }
  
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Carregar configurações iniciais
      await this.loadAllConfigs();
      this.isInitialized = true;
      
      console.log('✅ ConfigService inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar ConfigService:', error);
      throw error;
    }
  }
  
  async getConfig(configName) {
    // Verificar cache primeiro
    if (this.cache[configName]) {
      return this.cache[configName];
    }
    
    try {
      const config = await safeFetch(`/api/config/${configName}`);
      this.cache[configName] = config;
      return config;
    } catch (error) {
      console.error(`Erro ao carregar configuração ${configName}:`, error);
      throw error;
    }
  }
  
  async loadAllConfigs() {
    try {
      const response = await safeFetch('/api/config/all');
      this.cache = { ...this.cache, ...response.configs };
      return response.configs;
    } catch (error) {
      console.error('Erro ao carregar todas as configurações:', error);
      throw error;
    }
  }
  
  async updateConfig(configName, updates) {
    try {
      const response = await safeFetch(`/api/config/${configName}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      // Atualizar cache
      this.cache[configName] = {
        ...this.cache[configName],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Remover dos pending changes
      delete this.pendingChanges[configName];
      
      return response;
    } catch (error) {
      console.error(`Erro ao atualizar configuração ${configName}:`, error);
      throw error;
    }
  }
  
  async batchUpdate(updates) {
    try {
      const response = await safeFetch('/api/config/batch', {
        method: 'PUT',
        body: JSON.stringify({ updates })
      });
      
      // Atualizar cache
      Object.keys(updates).forEach(configName => {
        this.cache[configName] = {
          ...this.cache[configName],
          ...updates[configName],
          updated_at: new Date().toISOString()
        };
        delete this.pendingChanges[configName];
      });
      
      return response;
    } catch (error) {
      console.error('Erro em batch update:', error);
      throw error;
    }
  }
  
  // Métodos para gerenciar mudanças locais
  stageChange(configName, path, value) {
    if (!this.pendingChanges[configName]) {
      this.pendingChanges[configName] = {};
    }
    
    // Suporte para nested paths (ex: thresholds.low.max)
    const keys = path.split('.');
    let current = this.pendingChanges[configName];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }
  
  getPendingChanges() {
    return this.pendingChanges;
  }
  
  hasPendingChanges() {
    return Object.keys(this.pendingChanges).length > 0;
  }
  
  clearPendingChanges() {
    this.pendingChanges = {};
  }
  
  // Métodos auxiliares específicos
  async getRiskThresholds() {
    const riskConfig = await this.getConfig('risk_config');
    return riskConfig.thresholds;
  }
  
  async getWeights() {
    const riskConfig = await this.getConfig('risk_config');
    return riskConfig.weights;
  }
  
  async getNotificationTemplates() {
    const notificationConfig = await this.getConfig('notification_config');
    return notificationConfig.templates;
  }
  
  async getUIConfig() {
    const uiConfig = await this.getConfig('ui_config');
    return uiConfig;
  }
  
  // Validação
  validateThresholds(thresholds) {
    const errors = [];
    
    if (thresholds.low.max >= thresholds.medium.min) {
      errors.push('Limite do risco baixo deve ser menor que o início do médio');
    }
    
    if (thresholds.medium.max >= thresholds.high.min) {
      errors.push('Limite do risco médio deve ser menor que o início do alto');
    }
    
    if (thresholds.high.max >= thresholds.critical.min) {
      errors.push('Limite do risco alto deve ser menor que o início do crítico');
    }
    
    return errors;
  }
  
  validateWeights(weights) {
    const errors = [];
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    if (Math.abs(total - 1) > 0.01) {
      errors.push(`Soma dos pesos deve ser igual a 1. Atual: ${total.toFixed(2)}`);
    }
    
    Object.entries(weights).forEach(([key, value]) => {
      if (value < 0 || value > 1) {
        errors.push(`Peso de ${key} deve estar entre 0 e 1. Valor: ${value}`);
      }
    });
    
    return errors;
  }
}

// Exportar instância singleton
export const configService = new ConfigService();
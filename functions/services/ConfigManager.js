const admin = require('firebase-admin');
const functions = require('firebase-functions');

class ConfigManager {
  constructor() {
    this.db = admin.firestore();
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  }
  
  async getConfig(configName, useCache = true) {
    const cacheKey = `config_${configName}`;
    
    // Verificar cache
    if (useCache && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const doc = await this.db.collection('configurations').doc(configName).get();
      
      if (!doc.exists) {
        functions.logger.warn(`Configuração ${configName} não encontrada, usando padrão`);
        return this.getDefaultConfig(configName);
      }
      
      const configData = doc.data();
      
      // Atualizar cache
      this.cache.set(cacheKey, configData);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      functions.logger.debug(`Configuração ${configName} carregada`, { configName });
      return configData;
    } catch (error) {
      functions.logger.error(`Erro ao carregar configuração ${configName}:`, error);
      
      // Retornar cache antigo se disponível
      if (this.cache.has(cacheKey)) {
        functions.logger.warn(`Usando cache antigo para ${configName} devido a erro`);
        return this.cache.get(cacheKey);
      }
      
      // Último recurso: usar configuração padrão
      return this.getDefaultConfig(configName);
    }
  }
  
  async updateConfig(configName, updates) {
    try {
      const configRef = this.db.collection('configurations').doc(configName);
      
      await configRef.update({
        ...updates,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: this.getCurrentUserId(),
        version: this.incrementVersion(await this.getCurrentVersion(configName))
      });
      
      // Invalidar cache
      this.invalidateCache(configName);
      
      functions.logger.info(`Configuração ${configName} atualizada`, { updates });
      return { success: true, configName };
    } catch (error) {
      functions.logger.error(`Erro ao atualizar configuração ${configName}:`, error);
      throw new Error(`Falha ao atualizar configuração: ${error.message}`);
    }
  }
  
  async getAllConfigs() {
    try {
      const snapshot = await this.db.collection('configurations').get();
      const configs = {};
      
      snapshot.forEach(doc => {
        configs[doc.id] = doc.data();
      });
      
      return configs;
    } catch (error) {
      functions.logger.error('Erro ao carregar todas as configurações:', error);
      throw error;
    }
  }
  
  async getConfigValue(configName, path, defaultValue = null) {
    const config = await this.getConfig(configName);
    
    // Suporte para paths como 'thresholds.low.max'
    const keys = path.split('.');
    let value = config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
  }
  
  // Métodos auxiliares
  isCacheValid(cacheKey) {
    if (!this.cacheTimestamps.has(cacheKey)) return false;
    
    const timestamp = this.cacheTimestamps.get(cacheKey);
    return Date.now() - timestamp < this.CACHE_TTL;
  }
  
  invalidateCache(configName = null) {
    if (configName) {
      const cacheKey = `config_${configName}`;
      this.cache.delete(cacheKey);
      this.cacheTimestamps.delete(cacheKey);
    } else {
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
  }
  
  async getCurrentVersion(configName) {
    const config = await this.getConfig(configName, false);
    return config?.version || '1.0.0';
  }
  
  incrementVersion(currentVersion) {
    const parts = currentVersion.split('.');
    const minor = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${minor}`;
  }
  
  getCurrentUserId() {
    // Implementar baseado no contexto de autenticação
    return 'system';
  }
  
  getDefaultConfig(configName) {
    const defaults = {
      risk_config: {
        thresholds: {
          low: { max: 30, color: '#4CAF50', icon: '✅' },
          medium: { min: 31, max: 60, color: '#FFC107', icon: '⚠️' },
          high: { min: 61, max: 80, color: '#FF9800', icon: '🔴' },
          critical: { min: 81, color: '#F44336', icon: '🚨' }
        }
      },
      notification_config: {
        templates: {
          risk_alert: {
            subject: 'Alerta de Risco',
            body: 'Novo alerta de risco detectado'
          }
        }
      },
      ui_config: {
        themes: {
          light: {
            primary: '#2196F3',
            background: '#FFFFFF'
          }
        }
      },
      system_config: {
        features: {
          real_time_updates: true
        }
      }
    };
    
    return defaults[configName] || {};
  }
}

// Singleton
let instance = null;
module.exports = () => {
  if (!instance) {
    instance = new ConfigManager();
  }
  return instance;
};
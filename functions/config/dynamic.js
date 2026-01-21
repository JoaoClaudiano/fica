const admin = require('firebase-admin');

class DynamicConfig {
  constructor() {
    this.cache = {};
    this.cacheTime = {};
  }
  
  async getConfig(key, defaultValue = null) {
    // Cache por 5 minutos
    if (this.cache[key] && Date.now() - this.cacheTime[key] < 300000) {
      return this.cache[key];
    }
    
    try {
      const doc = await admin.firestore()
        .collection('config')
        .doc(key)
        .get();
      
      if (doc.exists) {
        this.cache[key] = doc.data();
        this.cacheTime[key] = Date.now();
        return doc.data();
      }
      
      return defaultValue;
    } catch (error) {
      console.error(`Erro ao buscar config ${key}:`, error);
      return defaultValue;
    }
  }
  
  // Métodos específicos para o FICA
  async getRiskThresholds() {
    const config = await this.getConfig('risk_thresholds', {
      low: { max: 30, color: '#4CAF50' },
      medium: { min: 31, max: 60, color: '#FFC107' },
      high: { min: 61, max: 80, color: '#FF9800' },
      critical: { min: 81, color: '#F44336' }
    });
    return config;
  }
  
  async getNotificationTemplates() {
    const config = await this.getConfig('notification_templates', {
      risk_alert: {
        title: "Alerta de Risco Identificado",
        body: "Um estudante foi identificado com risco {level}. Ação recomendada: {action}",
        priority: "high"
      },
      intervention_reminder: {
        title: "Lembrete de Intervenção",
        body: "A intervenção para {student} está pendente há {days} dias",
        priority: "medium"
      }
    });
    return config;
  }
}

module.exports = new DynamicConfig();
const functions = require('firebase-functions');
const ConfigManager = require('./services/ConfigManager')();

// GET - Obter configuração específica
exports.getConfig = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário não autenticado'
      );
    }
    
    // Verificar permissões (apenas admin/institutional)
    const userRole = context.auth.token.role;
    if (!['admin', 'institutional'].includes(userRole)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Acesso negado. Permissão requerida: admin ou institutional'
      );
    }
    
    const { configName } = data;
    
    if (!configName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Nome da configuração é obrigatório'
      );
    }
    
    const config = await ConfigManager.getConfig(configName);
    
    return {
      success: true,
      configName,
      data: config,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Erro em getConfig:', error);
    
    if (error.code) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao obter configuração'
    );
  }
});

// PUT - Atualizar configuração
exports.updateConfig = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário não autenticado'
      );
    }
    
    // Verificar permissões (apenas admin)
    const userRole = context.auth.token.role;
    if (userRole !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Acesso negado. Apenas administradores podem atualizar configurações'
      );
    }
    
    const { configName, updates } = data;
    
    if (!configName || !updates) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Nome da configuração e updates são obrigatórios'
      );
    }
    
    // Validar estrutura básica
    const validConfigs = ['risk_config', 'notification_config', 'ui_config', 'system_config'];
    if (!validConfigs.includes(configName)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Configuração inválida. Opções: ${validConfigs.join(', ')}`
      );
    }
    
    const result = await ConfigManager.updateConfig(configName, updates);
    
    return {
      success: true,
      message: 'Configuração atualizada com sucesso',
      ...result
    };
    
  } catch (error) {
    console.error('Erro em updateConfig:', error);
    
    if (error.code) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao atualizar configuração'
    );
  }
});

// GET - Todas as configurações (para dashboard admin)
exports.getAllConfigs = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário não autenticado'
      );
    }
    
    // Verificar permissões
    const userRole = context.auth.token.role;
    if (!['admin', 'institutional'].includes(userRole)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Acesso negado'
      );
    }
    
    const configs = await ConfigManager.getAllConfigs();
    
    return {
      success: true,
      count: Object.keys(configs).length,
      configs,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Erro em getAllConfigs:', error);
    
    if (error.code) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao obter configurações'
    );
  }
});

// POST - Resetar configuração para padrão
exports.resetConfig = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário não autenticado'
      );
    }
    
    // Verificar permissões (apenas admin)
    if (context.auth.token.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Acesso negado. Apenas administradores podem resetar configurações'
      );
    }
    
    const { configName } = data;
    
    if (!configName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Nome da configuração é obrigatório'
      );
    }
    
    // Carregar valores padrão
    const ConfigManagerInstance = ConfigManager();
    const defaultConfig = ConfigManagerInstance.getDefaultConfig(configName);
    
    // Atualizar com valores padrão
    const result = await ConfigManager.updateConfig(configName, defaultConfig);
    
    return {
      success: true,
      message: 'Configuração resetada para valores padrão',
      configName,
      data: defaultConfig
    };
    
  } catch (error) {
    console.error('Erro em resetConfig:', error);
    
    if (error.code) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao resetar configuração'
    );
  }
});
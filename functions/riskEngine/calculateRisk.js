const dynamicConfig = require('../config/dynamic');
const { validateInput } = require('../utils/validateInput');

exports.calculateRisk = async (req, res) => {
  try {
    // Validar entrada
    const validation = validateInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validation.errors
      });
    }
    
    // Obter configurações dinâmicas
    const thresholds = await dynamicConfig.getRiskThresholds();
    
    // Calcular risco com configuração dinâmica
    const riskScore = calculateRiskWithThresholds(req.body, thresholds);
    
    res.json({
      success: true,
      riskScore,
      level: determineLevel(riskScore, thresholds),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro em calculateRisk:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no cálculo de risco',
      requestId: req.headers['x-request-id']
    });
  }
};
const ConfigManager = require('../services/ConfigManager')();
const { validateInput } = require('../utils/validateInput');

exports.calculateRisk = async (data, context) => {
  try {
    // Validar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated', 
        'Usuário não autenticado'
      );
    }
    
    // Validar entrada
    const validation = validateInput(data, ['studentId', 'indicators']);
    if (!validation.isValid) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Dados inválidos',
        validation.errors
      );
    }
    
    // Carregar configurações dinâmicas
    const riskConfig = await ConfigManager.getConfig('risk_config');
    const { weights, thresholds, calculation } = riskConfig;
    
    // Calcular pontuação baseada nos pesos dinâmicos
    let totalScore = 0;
    let maxPossible = 0;
    
    Object.keys(weights).forEach(indicator => {
      if (data.indicators[indicator] !== undefined) {
        const value = parseFloat(data.indicators[indicator]) || 0;
        const weight = weights[indicator] || 0;
        
        totalScore += value * weight;
        maxPossible += 100 * weight; // Assumindo que cada indicador vai até 100
      }
    });
    
    // Normalizar para 0-100
    const normalizedScore = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;
    
    // Aplicar decaimento temporal se configurado
    const finalScore = applyTimeDecay(
      normalizedScore, 
      data.timestamp, 
      calculation.time_decay_days
    );
    
    // Determinar nível de risco baseado nos thresholds dinâmicos
    const riskLevel = determineRiskLevel(finalScore, thresholds);
    
    // Gerar explicação dinâmica
    const explanation = generateExplanation(
      finalScore, 
      riskLevel, 
      data.indicators,
      weights
    );
    
    // Retornar resultado
    return {
      success: true,
      data: {
        studentId: data.studentId,
        score: Math.round(finalScore * 10) / 10, // Uma casa decimal
        level: riskLevel.level,
        color: riskLevel.color,
        icon: riskLevel.icon,
        explanation: explanation,
        calculatedAt: new Date().toISOString(),
        thresholds: thresholds, // Incluir thresholds usados para transparência
        contributingFactors: getTopContributors(data.indicators, weights)
      }
    };
    
  } catch (error) {
    console.error('Erro em calculateRisk:', error);
    
    if (error.code) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Erro interno no cálculo de risco',
      { originalError: error.message }
    );
  }
};

// Funções auxiliares
function determineRiskLevel(score, thresholds) {
  if (score <= thresholds.low.max) {
    return { 
      level: 'low', 
      ...thresholds.low 
    };
  }
  
  if (score <= thresholds.medium.max) {
    return { 
      level: 'medium', 
      ...thresholds.medium 
    };
  }
  
  if (score <= thresholds.high.max) {
    return { 
      level: 'high', 
      ...thresholds.high 
    };
  }
  
  return { 
    level: 'critical', 
    ...thresholds.critical 
  };
}

function applyTimeDecay(score, dataTimestamp, decayDays) {
  if (!decayDays || !dataTimestamp) return score;
  
  const dataDate = new Date(dataTimestamp);
  const daysOld = (Date.now() - dataDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysOld > decayDays) {
    // Reduzir pontuação baseado na idade dos dados
    const decayFactor = Math.max(0, 1 - (daysOld / (decayDays * 2)));
    return score * decayFactor;
  }
  
  return score;
}

function generateExplanation(score, riskLevel, indicators, weights) {
  const explanations = {
    low: 'O estudante apresenta indicadores dentro da normalidade.',
    medium: 'Alguns indicadores requerem atenção preventiva.',
    high: 'Múltiplos indicadores preocupantes requerem intervenção.',
    critical: 'Situação crítica requer atenção imediata.'
  };
  
  const topIndicator = getTopContributors(indicators, weights, 1)[0];
  
  return {
    general: explanations[riskLevel.level] || 'Risco calculado com base nos indicadores.',
    mainFactor: topIndicator ? `Principal fator: ${topIndicator.name} (${topIndicator.score}%)` : '',
    recommendations: getRecommendations(riskLevel.level, indicators)
  };
}

function getTopContributors(indicators, weights, limit = 3) {
  const contributors = [];
  
  Object.keys(indicators).forEach(key => {
    if (weights[key]) {
      const contribution = indicators[key] * weights[key];
      contributors.push({
        name: key,
        score: Math.round(indicators[key]),
        contribution: Math.round(contribution * 10) / 10
      });
    }
  });
  
  return contributors
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, limit);
}

function getRecommendations(riskLevel, indicators) {
  const recommendations = {
    low: ['Manter acompanhamento regular', 'Incentivar participação'],
    medium: ['Agendar conversa individual', 'Oferecer suporte acadêmico'],
    high: ['Criar plano de intervenção', 'Envolver coordenador', 'Monitorar semanalmente'],
    critical: ['Ação imediata requerida', 'Contatar família', 'Ativação de rede de apoio']
  };
  
  return recommendations[riskLevel] || ['Acompanhamento recomendado'];
}
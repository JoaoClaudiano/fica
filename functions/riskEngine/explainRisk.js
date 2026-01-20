module.exports = function explainRisk({ attendance, grades, wellbeing }) {
  const reasons = [];

  if (attendance < 0.7) reasons.push('frequência baixa');
  if (grades < 0.6) reasons.push('dificuldades acadêmicas');
  if (wellbeing < 0.5) reasons.push('alertas socioemocionais');

  return {
    summary: reasons.length
      ? `Risco associado a ${reasons.join(', ')}.`
      : 'Nenhum fator crítico identificado.',
    factors: reasons
  };
};
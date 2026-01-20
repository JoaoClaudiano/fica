module.exports = function explainRisk({ attendance, grades, wellbeing }) {
  const factors = [];

  if (attendance < 0.7) factors.push("frequência baixa");
  if (grades < 0.6) factors.push("dificuldades acadêmicas");
  if (wellbeing < 0.5) factors.push("alertas socioemocionais");

  return {
    summary: factors.length
      ? `Risco associado a ${factors.join(", ")}.`
      : "Nenhum fator crítico identificado.",
    factors
  };
};
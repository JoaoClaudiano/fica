export function calculateRisk({ frequency, performance, wellbeing }) {
  let score = 0;
  const reasons = [];

  // Frequência (0 a 100)
  if (frequency < 85) {
    score += 40;
    reasons.push("Frequência abaixo de 85%");
  } else if (frequency < 95) {
    score += 20;
    reasons.push("Frequência irregular");
  }

  // Desempenho (0 a 100)
  if (performance < 60) {
    score += 30;
    reasons.push("Desempenho abaixo do esperado");
  } else if (performance < 70) {
    score += 15;
    reasons.push("Oscilação recente de desempenho");
  }

  // Bem-estar (1 a 5)
  if (wellbeing <= 2) {
    score += 30;
    reasons.push("Relato recente de mal-estar");
  } else if (wellbeing === 3) {
    score += 15;
    reasons.push("Bem-estar instável");
  }

  let level = "baixo";
  if (score >= 60) level = "alto";
  else if (score >= 30) level = "moderado";

  return {
    score,
    level,
    reasons
  };
}
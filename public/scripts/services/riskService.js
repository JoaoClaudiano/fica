// Cálculo de risco baseado em frequência, notas e bem-estar
export function calculateRisk(student){
  const {frequency, grades, wellbeing} = student;
  let score = 100;
  score -= (100 - frequency) * 0.4;
  score -= (10 - grades) * 3;
  if(wellbeing === 'baixo') score -= 20;
  else if(wellbeing === 'regular') score -= 10;
  return Math.max(0, Math.min(score, 100)); // de 0 a 100
}
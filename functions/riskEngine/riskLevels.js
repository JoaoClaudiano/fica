module.exports = function riskLevel(score) {
  if (score < 0.3) return 'baixo';
  if (score < 0.6) return 'moderado';
  return 'alto';
};
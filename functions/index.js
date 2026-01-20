const calculateRisk = require('./riskEngine/calculateRisk');
const explainRisk = require('./riskEngine/explainRisk');
const riskLevel = require('./riskEngine/riskLevels');

exports.evaluateStudentRisk = (data) => {
  const score = calculateRisk(data);
  const level = riskLevel(score);
  const explanation = explainRisk(data);

  return {
    score,
    level,
    explanation
  };
};
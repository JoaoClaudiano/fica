const weights = require("../config/weights");

module.exports = function calculateRisk({ attendance, grades, wellbeing }) {
  return Math.min(
    Math.max(
      (1 - attendance) * weights.attendance +
      (1 - grades) * weights.grades +
      (1 - wellbeing) * weights.wellbeing,
      0
    ),
    1
  );
};
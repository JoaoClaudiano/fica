module.exports = function registerIntervention({
  studentId,
  action,
  author
}) {
  return {
    studentId,
    action,
    author,
    date: new Date().toISOString()
  };
};
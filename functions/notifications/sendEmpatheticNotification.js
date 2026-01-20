const templates = require('./templates');

module.exports = function sendEmpatheticNotification(level, studentId) {
  const message = templates[level];

  return {
    to: studentId,
    message,
    sentAt: new Date().toISOString()
  };
};
const templates = require("./templates");

module.exports = function sendEmpatheticNotification(level, studentId) {
  return {
    studentId,
    message: templates[level],
    createdAt: new Date().toISOString(),
    read: false
  };
};
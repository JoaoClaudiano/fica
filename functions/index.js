const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const calculateRisk = require("./riskEngine/calculateRisk");
const explainRisk = require("./riskEngine/explainRisk");
const riskLevel = require("./riskEngine/riskLevels");
const sendEmpatheticNotification = require("./notifications/sendEmpatheticNotification");
const registerIntervention = require("./interventions/registerIntervention");
const impactMetrics = require("./metrics/impactMetrics");
const validateInput = require("./utils/validateInput");

const db = admin.firestore();

/**
 * 🔍 Callable Function
 * Avalia risco de evasão de um aluno
 */
exports.evaluateStudentRisk = functions.https.onCall((data, context) => {
  validateInput(data, ["attendance", "grades", "wellbeing"]);

  const score = calculateRisk(data);
  const level = riskLevel(score);
  const explanation = explainRisk(data);

  return {
    score,
    level,
    explanation
  };
});

/**
 * 🔔 Trigger Firestore
 * Dispara notificação empática quando risco é atualizado
 */
exports.onRiskUpdate = functions.firestore
  .document("students/{studentId}/risk/current")
  .onWrite((change, context) => {
    const after = change.after.data();
    if (!after) return null;

    const notification = sendEmpatheticNotification(
      after.level,
      context.params.studentId
    );

    return db.collection("notifications").add(notification);
  });

/**
 * 🧾 Callable Function
 * Registra intervenção do professor
 */
exports.registerIntervention = functions.https.onCall((data) => {
  validateInput(data, ["studentId", "action", "author"]);

  const record = registerIntervention(data);

  return db.collection("interventions").add(record);
});

/**
 * 📊 Callable Function
 * Calcula métricas de impacto (gestão)
 */
exports.getImpactMetrics = functions.https.onCall(async () => {
  const snapshot = await db.collection("cases").get();
  const cases = snapshot.docs.map(doc => doc.data());

  return impactMetrics(cases);
});
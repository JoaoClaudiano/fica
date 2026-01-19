import { calculateRisk } from "./risk.js";

const params = new URLSearchParams(window.location.search);
const studentId = params.get("id");

// Mock de dados
const students = {
  maria: {
    name: "Maria Silva",
    class: "8º ano · Turma B",
    frequency: 82,
    performance: 58,
    wellbeing: 2
  },
  joao: {
    name: "João Pereira",
    class: "9º ano · Turma A",
    frequency: 90,
    performance: 68,
    wellbeing: 3
  }
};

if (students[studentId]) {
  const student = students[studentId];

  document.querySelector(".student-header h2").innerText = student.name;
  document.querySelector(".student-header p").innerText = student.class;

  const risk = calculateRisk(student);

  // Atualizar indicador visual
  const indicator = document.querySelector(".risk-indicator");
  indicator.className = `risk-indicator ${risk.level}`;
  indicator.querySelector("strong").innerText = `Risco ${risk.level}`;
  indicator.querySelector("span").innerText = `Score: ${risk.score}`;

  // Explicação
  const list = document.querySelector(".risk-explanation");
  list.innerHTML = "";

  risk.reasons.forEach(reason => {
    const li = document.createElement("li");
    li.textContent = "• " + reason;
    list.appendChild(li);
  });
}
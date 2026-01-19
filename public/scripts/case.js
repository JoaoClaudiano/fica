const params = new URLSearchParams(window.location.search);
const studentId = params.get("id");

// Mock de dados
const students = {
  maria: {
    name: "Maria Silva",
    class: "8º ano · Turma B",
    risk: "alto",
    reasons: [
      "4 faltas nas últimas 2 semanas",
      "Bem-estar negativo registrado",
      "Queda recente de desempenho"
    ]
  },
  joao: {
    name: "João Pereira",
    class: "9º ano · Turma A",
    risk: "moderado",
    reasons: [
      "Oscilação de notas",
      "Participação reduzida em aula"
    ]
  }
};

// Injetar dados
if (students[studentId]) {
  document.querySelector(".student-header h2").innerText = students[studentId].name;
  document.querySelector(".student-header p").innerText = students[studentId].class;

  const list = document.querySelector(".risk-explanation");
  list.innerHTML = "";

  students[studentId].reasons.forEach(reason => {
    const li = document.createElement("li");
    li.textContent = "• " + reason;
    list.appendChild(li);
  });
}
document.querySelectorAll(".login-card").forEach(card => {
  card.addEventListener("click", () => {
    const role = card.dataset.role;

    // MVP: simulação de login
    if (role === "student") {
      window.location.href = "student/dashboard.html";
    }
    if (role === "teacher") {
      window.location.href = "teacher/dashboard.html";
    }
    if (role === "manager") {
      alert("Painel do gestor em breve");
    }
  });
});
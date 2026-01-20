document.addEventListener("DOMContentLoaded", () => {

  const alertsContainer = document.getElementById("alertsContainer");

  const alerts = [
    {
      title: "Atenção à prova",
      description: "Você tem uma avaliação de matemática amanhã.",
      level: "medium",
      levelLabel: "Atenção"
    }
  ];

  if (alerts.length === 0) {
    alertsContainer.innerHTML = `
      <section class="empty-state">
        <h4>Nenhum alerta</h4>
        <p>Você está em dia. Continue assim 👏</p>
      </section>
    `;
  } else {
    alerts.forEach(alert => {
      const card = document.createElement("article");
      card.className = `alert-card ${alert.level}`;

      card.innerHTML = `
        <h4>${alert.title}</h4>
        <p>${alert.description}</p>
        <span class="risk-level">${alert.levelLabel}</span>
      `;

      alertsContainer.appendChild(card);
    });
  }

});
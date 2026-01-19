export function generateMessage(context) {
  const { type, name, details } = context;

  const messages = {
    absence: [
      `Oi ${name}, sentimos sua falta hoje. Está tudo bem?`,
      `${name}, percebemos sua ausência. Se precisar de apoio, estamos aqui.`,
    ],
    exam: [
      `${name}, boa sorte na prova de ${details.subject}! Você consegue 💙`,
      `Lembrete gentil: prova de ${details.subject} amanhã. Respira fundo 😉`,
    ],
    wellbeing: [
      `${name}, notamos que você não está se sentindo tão bem. Quer conversar?`,
      `Cuidar de você também é importante. Estamos por perto.`,
    ],
    achievement: [
      `Parabéns ${name}! 🎉 Sua frequência essa semana foi excelente.`,
      `${name}, mandou muito bem essa semana! Continue assim 👏`,
    ]
  };

  const pool = messages[type] || [];
  return pool[Math.floor(Math.random() * pool.length)];
}
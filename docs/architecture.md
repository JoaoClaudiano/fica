Perfeito.
Abaixo está TUDO consolidado, já no formato exato de arquivo Markdown, pronto para você criar o arquivo e colar sem adaptar nada.

📁 Caminho do arquivo (atenção ao nome):
docs/architecture.md
(use exatamente esse nome, sem acento)

⸻


# 🏗️ Arquitetura do Sistema — FICA  
**Frequência, Inclusão e Cuidado Ativo**

---

## 1. Visão Geral

O **FICA** é uma plataforma web de acompanhamento educacional e bem-estar escolar, criada para **prevenir a evasão escolar de forma preditiva, ética e empática**.

A arquitetura foi projetada para atender aos seguintes princípios:

- **Mobile-first e acessível**
- **Baixo custo de implantação**
- **Escalabilidade via serviços serverless**
- **Transparência algorítmica (IA explicável)**
- **Centralidade do cuidado humano**

---

## 2. Visão Arquitetural Geral

O sistema adota uma arquitetura **desacoplada**, dividida em três camadas principais:

┌──────────────────────────────────┐
│            Frontend              │
│     Web App Estático (public/)   │
│  HTML • CSS • JavaScript         │
└───────────────┬──────────────────┘
│
▼
┌──────────────────────────────────┐
│            Firebase              │
│  Authentication • Firestore •    │
│  Cloud Messaging                 │
└───────────────┬──────────────────┘
│
▼
┌──────────────────────────────────┐
│         Cloud Functions          │
│  Risk Engine • Notificações      │
│  Empáticas                       │
└──────────────────────────────────┘

Essa abordagem elimina a necessidade de servidores dedicados, reduz custos operacionais e facilita a adoção por escolas públicas e redes educacionais.

---

## 3. Frontend — Camada de Interface

📁 **Local:** `public/`

O frontend do FICA é uma aplicação web estática, desenvolvida sem frameworks pesados, priorizando:

- Compatibilidade com dispositivos móveis
- Baixo consumo de dados
- Acessibilidade (WCAG)
- Facilidade de manutenção

### 3.1 Organização

public/
├── index.html
├── manifest.json
├── assets/
├── styles/
├── scripts/
├── views/
└── components/

### 3.2 Responsabilidades

- Exibir dashboards por perfil (aluno, professor)
- Coletar dados de frequência e bem-estar
- Apresentar feedbacks empáticos
- Consumir dados do Firestore via serviços
- Garantir navegação acessível e clara

---

## 4. Firebase — Camada de Serviços

### 4.1 Autenticação

📌 **Firebase Authentication**

- Login seguro
- Controle de acesso por perfil
- Redirecionamento automático pós-login

Cada usuário acessa apenas as interfaces e dados compatíveis com seu papel no sistema.

---

### 4.2 Banco de Dados

📌 **Firestore**

O Firestore armazena:

- Dados de estudantes
- Registros de frequência
- Autoavaliações de bem-estar
- Casos de acompanhamento
- Históricos do índice de risco

As **regras de segurança** garantem privacidade e conformidade com a LGPD.

---

## 5. Cloud Functions — Camada de Inteligência

📁 **Local:** `functions/`

As Cloud Functions concentram toda a lógica sensível do sistema, evitando decisões críticas no frontend.

---

### 5.1 Risk Engine (Índice de Risco de Evasão)

📁 `functions/riskEngine/`

O Risk Engine calcula um **Índice de Risco de Evasão** a partir da combinação de múltiplos fatores:

- Frequência escolar
- Tendência de desempenho
- Autoavaliação de bem-estar
- Histórico recente de interação

#### Saída do algoritmo:
```json
{
  "level": "baixo | médio | alto",
  "score": 0-100,
  "explanation": "explicação textual compreensível"
}

📌 O sistema não toma decisões automáticas.
O índice funciona como sinal de atenção, apoiando a atuação humana.

⸻

### 5.2 Notificações Empáticas

📁 functions/notifications/

As notificações são disparadas com base em eventos e tendências, utilizando linguagem não punitiva, como:
	•	Reconhecimento de progresso
	•	Convites ao diálogo
	•	Apoio em momentos críticos

Exemplo:

“Percebemos que sua semana foi diferente. Se quiser conversar, estamos aqui.”

⸻

## 6. Fluxo de Cuidado Educacional

O FICA estrutura o acompanhamento como um fluxo de cuidado, não de punição:
	1.	O aluno interage com a plataforma
	2.	Dados são registrados no Firestore
	3.	O Risk Engine analisa tendências
	4.	Alertas são gerados para professores
	5.	O professor registra ações de acompanhamento
	6.	O sistema acompanha a evolução ao longo do tempo

📌 Toda intervenção é humana e contextualizada.

⸻

## 7. Escalabilidade e Sustentabilidade
	•	Arquitetura serverless permite escalar sob demanda
	•	Ideal para pilotos gratuitos em escolas públicas
	•	Compatível com modelos open source / open core
	•	Baixo custo de manutenção

⸻

## 8. Considerações Éticas e Técnicas
	•	O sistema não aplica sanções automáticas
	•	Os critérios de risco são explicáveis
	•	Os dados são usados exclusivamente para apoio educacional
	•	O FICA respeita princípios de transparência, cuidado e responsabilidade social

⸻

## 9. Conclusão

A arquitetura do FICA foi concebida para atuar antes da evasão, combinando tecnologia, educação e ética.

Mais do que monitorar dados, o sistema apoia relações de cuidado entre alunos, professores e a comunidade escolar.

---

## ✅ Próximo passo sugerido (opcional)

Quando você quiser, posso:
- gerar o **`docs/ethics.md`** no mesmo nível
- gerar o **`docs/roadmap.md`**
- ou escrever a **metodologia formal do Índice de Risco**

Agora você tem um **documento de arquitetura de nível edital**.
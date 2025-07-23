class VideoQuiz {
  constructor(videoElement, quizData) {
    this.video = videoElement;
    this.quizzes = quizData;
    this.currentQuiz = null;
    this.score = 0;
    this.userAnswers = {};
    this.init();
  }

  init() {
    // Criar estrutura do quiz
    this.createQuizContainer();

    // Monitorar tempo do vídeo
    this.video.addEventListener("timeupdate", this.checkQuizTime.bind(this));
    this.preventSeeking();
    // document.querySelector('.progress-container').classList.add('disabled');
  }

  createQuizContainer() {
    this.quizContainer = document.createElement("div");
    this.quizContainer.className = "quiz-container hidden";
    this.quizContainer.innerHTML = `
      <div class="quiz-modal">
        <h3 class="quiz-question"></h3>
        <div class="quiz-options"></div>
        <button class="quiz-submit">Continuar Vídeo</button>
      </div>
    `;
    document
      .querySelector(".video-player-container")
      .appendChild(this.quizContainer);
  }

  checkQuizTime() {
    const currentTime = Math.floor(this.video.currentTime);

    // Debug: mostre no console para verificar
    console.log(`Tempo atual: ${currentTime}s`);

    // Verifique todos os quizzes não respondidos
    this.quizzes.forEach((quiz) => {
      if (
        !this.userAnswers[quiz.id] &&
        currentTime >= quiz.time &&
        currentTime < quiz.time + 2
      ) {
        this.showQuiz(quiz);
      }
    });
  }

  showQuiz(quiz) {
    this.currentQuiz = quiz;
    this.video.pause();

    const modal = this.quizContainer.querySelector(".quiz-modal");
    modal.querySelector(".quiz-question").textContent = quiz.question;

    const optionsContainer = modal.querySelector(".quiz-options");
    optionsContainer.innerHTML = "";

    quiz.options.forEach((option, index) => {
      const optionEl = document.createElement("div");
      optionEl.className = "quiz-option";

      if (quiz.multiple) {
        optionEl.innerHTML = `
          <input type="checkbox" id="opt-${index}" name="quiz-${quiz.id}" value="${option.value}">
          <label for="opt-${index}">${option.text}</label>
        `;
      } else {
        optionEl.innerHTML = `
          <input type="radio" id="opt-${index}" name="quiz-${quiz.id}" value="${option.value}">
          <label for="opt-${index}">${option.text}</label>
        `;
      }

      optionsContainer.appendChild(optionEl);
    });

    // Atualizar botão de submit
    const submitBtn = modal.querySelector(".quiz-submit");
    submitBtn.onclick = this.submitQuiz.bind(this);

    if (quiz.multiple) {
      submitBtn.textContent = "Selecione uma ou mais opções e continue";
    }

    this.quizContainer.classList.remove("hidden");
  }

  preventSeeking() {
    let wasPlaying = !this.video.paused;

    this.video.addEventListener("seeking", (e) => {
      // Encontre o quiz mais recente não respondido
      const nextQuiz = this.quizzes.find(
        (q) => !this.userAnswers[q.id] && q.time > this.video.currentTime
      );

      if (nextQuiz) {
        // Volte para após o último quiz respondido
        const lastAnsweredTime =
          Math.max(
            ...this.quizzes
              .filter((q) => this.userAnswers[q.id])
              .map((q) => q.time)
          ) || 0;

        this.video.currentTime = lastAnsweredTime;
        if (wasPlaying) this.video.play();
      }
    });
  }

  submitQuiz() {
    const selectedOptions = [
      ...this.quizContainer.querySelectorAll("input:checked"),
    ].map((input) => input.value);

    if (selectedOptions.length === 0) {
      alert("Por favor, selecione pelo menos uma opção!");
      return;
    }

    // Calcular pontuação
    const quizScore = selectedOptions.reduce(
      (sum, val) => sum + parseInt(val),
      0
    );
    this.score += quizScore;

    // Salvar resposta
    this.userAnswers[this.currentQuiz.id] = {
      options: selectedOptions,
      score: quizScore,
    };

    // Salvar no storage
    QuizStorage.saveAnswers(this.userAnswers);
    QuizStorage.saveScore(this.score);

    // Continuar vídeo
    this.quizContainer.classList.add("hidden");
    this.video.play();
  }
}

// Exemplo de dados do quiz (pode ser carregado via API)
const sampleQuizzes = [
  {
    id: "q1",
    time: 30, // 2 minutos em segundos
    question: "Qual seu nível de experiência com Programação?",
    multiple: false,
    options: [
      { text: "Iniciante", value: 1 },
      { text: "Intermediário", value: 2 },
      { text: "Avançado", value: 3 },
      { text: "Especialista", value: 4 },
    ],
  },
  {
    id: "q2",
    time: 60, // 4 minutos
    question: "Quais desses tópicos te interessam? (Selecione vários)",
    multiple: true,
    options: [
      { text: "Desenvolvedor Frontend", value: 1 },
      { text: "Desenvolvedor Backend", value: 1 },
      { text: "Desenvolvedor FullStack", value: 2 },
      { text: "Desenvolvedor Games", value: 1 },
    ],
  },
];

window.VideoQuiz = VideoQuiz;
window.sampleQuizzes = sampleQuizzes;
class VideoQuiz {
  constructor(videoElement, quizData, videoOptions) {
    this.video = videoElement;
    this.quizzes = quizData;
    this.videoOptions = videoOptions; // {pontuacaoMinima: 'video_id'}
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.userAnswers = {};
    this.init();
  }

  init() {
    this.createQuizContainer();
    this.video.addEventListener('ended', this.showAllQuizzes.bind(this));
    this.preventSeeking();
  }

  createQuizContainer() {
    this.quizContainer = document.createElement("div");
    this.quizContainer.className = "quiz-container hidden";
    this.quizContainer.innerHTML = `
      <div class="quiz-modal">
        <div class="quiz-progress">Pergunta ${this.currentQuestionIndex + 1} de ${this.quizzes.length}</div>
        <h3 class="quiz-question"></h3>
        <div class="quiz-options"></div>
        <button class="quiz-submit">Continuar</button>
      </div>
    `;
    document.querySelector(".video-player-container").appendChild(this.quizContainer);
  }

  showAllQuizzes() {
    // Sai do fullscreen se estiver em mobile
    if (this.isMobile() && document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        this.showQuizAfterFullscreen();
      }).catch(err => {
        console.error("Erro ao sair do fullscreen:", err);
        this.showQuiz(this.quizzes[this.currentQuestionIndex]);
      });
    } else {
      this.video.pause();
      if (this.quizzes.length > 0) {
        this.showQuiz(this.quizzes[this.currentQuestionIndex]);
      }
    }
  }

  showQuizAfterFullscreen() {
    // Espera a transição do fullscreen completar
    setTimeout(() => {
      this.video.pause();
      this.showQuiz(this.quizzes[this.currentQuestionIndex]);
    }, 300);
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  showQuiz(quiz) {
    this.currentQuiz = quiz;
    
    const modal = this.quizContainer.querySelector(".quiz-modal");
    modal.querySelector(".quiz-progress").textContent = 
      `Pergunta ${this.currentQuestionIndex + 1} de ${this.quizzes.length}`;
    
    const questionText = quiz.multiple ? `${quiz.question} (Selecione todas que se aplicam)` : quiz.question;

    modal.querySelector(".quiz-question").textContent = questionText;
    
    const optionsContainer = modal.querySelector(".quiz-options");
    optionsContainer.innerHTML = "";

    quiz.options.forEach((option, index) => {
      const optionEl = document.createElement("div");
      optionEl.className = "quiz-option";

      const inputType = quiz.multiple ? "checkbox" : "radio";
      
      optionEl.innerHTML = `
        <input type="${inputType}" id="opt-${index}" name="quiz-${quiz.id}" value="${option.value}">
        <label for="opt-${index}">${option.text}</label>
      `;

      optionsContainer.appendChild(optionEl);
    });

    const submitBtn = modal.querySelector(".quiz-submit");
    submitBtn.textContent = this.currentQuestionIndex < this.quizzes.length - 1 ? "Próxima Pergunta" : "Finalizar";
    submitBtn.onclick = this.submitQuiz.bind(this);

    this.quizContainer.classList.remove("hidden");
    this.quizContainer.classList.add("visible");
  }

  submitQuiz() {
    const selectedOptions = [
      ...this.quizContainer.querySelectorAll("input:checked"),
    ].map(input => parseInt(input.value));

    if (selectedOptions.length === 0) {
      alert("Por favor, selecione pelo menos uma opção!");
      return;
    }

    // Calcular pontuação
    const quizScore = selectedOptions.reduce((sum, val) => sum + val, 0);
    this.score += quizScore;
    
    // Salvar resposta
    this.userAnswers[this.currentQuiz.id] = {
      options: selectedOptions,
      score: quizScore
    };

    // Avançar para próxima pergunta ou finalizar
    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex < this.quizzes.length) {
      this.showQuiz(this.quizzes[this.currentQuestionIndex]);
    } else {
      this.finalizeQuiz();
    }
  }

  finalizeQuiz() {
    // Esconder quiz
    this.quizContainer.classList.add("hidden");
    
    // Determinar próximo vídeo baseado na pontuação
    const nextVideo = this.determineNextVideo();
    
    // Mostrar resumo e redirecionar
    this.showResultsSummary(nextVideo);
  }

  determineNextVideo() {
    // Ordena as pontuações mínimas em ordem decrescente
    const sortedOptions = Object.entries(this.videoOptions)
      .sort((a, b) => b[0] - a[0]);
    
    // Encontra o primeiro vídeo onde a pontuação mínima é menor ou igual à pontuação do usuário
    for (const [minScore, videoId] of sortedOptions) {
      if (this.score >= parseInt(minScore)) {
        return videoId;
      }
    }
    
    // Retorna o vídeo padrão se nenhum for encontrado
    return sortedOptions[sortedOptions.length - 1][1];
  }

  showResultsSummary(nextVideo) {
    const summaryContainer = document.createElement("div");
    summaryContainer.className = "quiz-summary";
    summaryContainer.innerHTML = `
      <div class="summary-modal">
        <h3>Diagnóstico Concluído!</h3>
        <p>Com base nos seus resultados, recomendamos o próximo vídeo:</p>
        <button id="next-video-btn" data-video-id="${nextVideo}">
          Assistir Próximo Vídeo
        </button>
      </div>
    `;
    
    document.body.appendChild(summaryContainer);
    
    document.getElementById("next-video-btn").addEventListener("click", (e) => {
      const videoId = e.target.dataset.videoId;
      // this.loadNewVideo(videoId);
      window.location.href = `${window.location.pathname}?video=${videoId}`;
      document.body.removeChild(summaryContainer);
    });
  }

  loadNewVideo(videoId) {
    // Simula a troca de vídeo - na implementação real, você carregaria o novo vídeo
    this.video.src = `videos/${videoId}.mp4`;
    this.video.load();
    this.video.play();
    
    // Reinicia o quiz para o novo vídeo
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.userAnswers = {};
  }

  preventSeeking() {
    let wasPlaying = !this.video.paused;

    this.video.addEventListener("seeking", (e) => {
      if (this.video.currentTime > this.video.duration - 10) {
        this.video.currentTime = this.video.duration - 10;
        if (wasPlaying) this.video.play();
      }
    });
  }
}

// Dados estáticos para teste
const sampleQuizzes = [
  {
    id: "q1",
    question: "Como você avalia a relação entre sua atividade física e sua capacidade de aprendizado?",
    multiple: false,
    options: [
      {text: "Não pratico atividade física regularmente", value: 1},
      {text: "Pratico ocasionalmente", value: 2},
      {text: "Mantenho uma rotina", value: 3}
    ]
  },
  {
    id: "q2",
    question: "Quais emoções são mais frequentes durante seu aprendizado?",
    multiple: true,
    options: [
      {text: "Ansiedade", value: 1},
      {text: "Desmotivação", value: 1},
      {text: "Alegria", value: 2},
      {text: "Motivação", value: 3}
    ]
  }
];

// Mapeamento de pontuação mínima para vídeos
const videoOptions = {
  0: "video_iniciante",  // Pontuação >= 0
  5: "video_intermediario",  // Pontuação >= 5
  8: "video_avancado"  // Pontuação >= 8
};

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
  // Obtém o vídeo da URL ou usa o padrão
  const urlParams = new URLSearchParams(window.location.search);
  const videoParam = urlParams.get('video') || 'video_iniciante';
  const video = document.getElementById("main-video");
  const quiz = new VideoQuiz(video, sampleQuizzes, videoOptions);
  video.src = `videos/${videoParam}.mp4`;
  
  // Desativa a barra de progresso
  // document.querySelector('.progress-container').style.pointerEvents = 'none';
});
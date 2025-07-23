document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("main-video");
  const playPauseBtn = document.querySelector(".play-pause-btn");
  const centerPlayBtn = document.querySelector(".center-play-btn");
  const progressBar = document.querySelector(".progress-bar");
  const progressContainer = document.querySelector(".progress-container");
  const volumeBtn = document.querySelector(".volume-btn");
  const volumeSlider = document.querySelector(".volume-slider");
  const currentTimeEl = document.querySelector(".current-time");
  const durationEl = document.querySelector(".duration");
  const fullscreenBtn = document.querySelector(".fullscreen-btn");
  const loadingSpinner = document.querySelector(".loading-spinner");
  let controlsTimeout;
  const controlsContainer = document.querySelector(".controls-container");
  const MOUSE_MOVE_THRESHOLD = 200; 

  // Função para formatar o tempo (mm:ss)
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Atualizar barra de progresso e tempo
  function updateProgress() {
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(video.currentTime);
  }

  // Definir duração do vídeo quando metadados estiverem carregados
  video.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(video.duration);
  });

  // Play/Pause
  function togglePlay() {
    if (video.paused) {
      video.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      centerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
      controlsContainer.classList.add('visible');
    } else {
      video.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      centerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  }

  playPauseBtn.addEventListener("click", togglePlay);
  centerPlayBtn.addEventListener("click", togglePlay);

  // Atualizar progresso
  video.addEventListener("timeupdate", updateProgress);

  // Clicar na barra de progresso
  progressContainer.addEventListener("click", (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = video.duration;
    video.currentTime = (clickX / width) * duration;
  });

  // Controle de volume
  volumeBtn.addEventListener("click", () => {
    if (video.volume > 0) {
      video.volume = 0;
      volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
      video.volume = volumeSlider.value;
      updateVolumeIcon();
    }
  });

  volumeSlider.addEventListener("input", () => {
    video.volume = volumeSlider.value;
    updateVolumeIcon();
  });

  function updateVolumeIcon() {
    if (video.volume === 0) {
      volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (video.volume < 0.5) {
      volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
      volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
  }

  // Tela cheia
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.querySelector(".video-player-container").requestFullscreen();
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      document.exitFullscreen();
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
  });

  // Mostrar/ocultar controles quando o mouse está sobre o vídeo
  const videoContainer = document.querySelector(".video-container");
  videoContainer.addEventListener("mouseenter", () => {
    controlsContainer.classList.add("visible");

    // Resetar o timeout para ocultar
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (!video.paused) {
        controlsContainer.classList.remove("visible");
      }
    }, MOUSE_MOVE_THRESHOLD);
  });

  videoContainer.addEventListener("mouseleave", () => {
    if (!video.paused) {
      controlsContainer.classList.remove("visible");
    }
  });

  controlsContainer.addEventListener("mousemove", (e) => {
    e.stopPropagation(); // Previne o evento de chegar no videoContainer
    clearTimeout(controlsTimeout); // Cancela o hide enquanto interage
  });

  // Loading spinner
  video.addEventListener("waiting", () => {
    loadingSpinner.style.display = "block";
  });

  video.addEventListener("playing", () => {
    loadingSpinner.style.display = "none";
  });

  // Proteção contra download (simplificada)
  document.addEventListener("contextmenu", (e) => {
    if (e.target.tagName === "VIDEO") {
      e.preventDefault();
      alert("Ações de download não são permitidas.");
    }
  });

  // Desabilitar atalhos de teclado
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "VIDEO" || e.target === document.body) {
      if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        alert("Ações de download não são permitidas.");
      }
    }
  });
  const quiz = new VideoQuiz(video, sampleQuizzes);
});


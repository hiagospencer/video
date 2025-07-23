class QuizStorage {
  static saveAnswers(answers) {
    localStorage.setItem('videoQuizAnswers', JSON.stringify(answers));
  }
  
  static getAnswers() {
    return JSON.parse(localStorage.getItem('videoQuizAnswers')) || {};
  }
  
  static saveScore(score) {
    localStorage.setItem('videoQuizScore', score);
  }
  
  static getScore() {
    return parseInt(localStorage.getItem('videoQuizScore')) || 0;
  }
  
  static clear() {
    localStorage.removeItem('videoQuizAnswers');
    localStorage.removeItem('videoQuizScore');
  }
}
window.QuizStorage = QuizStorage;
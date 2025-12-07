/**
 * Main quiz application shell with state machine
 * States: HOME -> SETUP_NAME -> SETUP_CATEGORY -> SETUP_COUNT -> PLAYING -> RESULTS -> HOME
 */
const States = {
  HOME: "home",
  SETUP_NAME: "setup-name",
  SETUP_CATEGORY: "setup-category",
  SETUP_COUNT: "setup-count",
  PLAYING: "playing",
  RESULTS: "results",
};

class QuizApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // App state
    this.state = States.HOME;
    this.quizData = {
      sessionId: null,
      username: null,
      category: null,
      questionCount: 10,
      questions: [],
      currentIndex: 0,
      score: 0,
      answers: [],
    };
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for state transition events from child components
    this.shadowRoot.addEventListener("quiz-start", () => {
      this.transition(States.SETUP_NAME);
    });

    this.shadowRoot.addEventListener("name-selected", (e) => {
      this.quizData.username = e.detail;
      this.transition(States.SETUP_CATEGORY);
    });

    this.shadowRoot.addEventListener("category-selected", (e) => {
      this.quizData.category = e.detail;
      this.transition(States.SETUP_COUNT);
    });

    this.shadowRoot.addEventListener("count-selected", async (e) => {
      this.quizData.questionCount = e.detail;
      await this.startQuiz();
      this.transition(States.PLAYING);
    });

    this.shadowRoot.addEventListener("setup-back", () => {
      this.transition(States.SETUP_CATEGORY);
    });

    this.shadowRoot.addEventListener("answer-submitted", (e) => {
      const { currentScore, isComplete, answer } = e.detail;
      this.quizData.score = currentScore;
      this.quizData.answers.push(answer);
      this.quizData.currentIndex++;

      if (isComplete) {
        this.transition(States.RESULTS);
      } else {
        this.render();
      }
    });

    this.shadowRoot.addEventListener("play-again", () => {
      this.resetQuiz();
      this.transition(States.HOME);
    });
  }

  async startQuiz() {
    const body = {
      amount: this.quizData.questionCount,
      username: this.quizData.username,
      categoryId: this.quizData.category?.id,
      categoryName: this.quizData.category?.name,
    };

    const response = await fetch("/api/quiz/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    this.quizData.sessionId = data.sessionId;
    this.quizData.questions = data.questions;
  }

  resetQuiz() {
    this.quizData = {
      sessionId: null,
      username: null,
      category: null,
      questionCount: 10,
      questions: [],
      currentIndex: 0,
      score: 0,
      answers: [],
    };
  }

  transition(newState) {
    this.state = newState;
    this.render();
  }

  render() {
    const content = this.getContentForState();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          min-height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>

      <div class="container fade-in">
        ${content}
      </div>
    `;
  }

  getContentForState() {
    switch (this.state) {
      case States.HOME:
        return "<quiz-home></quiz-home>";

      case States.SETUP_NAME:
        return "<quiz-setup-name></quiz-setup-name>";

      case States.SETUP_CATEGORY:
        return "<quiz-setup-category></quiz-setup-category>";

      case States.SETUP_COUNT:
        return `<quiz-setup-count category="${this.quizData.category?.name || ""}"></quiz-setup-count>`;

      case States.PLAYING:
        const question = this.quizData.questions[this.quizData.currentIndex];
        return `
          <quiz-game
            question="${encodeURIComponent(JSON.stringify(question))}"
            current="${this.quizData.currentIndex + 1}"
            total="${this.quizData.questions.length}"
            score="${this.quizData.score}"
            session-id="${this.quizData.sessionId}"
            question-index="${this.quizData.currentIndex}"
          ></quiz-game>
        `;

      case States.RESULTS:
        return `
          <quiz-results
            score="${this.quizData.score}"
            total="${this.quizData.questions.length}"
          ></quiz-results>
        `;

      default:
        return "<quiz-home></quiz-home>";
    }
  }
}

customElements.define("quiz-app", QuizApp);

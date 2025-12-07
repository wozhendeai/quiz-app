/**
 * Main quiz application shell with state machine
 * States: HOME -> SETUP_CATEGORY -> SETUP_COUNT -> PLAYING -> RESULTS -> HOME
 * Auth: LOGIN, SIGNUP, PROFILE
 * Routes: /, /login, /signup, /profile
 */
const States = {
  HOME: "home",
  LOGIN: "login",
  SIGNUP: "signup",
  PROFILE: "profile",
  SETUP_CATEGORY: "setup-category",
  SETUP_COUNT: "setup-count",
  PLAYING: "playing",
  RESULTS: "results",
};

// Map URL paths to states
const RouteToState = {
  "/": States.HOME,
  "/login": States.LOGIN,
  "/signup": States.SIGNUP,
  "/profile": States.PROFILE,
};

// Map states to URL paths (only for routable states)
const StateToRoute = {
  [States.HOME]: "/",
  [States.LOGIN]: "/login",
  [States.SIGNUP]: "/signup",
  [States.PROFILE]: "/profile",
};

class QuizApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // App state
    this.state = States.HOME;
    this.user = null;
    this.authChecked = false;
    this.quizData = {
      sessionId: null,
      category: null,
      questionCount: 10,
      questions: [],
      currentIndex: 0,
      score: 0,
      answers: [],
    };
  }

  async connectedCallback() {
    this.render();
    await this.checkAuth();
    this.handleInitialRoute();
    this.setupEventListeners();

    // Handle browser back/forward navigation
    window.addEventListener("popstate", () => {
      this.handleInitialRoute();
    });
  }

  handleInitialRoute() {
    const path = window.location.pathname;
    const stateFromRoute = RouteToState[path];

    if (stateFromRoute) {
      // Protected route check
      if ((stateFromRoute === States.PROFILE) && !this.user) {
        this.navigate(States.LOGIN);
        return;
      }
      this.state = stateFromRoute;
      this.render();
    }
  }

  navigate(newState, updateUrl = true) {
    this.state = newState;

    // Update URL for routable states
    if (updateUrl && StateToRoute[newState]) {
      history.pushState({ state: newState }, "", StateToRoute[newState]);
    }

    this.render();
  }

  async checkAuth() {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      this.user = data.user;
    } catch {
      this.user = null;
    }
    this.authChecked = true;
    this.render();
  }

  setupEventListeners() {
    // Auth events - use navigate() for URL updates
    this.shadowRoot.addEventListener("go-login", () => {
      this.navigate(States.LOGIN);
    });

    this.shadowRoot.addEventListener("go-signup", () => {
      this.navigate(States.SIGNUP);
    });

    this.shadowRoot.addEventListener("go-profile", () => {
      this.navigate(States.PROFILE);
    });

    this.shadowRoot.addEventListener("go-home", () => {
      this.navigate(States.HOME);
    });

    this.shadowRoot.addEventListener("auth-success", (e) => {
      this.user = e.detail;
      this.navigate(States.HOME);
    });

    this.shadowRoot.addEventListener("logout", async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      this.user = null;
      this.navigate(States.HOME);
    });

    // Quiz events - use transition() (no URL change for quiz flow)
    this.shadowRoot.addEventListener("quiz-start", () => {
      if (!this.user) {
        this.navigate(States.LOGIN);
        return;
      }
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
      this.navigate(States.HOME);
    });
  }

  async startQuiz() {
    const body = {
      amount: this.quizData.questionCount,
      categoryId: this.quizData.category?.id,
      categoryName: this.quizData.category?.name,
    };

    const response = await fetch("/api/quiz/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        this.user = null;
        this.transition(States.LOGIN);
        return;
      }
      throw new Error(error.error || "Failed to start quiz");
    }

    const data = await response.json();
    this.quizData.sessionId = data.sessionId;
    this.quizData.questions = data.questions;
  }

  resetQuiz() {
    this.quizData = {
      sessionId: null,
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

        .loading {
          text-align: center;
          padding: 4rem;
          color: #666;
        }
      </style>

      <div class="container fade-in">
        ${content}
      </div>
    `;
  }

  getContentForState() {
    if (!this.authChecked) {
      return '<div class="loading">Loading...</div>';
    }

    switch (this.state) {
      case States.HOME:
        return `<quiz-home user='${this.user ? JSON.stringify(this.user) : ""}'></quiz-home>`;

      case States.LOGIN:
        return "<auth-login></auth-login>";

      case States.SIGNUP:
        return "<auth-signup></auth-signup>";

      case States.PROFILE:
        return "<user-profile></user-profile>";

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
        return `<quiz-home user='${this.user ? JSON.stringify(this.user) : ""}'></quiz-home>`;
    }
  }
}

customElements.define("quiz-app", QuizApp);

/**
 * Homepage component with start button and leaderboard preview
 */
class QuizHome extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.shadowRoot.querySelector(".start-btn").addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("quiz-start", { bubbles: true, composed: true })
      );
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .home {
          text-align: center;
          padding: 2rem 0;
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          color: #1a1a2e;
        }

        .subtitle {
          color: #666;
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        .start-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 3rem;
          font-size: 1.25rem;
          border-radius: 50px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          font-weight: 600;
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .start-btn:active {
          transform: translateY(0);
        }

        .leaderboard-section {
          margin-top: 3rem;
        }
      </style>

      <div class="home">
        <h1>Quiz Time</h1>
        <p class="subtitle">Test your knowledge across various categories</p>

        <button class="start-btn">Start Quiz</button>

        <div class="leaderboard-section">
          <leaderboard-preview></leaderboard-preview>
        </div>
      </div>
    `;
  }
}

customElements.define("quiz-home", QuizHome);
